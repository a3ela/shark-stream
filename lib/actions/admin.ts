"use server";

import connectDB from "@/lib/db";
import Category from "@/lib/models/categories";
import Site from "@/lib/models/sites";
import SiteRequest from "@/lib/models/siteRequest";
import { MongoClient } from "mongodb";
import { Types } from "mongoose";
import { getSession } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

declare global {
  var _adminMongoClient: MongoClient | undefined;
}

let client: MongoClient;
if (process.env.NODE_ENV === "development") {
  if (!global._adminMongoClient) {
    global._adminMongoClient = new MongoClient(process.env.MONGODB_URL as string);
  }
  client = global._adminMongoClient;
} else {
  client = new MongoClient(process.env.MONGODB_URL as string);
}
const requestCooldowns = new Map<string, number>();

function requiredText(value: unknown, field: string, max = 500) {
  if (typeof value !== "string") throw new Error(`${field} is required`);
  const text = value.trim();
  if (!text || text.length > max)
    throw new Error(`Enter a valid ${field.toLowerCase()}`);
  return text;
}

function validUrl(value: unknown) {
  const text = requiredText(value, "URL", 2048);
  try {
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch {
    throw new Error("Enter a valid http or https URL");
  }
}

function objectId(value: string, field = "ID") {
  if (!Types.ObjectId.isValid(value))
    throw new Error(`Invalid ${field.toLowerCase()}`);
  return value;
}

function paging(page: number, limit: number) {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 100)
    : 10;
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
    Category.find()
      .sort({ order: 1, name: 1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
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
  const category = await Category.create({
    ...data,
    name: requiredText(data.name, "Name", 100),
    slug: requiredText(data.slug, "Slug", 120).toLowerCase(),
    description: requiredText(data.description, "Description", 500),
    icon: requiredText(data.icon, "Icon", 100),
    order: Number.isFinite(data.order)
      ? Math.max(0, Math.floor(data.order))
      : 0,
  });
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
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
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
  if (linkedSites || linkedRequests)
    throw new Error(
      "Move or remove related sites and requests before deleting this category",
    );
  await Category.findByIdAndDelete(id);
  revalidatePath("/dashboard/categories");
}

// ─── Sites ───────────────────────────────────────────────────────────────────

export async function getPaginatedSites(page = 1, limit = 10, search = "") {
  await requireAdmin();
  await connectDB();

  const pagination = paging(page, limit);
  const normalizedSearch = search.trim();
  const filter = normalizedSearch
    ? {
        $or: [
          { name: { $regex: normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
          { url: { $regex: normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    Site.find(filter)
      .populate("category", "name slug icon")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Site.countDocuments(filter),
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
  ads?: "none" | "low" | "high";
  quality?: string;
  tags?: string[];
  requiresLogin?: boolean;
}) {
  await requireAdmin();
  await connectDB();
  const site = await Site.create({
    ...data,
    name: requiredText(data.name, "Name", 100),
    url: validUrl(data.url),
    logoUrl: data.logoUrl ? validUrl(data.logoUrl) : "",
    category: objectId(data.category, "Category"),
    ads: ["none", "low", "high"].includes(data.ads || "") ? data.ads : "none",
    quality: data.quality?.trim() || "",
    tags: Array.isArray(data.tags)
      ? data.tags.map((t) => t.trim()).filter(Boolean)
      : [],
    requiresLogin: Boolean(data.requiresLogin),
  });
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
    ads: "none" | "low" | "high";
    quality: string;
    tags: string[];
    requiresLogin: boolean;
  }>,
) {
  await requireAdmin();
  await connectDB();
  objectId(id);
  const site = await Site.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
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

export async function getPaginatedUsers(page = 1, limit = 10, search = "", role = "all") {
  await requireAdmin();
  const db = client.db();

  const pagination = paging(page, limit);
  const query: import("mongodb").Filter<import("mongodb").Document> = {};
  const normalizedSearch = search.trim();
  if (normalizedSearch) {
    const escapedSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { email: { $regex: escapedSearch, $options: "i" } },
    ];
  }
  if (role === "admin" || role === "user") query.role = role;
  const [items, total] = await Promise.all([
    db
      .collection("user")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .toArray(),
    db.collection("user").countDocuments(query),
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
  if (session.user.id === userId && role !== "admin")
    throw new Error("You cannot remove your own admin access");
  const db = client.db();
  const { ObjectId } = await import("mongodb");

  await db
    .collection("user")
    .updateOne({ _id: new ObjectId(userId) }, { $set: { role } });

  revalidatePath("/dashboard/users");
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}) {
  await requireAdmin();
  const name = requiredText(data.name, "Name", 100);
  const email = requiredText(data.email, "Email", 254).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email))
    throw new Error("Enter a valid email address");
  if (data.password.length < 8 || data.password.length > 128)
    throw new Error("Password must be between 8 and 128 characters");

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
    await db
      .collection("user")
      .updateOne({ id: res.user.id }, { $set: { role: "admin" } });
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
  customSiteData?: {
    name?: string;
    category?: string;
    ads?: "none" | "low" | "high";
    quality?: string;
    tags?: string[];
    requiresLogin?: boolean;
  },
) {
  await requireAdmin();
  await connectDB();
  objectId(id);
  const request = await SiteRequest.findById(id).lean();
  if (!request) throw new Error("Request not found");
  if (status === "approved") {
    const existingSite = await Site.exists({ url: request.url });
    if (!existingSite) {
      await Site.create({
        name: customSiteData?.name || request.name,
        url: request.url,
        logoUrl: "",
        category: customSiteData?.category || request.categoryId,
        verified: true,
        ads: customSiteData?.ads || request.aiMetadata?.ads || "none",
        quality: customSiteData?.quality || request.aiMetadata?.quality || "1080p",
        tags: customSiteData?.tags || request.aiMetadata?.tags || [],
        requiresLogin:
          typeof customSiteData?.requiresLogin === "boolean"
            ? customSiteData.requiresLogin
            : Boolean(request.aiMetadata?.requiresLogin),
      });
    }
  }
  await SiteRequest.findByIdAndUpdate(
    id,
    { status, notes: notes ? requiredText(notes, "Notes", 1000) : "" },
    { runValidators: true },
  );
  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard/sites");
}

export async function deleteRequest(id: string) {
  await requireAdmin();
  await connectDB();
  objectId(id);
  await SiteRequest.findByIdAndDelete(id);
  revalidatePath("/dashboard/requests");
}

// ─── AI Actions ─────────────────────────────────────────────────────────────

export async function inspectSiteWithAI(targetUrl: string) {
  await requireAdmin();
  await connectDB();
  const url = validUrl(targetUrl);
  const categories = await Category.find({}, "_id name").lean();
  const { analyzeSiteWithGemini } = await import("@/lib/ai");
  const result = await analyzeSiteWithGemini(
    url,
    categories.map((c) => ({ _id: String(c._id), name: c.name }))
  );
  return result;
}

export async function analyzeRequestWithAI(requestId: string) {
  await requireAdmin();
  await connectDB();
  objectId(requestId);
  const request = await SiteRequest.findById(requestId).lean();
  if (!request) throw new Error("Request not found");

  const categories = await Category.find({}, "_id name").lean();
  const { analyzeSiteWithGemini } = await import("@/lib/ai");
  const aiResult = await analyzeSiteWithGemini(
    request.url,
    categories.map((c) => ({ _id: String(c._id), name: c.name }))
  );

  await SiteRequest.findByIdAndUpdate(requestId, {
    aiRecommendation: aiResult.statusRecommendation,
    aiReason: aiResult.recommendationReason,
    aiMetadata: {
      ads: aiResult.ads,
      quality: aiResult.quality,
      tags: aiResult.tags,
      requiresLogin: aiResult.requiresLogin,
      categorySuggestion: aiResult.categorySuggestion,
    },
  });

  revalidatePath("/dashboard/requests");
  return aiResult;
}

// ─── URL Health Check ─────────────────────────────────────────────────────────

type UrlStatus = "live" | "dead" | "redirect" | "blocked";

async function checkOneUrl(url: string): Promise<{ status: UrlStatus; code: number | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    // Try HEAD first (lightweight)
    let res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    // Some servers reject HEAD — retry with GET
    if (res.status === 405) {
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
    }

    clearTimeout(timeoutId);
    const code = res.status;

    if (code >= 200 && code < 300) return { status: "live", code };
    if (code === 301 || code === 302 || code === 307 || code === 308)
      return { status: "redirect", code };
    if (code === 403 || code === 401 || code === 429)
      return { status: "blocked", code };
    return { status: "dead", code };
  } catch {
    clearTimeout(timeoutId);
    return { status: "dead", code: null };
  }
}

export async function checkSiteUrls() {
  await requireAdmin();
  await connectDB();

  const sites = await Site.find({}, "_id name url").lean();

  const results: {
    _id: string;
    name: string;
    url: string;
    status: UrlStatus;
    code: number | null;
  }[] = [];

  // Process in batches of 5 to avoid hammering the server
  const BATCH = 5;
  for (let i = 0; i < sites.length; i += BATCH) {
    const batch = sites.slice(i, i + BATCH);
    const batchResults = await Promise.all(
      batch.map(async (site) => {
        const { status, code } = await checkOneUrl(site.url);
        return {
          _id: String(site._id),
          name: site.name,
          url: site.url,
          status,
          code,
        };
      })
    );
    results.push(...batchResults);
  }

  return results;
}

// ─── Public: Submit Site Request ─────────────────────────────────────────────

export async function submitSiteRequest(data: {
  name: string;
  url: string;
  categoryId: string;
  submittedByEmail: string;
}) {
  try {
    await connectDB();
    const name = requiredText(data.name, "Site name", 100);
    const url = validUrl(data.url);
    const categoryId = objectId(data.categoryId, "Category");
    const email = requiredText(
      data.submittedByEmail,
      "Email",
      254,
    ).toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email))
      return { success: false, error: "Enter a valid email address" };
    const now = Date.now();
    if ((requestCooldowns.get(email) ?? 0) > now - 300_000)
      return {
        success: false,
        error: "Please wait a few minutes before submitting another request.",
      };
    const session = await getSession();
    const req = await SiteRequest.create({
      name,
      url,
      categoryId,
      submittedBy: session?.user.id ?? "anonymous",
      submittedByEmail: session?.user.email ?? email,
    });
    requestCooldowns.set(email, now);

    // Fire-and-forget: run AI analysis in background so admin sees pre-scored results
    void (async () => {
      try {
        const categories = await Category.find({}, "_id name").lean();
        const { analyzeSiteWithGemini } = await import("@/lib/ai");
        const aiResult = await analyzeSiteWithGemini(
          url,
          categories.map((c) => ({ _id: String(c._id), name: c.name }))
        );
        await SiteRequest.findByIdAndUpdate(req._id, {
          aiRecommendation: aiResult.statusRecommendation,
          aiReason: aiResult.recommendationReason,
          aiMetadata: {
            ads: aiResult.ads,
            quality: aiResult.quality,
            tags: aiResult.tags,
            requiresLogin: aiResult.requiresLogin,
            categorySuggestion: aiResult.categorySuggestion,
          },
        });
      } catch {
        // Silent — AI failure should never block the user's submission
      }
    })();

    return { success: true, request: JSON.parse(JSON.stringify(req)) };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit request",
    };
  }
}
