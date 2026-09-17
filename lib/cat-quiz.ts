export interface QuizQuestion {
  id: string;
  statementKo: string;
  isTrue: boolean;
}

// Cat Facts API는 참인 사실만 제공하므로, 알려진 사실에 대한 거짓 변형을 직접 짝지어 둔다.
const FALSE_VARIANTS: Record<string, string> = {
  "Unlike dogs, cats do not have a sweet tooth. Scientists believe this is due to a mutation in a key taste receptor.":
    "Unlike dogs, cats have an especially strong sweet tooth and love sugary food.",
  "When a cat chases its prey, it keeps its head level. Dogs and humans bob their heads up and down.":
    "When a cat chases its prey, it bobs its head up and down just like dogs and humans do.",
  "The technical term for a cat’s hairball is a “bezoar.”":
    "The technical term for a cat’s hairball is a “furball capsule.”",
  "A group of cats is called a “clowder.”":
    "A group of cats is called a “pride,” the same term used for a group of lions.",
  "A cat can’t climb head first down a tree because every claw on a cat’s paw points the same way. To get down from a tree, a cat must back down.":
    "A cat can easily climb head first down a tree because its claws can point in any direction.",
  "Cats make about 100 different sounds. Dogs make only about 10.":
    "Cats make about 10 different sounds, while dogs make about 100.",
  "Every year, nearly four million cats are eaten in Asia.":
    "Every year, nearly four million cats are adopted as pets in Asia.",
  "There are more than 500 million domestic cats in the world, with approximately 40 recognized breeds.":
    "There are fewer than five million domestic cats in the world, with only three recognized breeds.",
  "Approximately 24 cat skins can make a coat.":
    "Approximately 200 cat skins would be needed to make a single coat.",
  "While it is commonly thought that the ancient Egyptians were the first to domesticate cats, the oldest known pet cat was recently found in a 9,500-year-old grave on the Mediterranean island of Cyprus. This grave predates early Egyptian art depicting cats by 4,000 years or more.":
    "Ancient Egyptians were in fact the very first people in history to ever domesticate cats, with no earlier evidence found anywhere.",
};

async function translateToKorean(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ko`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return text;

  const body = (await res.json()) as {
    responseData?: { translatedText?: string };
  };
  const translated = body.responseData?.translatedText;
  return translated ? translated : text;
}

export async function getQuizQuestions(count = 5): Promise<QuizQuestion[]> {
  const res = await fetch("https://catfact.ninja/facts?limit=10", {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`고양이 퀴즈 데이터를 불러오지 못했습니다 (${res.status})`);
  }

  const body = (await res.json()) as { data: { fact: string }[] };
  const known = body.data
    .filter((item) => item.fact in FALSE_VARIANTS)
    .slice(0, count);

  return Promise.all(
    known.map(async (item, index) => {
      const isTrue = Math.random() < 0.5;
      const englishStatement = isTrue ? item.fact : FALSE_VARIANTS[item.fact];
      const statementKo = await translateToKorean(englishStatement);
      return {
        id: `${index}-${item.fact.slice(0, 10)}`,
        statementKo,
        isTrue,
      };
    })
  );
}
