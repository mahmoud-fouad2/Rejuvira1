"use client";

export const MAX_UPLOAD_SOURCE_BYTES = 12 * 1024 * 1024;
export const MAX_DIRECT_UPLOAD_BYTES = 6 * 1024 * 1024;
const MAX_OUTPUT_SIDE = 1920;
const RASTER_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read selected image."));
    image.src = src;
  });
}

export async function prepareImageUpload(file: File): Promise<File> {
  if (file.size > MAX_UPLOAD_SOURCE_BYTES) {
    throw new Error("Image is too large. Please choose a file under 12 MB.");
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
    const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Image compression is not available in this browser.");
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (output) => (output ? resolve(output) : reject(new Error("Could not compress image."))),
        "image/webp",
        0.84,
      );
    });

    if (blob.size > MAX_DIRECT_UPLOAD_BYTES) {
      throw new Error("Compressed image is still too large. Please crop it or choose a smaller file.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
