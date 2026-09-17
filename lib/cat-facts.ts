export interface CatFact {
  id: string;
  fact: string;
}

interface CatFactApiResponse {
  data: { fact: string; length: number }[];
}

// Cat Facts API: https://alexwohlbruck.github.io/cat-facts/
const CAT_FACTS_API_URL = "https://catfact.ninja/facts";

export async function getCatFacts(limit = 10): Promise<CatFact[]> {
  const res = await fetch(`${CAT_FACTS_API_URL}?limit=${limit}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`고양이 상식을 불러오지 못했습니다 (${res.status})`);
  }

  const body = (await res.json()) as CatFactApiResponse;

  return body.data.map((item, index) => ({
    id: `${index}-${item.fact.slice(0, 20)}`,
    fact: item.fact,
  }));
}
