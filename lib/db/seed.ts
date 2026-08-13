import { db } from "./index";
import { categories } from "./schema";

async function seed() {
  console.log("Seeding categories...");

  await db.delete(categories);

  await db.insert(categories).values([
    { name: "Movies & Shows", slug: "movies-shows", icon: "movies-shows.svg", order: 1 },
    { name: "Anime", slug: "anime", icon: "anime.svg", order: 2 },
    { name: "Manga", slug: "manga", icon: "manga.svg", order: 3 },
    { name: "Live Sports", slug: "live-sports", icon: "live-sports.svg", order: 4 },
    { name: "Paid", slug: "paid", icon: "paid.svg", order: 5 },
    { name: "Apps", slug: "apps", icon: "apps.svg", order: 6 },
    { name: "Games", slug: "games", icon: "games.svg", order: 7 },
    { name: "Sports", slug: "sports", icon: "sports.svg", order: 8 },
    { name: "Music", slug: "music", icon: "music.svg", order: 9 },
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
