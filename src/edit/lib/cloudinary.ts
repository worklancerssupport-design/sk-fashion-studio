export async function uploadToCloudinary(file: File, folder = "uploads"): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return { url: data.secure_url, publicId: data.public_id, width: data.width, height: data.height };
}

export function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })), "image/jpeg", quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

export async function compressAndUpload(file: File, maxWidth = 800, quality = 0.7, folder = "uploads") {
  const compressed = await compressImage(file, maxWidth, quality);
  return uploadToCloudinary(compressed, folder);
}

export function selectFromFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}

export function captureFromCamera(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}

export function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.protocol.startsWith("http")) return false;
    const allowedDomains = ["res.cloudinary.com", "images.unsplash.com", "cdn.shopify.com", "i.pinimg.com", "lh3.googleusercontent.com"];
    return allowedDomains.some((d) => u.hostname.includes(d)) || /\.(jpg|jpeg|png|webp|gif)$/i.test(u.pathname);
  } catch { return false; }
}
