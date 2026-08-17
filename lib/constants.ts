export const categories = [
  { id: 1, name: "Movies & Shows", slug: "movies-shows", icon: "movies-shows.svg", order: 1 },
  { id: 2, name: "Anime", slug: "anime", icon: "anime.svg", order: 2 },
  { id: 3, name: "Manga", slug: "manga", icon: "manga.svg", order: 3 },
  { id: 4, name: "Live Sports", slug: "live-sports", icon: "live-sports.svg", order: 4 },
  { id: 5, name: "Paid", slug: "paid", icon: "paid.svg", order: 5 },
  { id: 6, name: "Apps", slug: "apps", icon: "apps.svg", order: 6 },
  { id: 7, name: "Games", slug: "games", icon: "games.svg", order: 7 },
  { id: 8, name: "Sports", slug: "sports", icon: "sports.svg", order: 8 },
  { id: 9, name: "Music", slug: "music", icon: "music.svg", order: 9 },
];

export type Category = (typeof categories)[number];

export const sites = [
  {
    id: 1,
    name: "Crunchyroll",
    url: "https://crunchyroll.com",
    logoUrl: "https://crunchyroll.com/favicon.ico",
    description: "Stream anime and manga",
    categoryId: 2,
    quality: "good" as const,
    clicks: 0,
    verified: true,
    tags: ["anime", "subbed", "dubbed"],
  },
  {
    id: 2,
    name: "Netflix",
    url: "https://netflix.com",
    logoUrl: "",
    description: "Movies, TV shows, and more",
    categoryId: 1,
    quality: "excellent" as const,
    clicks: 0,
    verified: true,
    tags: ["movies", "shows", "exclusive"],
  },
  {
    id: 3,
    name: "FreeCodeCamp",
    url: "https://freecodecamp.org",
    logoUrl: "",
    description: "Learn to code for free",
    categoryId: 6,
    quality: "excellent" as const,
    clicks: 0,
    verified: false,
    tags: ["education", "coding", "programming"],
  },
];

export type Site = (typeof sites)[number];
