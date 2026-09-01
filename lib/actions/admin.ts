"use server";

import connectDB from "@/lib/db";
import Category from "@/lib/models/categories";
import Site from "@/lib/models/sites";
import SiteRequest from "@/lib/models/siteRequest";
import { MongoClient } from "mongodb";
import { getSession } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

const client = new MongoClient(process.env.MONGODB_URL as string);

// ─── Auth guard ──────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  await requireAdmin();
  await connectDB();
  const db = client.db();

  const [categories, sites, pendingRequests, users] = await Promise.all([
    Category.countDocuments(),
    Site.countDocuments(),
    SiteRequest.countDocuments({ status: "pending" }),
    db.collection("user").countDocuments(),
  ]);

  return { categories, sites, pendingRequests, users };
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getPaginatedCategories(page = 1, limit = 10) {
  await requireAdmin();
  await connectDB();

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).skip(skip).limit(limit).lean(),
    Category.countDocuments(),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description: string;
  icon: string;
  showEmpty: boolean;
  order: number;
}) {
  await requireAdmin();
  await connectDB();
  const category = await Category.create(data);
  revalidatePath("/dashboard/categories");
  return JSON.parse(JSON.stringify(category));
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    icon: string;
    showEmpty: boolean;
    order: number;
  }>,
) {
  await requireAdmin();
  await connectDB();
  const category = await Category.findByIdAndUpdate(id, data, { new: true }).lean();
  revalidatePath("/dashboard/categories");
  return JSON.parse(JSON.stringify(category));
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await connectDB();
  await Category.findByIdAndDelete(id);
  revalidatePath("/dashboard/categories");
}

// ─── Sites ───────────────────────────────────────────────────────────────────

export async function getPaginatedSites(page = 1, limit = 10) {
  await requireAdmin();
  await connectDB();

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Site.find()
      .populate("category", "name slug icon")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Site.countDocuments(),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createSite(data: {
  name: string;
  url: string;
  logoUrl: string;
  category: string;
  verified: boolean;
}) {
  await requireAdmin();
  await connectDB();
  const site = await Site.create(data);
  revalidatePath("/dashboard/sites");
  return JSON.parse(JSON.stringify(site));
}

export async function updateSite(
  id: string,
  data: Partial<{
    name: string;
    url: string;
    logoUrl: string;
    category: string;
    verified: boolean;
  }>,
) {
  await requireAdmin();
  await connectDB();
  const site = await Site.findByIdAndUpdate(id, data, { new: true }).lean();
  revalidatePath("/dashboard/sites");
  return JSON.parse(JSON.stringify(site));
}

export async function deleteSite(id: string) {
  await requireAdmin();
  await connectDB();
  await Site.findByIdAndDelete(id);
  revalidatePath("/dashboard/sites");
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getPaginatedUsers(page = 1, limit = 10) {
  await requireAdmin();
  const db = client.db();

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    db
      .collection("user")
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("user").countDocuments(),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateUserRole(userId: string, role: "admin" | "user") {
  await requireAdmin();
  const db = client.db();
  const { ObjectId } = await import("mongodb");

  await db
    .collection("user")
    .updateOne({ _id: new ObjectId(userId) }, { $set: { role } });

  revalidatePath("/dashboard/users");
}

export async function createUser(data: { name: string; email: string; password: string; role: "admin" | "user" }) {
  await requireAdmin();
  
  const { auth } = await import("@/lib/auth/auth");
  
  // Call better-auth sign up without passing headers
  // This ensures the new session cookie isn't set on the admin's browser
  const res = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
    } as any,
  });
  
  if (res?.user?.id && data.role === "admin") {
    // Manually set them to admin immediately after creation
    const db = client.db();
    await db.collection("user").updateOne({ id: res.user.id }, { $set: { role: "admin" } });
  }
  
  revalidatePath("/dashboard/users");
  return { success: true };
}

// ─── Site Requests ───────────────────────────────────────────────────────────

export async function getPaginatedRequests(
  page = 1,
  limit = 10,
  status: "pending" | "approved" | "rejected" | "all" = "all",
) {
  await requireAdmin();
  await connectDB();

  const filter = status === "all" ? {} : { status };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    SiteRequest.find(filter)
      .populate("categoryId", "name slug icon")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SiteRequest.countDocuments(filter),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateRequestStatus(
  id: string,
  status: "approved" | "rejected",
  notes?: string,
) {
  await requireAdmin();
  await connectDB();
  await SiteRequest.findByIdAndUpdate(id, { status, notes });
  revalidatePath("/dashboard/requests");
}

export async function deleteRequest(id: string) {
  await requireAdmin();
  await connectDB();
  await SiteRequest.findByIdAndDelete(id);
  revalidatePath("/dashboard/requests");
}

// ─── Public: Submit Site Request ─────────────────────────────────────────────

export async function submitSiteRequest(data: {
  name: string;
  url: string;
  categoryId: string;
  submittedBy: string;
  submittedByEmail: string;
}) {
  await connectDB();
  const req = await SiteRequest.create(data);
  return JSON.parse(JSON.stringify(req));
}
