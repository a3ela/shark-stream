import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/ai";
import { getSites } from "@/lib/actions/sites";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Fetch current sites and categories from the database for grounding
    const sites = await getSites();

    const compactSitesList = sites.map((s: {
      _id: string;
      name: string;
      url: string;
      category?: { name?: string } | string;
      ads?: string;
      quality?: string;
      tags?: string[];
      requiresLogin?: boolean;
      verified?: boolean;
    }) => ({
      id: s._id,
      name: s.name,
      url: s.url,
      category: typeof s.category === "object" ? s.category?.name : s.category,
      ads: s.ads ?? "none",
      quality: s.quality || "HD",
      tags: s.tags || [],
      requiresLogin: Boolean(s.requiresLogin),
      verified: Boolean(s.verified),
    }));

    const systemInstruction = `You are "Shark AI", the helpful assistant for "Shark Stream" (a curated streaming directory).
Your goal is to guide users to the best streaming sites, anime platforms, sports hubs, and media directories.

Here is the live directory database of sites currently indexed on Shark Stream:
${JSON.stringify(compactSitesList, null, 2)}

Instructions:
1. Recommend only relevant sites from our indexed database when possible.
2. If the user asks for specific features (e.g. "no ads", "1080p", "anime", "live football"), check the site metadata ('ads', 'quality', 'tags', 'category') and prioritize the best matching sites.
3. Advise users on safety, such as whether an ad-blocker is recommended if a site has "high" ads.
4. Format recommendations cleanly with site name, url in markdown ([Site Name](url)), category, quality, and a brief note why it fits.
5. If no site in our database matches what they want, politely explain and suggest the closest alternative or let them know they can submit a request on the /request page.
6. Keep answers friendly, punchy, and concise.`;

    const ai = getGeminiClient();

    // Build chat contents from history + current message
    const formattedContents = [
      ...(Array.isArray(history)
        ? history.slice(-6).map((h: { role: string; text: string }) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }],
          }))
        : []),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    const reply = response.text || "I'm having trouble thinking of a recommendation right now. Please try again!";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "AI service temporarily unavailable";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
