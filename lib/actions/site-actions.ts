"use server";

import { db } from "@/lib/db";
import { sites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createSite(formData: FormData) {
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const logoUrl = (formData.get("logoUrl") as string) || null;
  const description = (formData.get("description") as string) || null;
  const categoryId = formData.get("categoryId") ? Number(formData.get("categoryId")) : null;
  const quality = formData.get("quality") as "excellent" | "good" | "average" | "poor";
  const tags = (formData.get("tags") as string)
    ? (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
    : null;
  const verified = formData.get("verified") === "on";

  await db.insert(sites).values({
    name,
    url,
    logoUrl: logoUrl || "",
    description: description || "",
    categoryId,
    quality,
    verified,
    tags,
  });

  revalidatePath("/admin/sites");
}

export async function updateSite(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const logoUrl = (formData.get("logoUrl") as string) || null;
  const description = (formData.get("description") as string) || null;
  const categoryId = formData.get("categoryId") ? Number(formData.get("categoryId")) : null;
  const quality = formData.get("quality") as "excellent" | "good" | "average" | "poor";
  const tags = (formData.get("tags") as string)
    ? (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
    : null;
  const verified = formData.get("verified") === "on";

  await db
    .update(sites)
    .set({
      name,
      url,
      logoUrl: logoUrl || "",
      description: description || "",
      categoryId,
      quality,
      verified,
      tags,
    })
    .where(eq(sites.id, id));

  revalidatePath("/admin/sites");
}

export async function deleteSite(id: number) {
  await db.delete(sites).where(eq(sites.id, id));
  revalidatePath("/admin/sites");
}
