export const MAX_PATIENT_DOCUMENT_BYTES = 8 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_PATIENT_DOCUMENT_BYTES + 64 * 1024;

export async function readPatientDocumentForm(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  if (!request.body || !/^multipart\/form-data;/i.test(type)) {
    throw new Error("Invalid document form.");
  }
  if (Number(request.headers.get("content-length")) > MAX_MULTIPART_BYTES) {
    throw new RangeError("Document exceeds the upload limit.");
  }

  let size = 0;
  const limited = request.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      size += chunk.byteLength;
      if (size > MAX_MULTIPART_BYTES) {
        controller.error(new RangeError("Document exceeds the upload limit."));
      } else {
        controller.enqueue(chunk);
      }
    },
  }));
  return new Response(limited, { headers: { "Content-Type": type } }).formData();
}

export function patientDocumentFormat(bytes: Uint8Array) {
  const pdf = [37, 80, 68, 70, 45];
  if (pdf.every((byte, i) => byte === bytes[i])) {
    return { mime: "application/pdf", extension: "pdf", type: "PDF" };
  }
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
    return { mime: "image/jpeg", extension: "jpg", type: "JPEG" };
  }
  const png = [137, 80, 78, 71, 13, 10, 26, 10];
  if (png.every((byte, i) => byte === bytes[i])) {
    return { mime: "image/png", extension: "png", type: "PNG" };
  }
  return null;
}
