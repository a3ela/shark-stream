import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY. Please add your GEMINI_API_KEY in your .env file."
    );
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

export interface SiteAnalysisResult {
  name: string;
  categorySuggestion: string;
  categoryId?: string;
  ads: "none" | "low" | "high";
  quality: string;
  tags: string[];
  requiresLogin: boolean;
  recommendationReason: string;
  statusRecommendation: "approved" | "rejected";
}

export async function analyzeSiteWithGemini(
  targetUrl: string,
  categories: { _id: string; name: string }[]
): Promise<SiteAnalysisResult> {
  const ai = getGeminiClient();

  // Try to fetch page title and meta description safely with timeout
  let pageSnippet = "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeoutId);
    if (resp.ok) {
      const html = await resp.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
      );
      pageSnippet = `Title: ${titleMatch ? titleMatch[1].trim() : "None"}\nMeta Description: ${
        descMatch ? descMatch[1].trim() : "None"
      }`;
    }
  } catch {
    pageSnippet = "Could not fetch direct HTML (site may block bot or be offline).";
  }

  const categoryNames = categories.map((c) => c.name).join(", ");

  const prompt = `You are an expert streaming directory auditor for "Shark Stream".
Analyze the streaming website at URL: "${targetUrl}".
Fetched metadata snippet:
"""
${pageSnippet}
"""

Available categories in our directory: [${categoryNames}]

Please inspect or infer this website's content and streaming characteristics, and return a strict JSON object with these exact keys:
- "name": Clean, user-friendly name of the site (e.g. "9anime", "HiAnime", "StreamEast", "Zoro").
- "categorySuggestion": The single best matching category name from the available categories list.
- "ads": Ad intensity assessment. One of: "none" (if completely clean/no ads), "low" (few standard ads/banners), or "high" (popups, redirects, ad-heavy).
- "quality": Video resolution quality (e.g. "1080p", "4K", "720p", "HD", or "Auto").
- "tags": Array of 2 to 4 concise tags (e.g. ["Sub & Dub", "Anime", "Fast"] or ["Live Sports", "HD Streams"]).
- "requiresLogin": Boolean (true if users must register/sign in to stream, false if free open streaming).
- "recommendationReason": 1-2 concise sentences explaining what this site offers and any safety/quality notes.
- "statusRecommendation": "approved" if it appears to be a legitimate streaming directory candidate, or "rejected" if it is offline, malware, phishing, or completely broken.

Return ONLY the raw JSON object, without backticks or markdown fences.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim() || "{}";
  const parsed = JSON.parse(text);

  // Match category suggestion to existing category id
  const matchedCat = categories.find(
    (c) => c.name.toLowerCase() === (parsed.categorySuggestion || "").toLowerCase()
  );

  return {
    name: parsed.name || new URL(targetUrl).hostname.replace("www.", ""),
    categorySuggestion: matchedCat ? matchedCat.name : parsed.categorySuggestion || categories[0]?.name || "",
    categoryId: matchedCat ? matchedCat._id : categories[0]?._id,
    ads: ["none", "low", "high"].includes(parsed.ads) ? parsed.ads : "low",
    quality: parsed.quality || "1080p",
    tags: Array.isArray(parsed.tags) ? parsed.tags : ["Streaming"],
    requiresLogin: Boolean(parsed.requiresLogin),
    recommendationReason: parsed.recommendationReason || "Analyzed by Gemini AI.",
    statusRecommendation: parsed.statusRecommendation === "rejected" ? "rejected" : "approved",
  };
}
