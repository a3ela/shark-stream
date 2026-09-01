import Banner from "@/components/sites/banner";
import Dectionary from "@/components/sites/dectionary";
import { getSites, getCategories } from "@/lib/actions/sites";

export const dynamic = "force-dynamic";

export default async function HeroBanner() {
  const [sites, categories] = await Promise.all([getSites(), getCategories()]);

  return (
    <>
      <Banner siteCount={sites.length} />
      <Dectionary sites={sites} categories={categories} />
    </>
  );
}
