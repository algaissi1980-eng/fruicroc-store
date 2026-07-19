import imageCompression from "browser-image-compression";

/**
 * Compress an image before upload — reduces size by 70–90%.
 * Same pipeline as Candy-hon: webp, max 1200px, ~0.4 MB target.
 */
export async function compressImage(
  file: File,
  options?: { maxSizeMB?: number; maxWidthOrHeight?: number }
): Promise<File> {
  const defaults = {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp" as const,
    initialQuality: 0.82,
  };

  try {
    const compressed = await imageCompression(file, { ...defaults, ...options });
    const webpName = file.name.replace(/\.[^.]+$/, ".webp");
    return new File([compressed], webpName, { type: "image/webp" });
  } catch (error) {
    console.warn("Image compression failed, using original:", error);
    return file;
  }
}
