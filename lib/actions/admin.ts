"use server";

import connectDB from "@/lib/db";
import Category from "@/lib/models/categories";
import Site from "@/lib/models/sites";
import SiteRequest from "@/lib/models/siteRequest";
import { MongoClient } from "mongodb";
import { Types } from "mongoose";
import { getSession } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

const client = new MongoClient(process.env.MONGODB_URL as string);
const requestCooldowns = new Map<string, number>();

function requiredText(value: unknown, field: string, max = 500) {
  if (typeof value !== "string") throw new Error(`${field} is required`);
  const text = value.trim();
  if (!text || text.length > max) throw new Error(`Enter a valid ${field.toLowerCase()}`);
  return text;
}

function validUrl(value: unknown) {
  const text = requiredText(value, "URL", 2048);
  try { const url = new URL(text); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); return url.toString(); }
  catch { throw new Error("Enter a valid http or https URL"); }
}

function objectId(value: string, field = "ID") {
  if (!Types.ObjectId.isValid(value)) throw new Error(`Invalid ${field.toLowerCase()}`);
  return value;
}

function paging(page: number, limit: number) {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 100) : 10;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

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

  const pagination = paging(page, limit);
  const [items, total] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).skip(pagination.skip).limit(pagination.limit).lean(),
    Category.countDocuments(),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page: pagination.page,
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
  const category = await Category.create({ ...data, name: requiredText(data.name, "Name", 100), slug: requiredText(data.slug, "Slug", 120).toLowerCase(), description: requiredText(data.description, "Description", 500), icon: requiredText(data.icon, "Icon", 100), order: Number.isFinite(data.order) ? Math.max(0, Math.floor(data.order)) : 0 });
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
  objectId(id);
  const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!category) throw new Error("Category not found");
  revalidatePath("/dashboard/categories");
  return JSON.parse(JSON.stringify(category));
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await connectDB();
  objectId(id);
  const linkedSites = await Site.exists({ category: id });
  const linkedRequests = await SiteRequest.exists({ categoryId: id });
  if (linkedSites || linkedRequests) throw new Error("Move or remove related sites and requests before deleting this category");
  await Category.findByIdAndDelete(id);
  revalidatePath("/dashboard/categories");
}

// ─── Sites ───────────────────────────────────────────────────────────────────

export async function getPaginatedSites(page = 1, limit = 10) {
  await requireAdmin();
  await connectDB();

  const pagination = paging(page, limit);
  const [items, total] = await Promise.all([
    Site.find()
      .populate("category", "name slug icon")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Site.countDocuments(),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page: pagination.page,
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
  const site = await Site.create({ ...data, name: requiredText(data.name, "Name", 100), url: validUrl(data.url), logoUrl: data.logoUrl ? validUrl(data.logoUrl) : "", category: objectId(data.category, "Category") });
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
  objectId(id);
  const site = await Site.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!site) throw new Error("Site not found");
  revalidatePath("/dashboard/sites");
  return JSON.parse(JSON.stringify(site));
}

export async function deleteSite(id: string) {
  await requireAdmin();
  await connectDB();
  objectId(id);
  await Site.findByIdAndDelete(id);
  revalidatePath("/dashboard/sites");
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getPaginatedUsers(page = 1, limit = 10) {
  await requireAdmin();
  const db = client.db();

  const pagination = paging(page, limit);
  const [items, total] = await Promise.all([
    db
      .collection("user")
      .find({})
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .toArray(),
    db.collection("user").countDocuments(),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page: pagination.page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateUserRole(userId: string, role: "admin" | "user") {
  const session = await requireAdmin();
  if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (session.user.id === userId && role !== "admin") throw new Error("You cannot remove your own admin access");
  const db = client.db();
  const { ObjectId } = await import("mongodb");

  await db
    .collection("user")
    .updateOne({ _id: new ObjectId(userId) }, { $set: { role } });

  revalidatePath("/dashboard/users");
}

export async function createUser(data: { name: string; email: string; password: string; role: "admin" | "user" }) {
  await requireAdmin();
  const name = requiredText(data.name, "Name", 100);
  const email = requiredText(data.email, "Email", 254).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address");
  if (data.password.length < 8 || data.password.length > 128) throw new Error("Password must be between 8 and 128 characters");
  
  const { auth } = await import("@/lib/auth/auth");
  
  // Call better-auth sign up without passing headers
  // This ensures the new session cookie isn't set on the admin's browser
  const res = await auth.api.signUpEmail({
    body: {
      email,
      password: data.password,
      name,
    },
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
  const pagination = paging(page, limit);

  const [items, total] = await Promise.all([
    SiteRequest.find(filter)
      .populate("categoryId", "name slug icon")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    SiteRequest.countDocuments(filter),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page: pagination.page,
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
  objectId(id);
  const request = await SiteRequest.findById(id).lean();
  if (!request) throw new Error("Request not found");
  if (status === "approved") {
    const existingSite = await Site.exists({ url: request.url });
    if (!existingSite) await Site.create({ name: request.name, url: request.url, logoUrl: "", category: request.categoryId, verified: false });
  }
  await SiteRequest.findByIdAndUpdate(id, { status, notes: notes ? requiredText(notes, "Notes", 1000) : "" }, { runValidators: true });
  revalidatePath("/dashboard/requests");
}

export async function deleteRequest(id: string) {
  await requireAdmin();
  await connectDB();
  objectId(id);
  await SiteRequest.findByIdAndDelete(id);
  revalidatePath("/dashboard/requests");
}

// ─── Public: Submit Site Request ─────────────────────────────────────────────

export async function submitSiteRequest(data: {
  name: string;
  url: string;
  categoryId: string;
  submittedByEmail: string;
}) {
  await connectDB();
  const name = requiredText(data.name, "Site name", 100);
  const url = validUrl(data.url);
  const categoryId = objectId(data.categoryId, "Category");
  const email = requiredText(data.submittedByEmail, "Email", 254).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { success: false, error: "Enter a valid email address" };
  const now = Date.now();
  if ((requestCooldowns.get(email) ?? 0) > now - 300_000) return { success: false, error: "Please wait a few minutes before submitting another request." };
  const session = await getSession();
  const req = await SiteRequest.create({ name, url, categoryId, submittedBy: session?.user.id ?? "anonymous", submittedByEmail: session?.user.email ?? email });
  requestCooldowns.set(email, now);
  return { success: true, request: JSON.parse(JSON.stringify(req)) };
}
