import { getQuizQuestions } from "@/lib/cat-quiz";

const FACT = "A group of cats is called a “clowder.”";

function mockFetchSequence() {
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
        return {
          ok: true,
          json: async () => ({
            responseData: { translatedText: "고양이 무리는 “클라우더”라고 불린다." },
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
  it("알려진 사실만 걸러 번역된 문제로 만든다", async () => {
    mockFetchSequence();

    const questions = await getQuizQuestions(5);

    expect(questions).toHaveLength(1);
    expect(questions[0].statementKo).toBe(
      "고양이 무리는 “클라우더”라고 불린다."
    );
    expect(typeof questions[0].isTrue).toBe("boolean");
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

    const questions = await getQuizQuestions(5);

    expect(questions).toHaveLength(1);
    // 번역 실패 시 참/거짓 영문 원문 중 하나가 그대로 노출되어야 한다
    expect(questions[0].statementKo).toMatch(/clowder|pride/i);
  });
});
