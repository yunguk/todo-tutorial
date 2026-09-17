export interface QuizQuestion {
  id: string;
  statementKo: string;
  isTrue: boolean;
}

interface StatementPair {
  id: string;
  trueText: string;
  falseText: string;
}

// Cat Facts API(catfact.ninja)는 참인 사실만 제공하므로, 알려진 사실에 대한 거짓 변형을 직접 짝지어 둔다.
const CAT_FACTS_FALSE_VARIANTS: Record<string, string> = {
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

// meowfacts.herokuapp.com은 요청마다 무작위 문장을 반환해 특정 문장에 거짓 변형을
// 실시간으로 짝짓기 어렵다. 대신 이 API가 실제로 제공하는 사실 중 일부를 골라
// 참/거짓 쌍을 정적으로 작성해 둔다(출처: meowfacts.herokuapp.com).
const CARE_FACT_PAIRS: StatementPair[] = [
  {
    id: "care-0",
    trueText:
      "The Maine Coon is 4 to 5 times larger than the Singapura, the smallest breed of cat.",
    falseText:
      "The Maine Coon and the Singapura are almost exactly the same size.",
  },
  {
    id: "care-1",
    trueText: "A cat can sprint at about thirty-one miles per hour.",
    falseText:
      "A cat can sprint at about five miles per hour, slower than most humans walk.",
  },
  {
    id: "care-2",
    trueText:
      "Owning a cat can reduce the risk of stroke and heart attack by a third.",
    falseText:
      "Owning a cat has been shown to increase the risk of stroke and heart attack.",
  },
  {
    id: "care-3",
    trueText:
      "In ancient Egypt, when a family cat died, all family members would shave their eyebrows as a sign of mourning.",
    falseText:
      "In ancient Egypt, families would throw a celebration and paint their faces when a family cat died.",
  },
  {
    id: "care-4",
    trueText: "80% of orange cats are male.",
    falseText: "80% of orange cats are female.",
  },
  {
    id: "care-5",
    trueText:
      "A cat’s whiskers are thought to be a kind of radar, which helps a cat gauge the space it intends to walk through.",
    falseText:
      "A cat’s whiskers have no sensory function and exist only for decoration.",
  },
  {
    id: "care-6",
    trueText:
      "Not every cat gets “high” from catnip; whether a cat responds to it depends on a recessive gene.",
    falseText:
      "Every single cat, without exception, gets “high” from catnip regardless of genetics.",
  },
  {
    id: "care-7",
    trueText: "A cat can jump up to six times its own length.",
    falseText: "A cat can jump at most about half its own length.",
  },
  {
    id: "care-8",
    trueText: "A cat’s field of vision is about 185 degrees.",
    falseText:
      "A cat’s field of vision is about 90 degrees, narrower than a human’s.",
  },
  {
    id: "care-9",
    trueText: "A cat can spend five or more hours a day grooming itself.",
    falseText:
      "A cat rarely grooms itself, spending less than five minutes a day on it.",
  },
  {
    id: "care-10",
    trueText:
      "Cats have individual preferences for scratching surfaces and angles; some scratch horizontally while others prefer vertical surfaces.",
    falseText:
      "All cats prefer the exact same scratching surface and angle with no individual variation.",
  },
  {
    id: "care-11",
    trueText:
      "The Maine Coon is the only cat breed native to America with a long-haired coat.",
    falseText:
      "The Maine Coon originated in Siberia and was imported to America in the 1900s.",
  },
];

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

async function getCatFactsPairs(): Promise<StatementPair[]> {
  try {
    const res = await fetch("https://catfact.ninja/facts?limit=10", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const body = (await res.json()) as { data: { fact: string }[] };
    return body.data
      .filter((item) => item.fact in CAT_FACTS_FALSE_VARIANTS)
      .map((item, index) => ({
        id: `factapi-${index}`,
        trueText: item.fact,
        falseText: CAT_FACTS_FALSE_VARIANTS[item.fact],
      }));
  } catch {
    return [];
  }
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function getQuizQuestions(count = 5): Promise<QuizQuestion[]> {
  const catFactsPairs = await getCatFactsPairs();
  const pool = shuffle([...catFactsPairs, ...CARE_FACT_PAIRS]);
  const selected = pool.slice(0, count);

  return Promise.all(
    selected.map(async (pair, index) => {
      const isTrue = Math.random() < 0.5;
      const englishStatement = isTrue ? pair.trueText : pair.falseText;
      const statementKo = await translateToKorean(englishStatement);
      return {
        id: `${index}-${pair.id}`,
        statementKo,
        isTrue,
      };
    })
  );
}
