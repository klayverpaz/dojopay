import imageCompression from "browser-image-compression";

export async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
      initialQuality: 0.85,
    });
    return compressed;
  } catch {
    return file;
  }
}
