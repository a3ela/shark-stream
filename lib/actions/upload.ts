"use server";

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { getSession } from "@/lib/auth/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function uploadImageAction(
  formData: FormData,
): Promise<{ url: string }> {
  await requireAdmin();

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "Missing CLOUDINARY_CLOUD_NAME in .env file. Please add your Cloudinary Cloud Name.",
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file provided");
  }

  if (
    !file.type.startsWith("image/") &&
    !file.name.endsWith(".ico") &&
    !file.name.endsWith(".svg")
  ) {
    throw new Error("Please upload an image file (PNG, JPG, WebP, SVG, ICO)");
  }

  // Limit to 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds 5MB limit");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<{ url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "shark-stream",
        resource_type: "auto",
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(new Error(error?.message || "Cloudinary upload failed"));
        } else {
          resolve({ url: result.secure_url });
        }
      },
    );
    uploadStream.end(buffer);
  });
}
