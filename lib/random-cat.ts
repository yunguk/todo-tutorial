export async function getRandomCatImageUrl(): Promise<string | null> {
  try {
    const res = await fetch("https://api.thecatapi.com/v1/images/search", {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const body = (await res.json()) as { url?: string }[];
    return typeof body[0]?.url === "string" ? body[0].url : null;
  } catch {
    return null;
  }
}
