"use client";

const MAX_UPLOAD_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_DIRECT_UPLOAD_BYTES = 6 * 1024 * 1024;
const MAX_OUTPUT_SIDE = 1920;
const RASTER_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);

function isPassthrough(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    file.type === "application/pdf" ||
    file.type === "image/x-icon" ||
    file.type === "image/vnd.microsoft.icon" ||
    name.endsWith(".ico") ||
    !RASTER_TYPES.has(file.type)
  );
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new window.Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not read selected image."));
    image.src = src;
  });
  if ("decode" in image) {
    try {
      await image.decode();
    } catch {
      // Decode is optional if onload already completed
    }
  }
  return image;
}

export async function prepareImageUpload(file: File): Promise<File> {
  if (file.size > MAX_UPLOAD_SOURCE_BYTES) {
    throw new Error("Image is too large. Please choose a file under 12 MB.");
  }

  // If the file is already within the 6MB limit and is a standard image,
  // pass it directly to avoid any browser canvas rendering/decoding bugs.
  if (file.size <= MAX_DIRECT_UPLOAD_BYTES && RASTER_TYPES.has(file.type)) {
    return file;
  }

  if (isPassthrough(file)) {
    if (file.size > MAX_DIRECT_UPLOAD_BYTES) {
      throw new Error("File is too large. Please choose a file under 6 MB.");
    }
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;

    if (!naturalWidth || !naturalHeight) {
      // If dimensions couldn't be read, fallback to original file if <= 6MB
      if (file.size <= MAX_DIRECT_UPLOAD_BYTES) return file;
      throw new Error("Could not determine image dimensions.");
    }

    const scale = Math.min(
      1,
      MAX_OUTPUT_SIDE / Math.max(naturalWidth, naturalHeight),
    );
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      if (file.size <= MAX_DIRECT_UPLOAD_BYTES) return file;
      throw new Error("Image compression is not available in this browser.");
    }

    context.drawImage(image, 0, 0, width, height);

    const targetType =
      file.type === "image/png" ? "image/png" : "image/webp";
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (output) =>
          output
            ? resolve(output)
            : reject(new Error("Could not compress image.")),
        targetType,
        0.88,
      );
    });

    if (blob.size > MAX_DIRECT_UPLOAD_BYTES) {
      throw new Error(
        "Compressed image is still too large. Please crop it or choose a smaller file.",
      );
    }

    const ext = targetType === "image/png" ? "png" : "webp";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.${ext}`, { type: targetType });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
