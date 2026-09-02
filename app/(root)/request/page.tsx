import type { Metadata } from "next";
import { getCategories } from "@/lib/actions/sites";
import RequestForm from "./request-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a Site",
  description: "Suggest a streaming site for review by the Shark Stream team.",
  alternates: { canonical: "/request" },
};

export default async function RequestPage() {
  const categories = await getCategories();
  return (
    <RequestForm
      categories={categories.map((category: { _id: string; name: string }) => ({
        id: category._id,
        name: category.name,
      }))}
    />
  );
}
