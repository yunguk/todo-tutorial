import { getQuizQuestions } from "@/lib/cat-quiz";

const FACT = "A group of cats is called a “clowder.”";

function stubFetchWithFacts() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.includes("catfact.ninja")) {
        return {
          ok: true,
          json: async () => ({ data: [{ fact: FACT }] }),
        } as Response;
      }
      if (url.includes("mymemory")) {
        const match = url.match(/q=([^&]+)/);
        const original = match ? decodeURIComponent(match[1]) : "";
        return {
          ok: true,
          json: async () => ({
            responseData: { translatedText: `번역:${original}` },
          }),
        } as Response;
      }
      throw new Error(`unexpected url: ${url}`);
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getQuizQuestions", () => {
  it("요청한 개수만큼 문제를 반환한다", async () => {
    stubFetchWithFacts();

    const questions = await getQuizQuestions(5);

    expect(questions).toHaveLength(5);
    questions.forEach((q) => {
      expect(typeof q.statementKo).toBe("string");
      expect(typeof q.isTrue).toBe("boolean");
    });
  });

  it("Cat Facts API에서 확인된 사실도 정적 문제 풀과 함께 번역되어 포함된다", async () => {
    stubFetchWithFacts();

    // 문제 풀 전체를 요청해 Cat Facts 문제가 반드시 포함되도록 한다
    const questions = await getQuizQuestions(100);
    const catFactQuestion = questions.find((q) => q.id.includes("factapi"));

    expect(catFactQuestion).toBeDefined();
    expect(catFactQuestion!.statementKo.startsWith("번역:")).toBe(true);
  });

  it("Cat Facts API 실패 시에도 정적 문제 풀만으로 동작한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("catfact.ninja")) {
          return { ok: false, json: async () => ({}) } as Response;
        }
        return {
          ok: true,
          json: async () => ({
            responseData: { translatedText: "번역됨" },
          }),
        } as Response;
      })
    );

    const questions = await getQuizQuestions(5);

    expect(questions).toHaveLength(5);
    expect(questions.every((q) => !q.id.includes("factapi"))).toBe(true);
  });

  it("번역 API 실패 시 원문으로 폴백한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("catfact.ninja")) {
          return {
            ok: true,
            json: async () => ({ data: [{ fact: FACT }] }),
          } as Response;
        }
        return { ok: false, json: async () => ({}) } as Response;
      })
    );

    const questions = await getQuizQuestions(100);
    const catFactQuestion = questions.find((q) => q.id.includes("factapi"));

    expect(catFactQuestion).toBeDefined();
    expect(catFactQuestion!.statementKo).toMatch(/clowder|pride/i);
  });
});
