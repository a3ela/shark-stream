"use server";

import connectDB from "@/lib/db";
import Site from "@/lib/models/sites";
import Category from "@/lib/models/categories";

export async function getSites() {
  await connectDB();
  const sites = await Site.find()
    .populate("category", "name slug icon")
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(sites));
}

export async function getCategories() {
  await connectDB();
  const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}
