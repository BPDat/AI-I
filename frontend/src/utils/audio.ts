export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer();
}

export const preferredMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

export function pickSupportedMimeType(): string | undefined {
  for (const t of preferredMimeTypes) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}