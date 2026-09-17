import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizPlayer } from "@/components/quiz-player";
import type { QuizQuestion } from "@/lib/cat-quiz";

const questions: QuizQuestion[] = [
  { id: "1", statementKo: "고양이는 물을 아주 좋아한다.", isTrue: false },
  { id: "2", statementKo: "고양이는 밤에도 잘 볼 수 있다.", isTrue: true },
];

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => [{ url: "https://example.com/cat.jpg" }],
    }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("QuizPlayer", () => {
  it("문제가 없으면 안내 메시지를 보여준다", () => {
    render(<QuizPlayer questions={[]} />);
    expect(screen.getByText("퀴즈를 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("정답(X)을 고르면 정답 표시가 나타난다", async () => {
    const user = userEvent.setup();
    render(<QuizPlayer questions={questions} />);

    expect(screen.getByText("고양이는 물을 아주 좋아한다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "X (거짓)" }));

    expect(screen.getByText(/정답!/)).toBeInTheDocument();
  });

  it("오답을 고르면 오답 표시와 '다시 풀기' 버튼이 나타난다", async () => {
    const user = userEvent.setup();
    render(<QuizPlayer questions={questions} />);

    await user.click(screen.getByRole("button", { name: "O (참)" }));

    expect(screen.getByText(/오답!/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다시 풀기" })
    ).toBeInTheDocument();
  });

  it("정답을 고르면 '다시 풀기' 버튼이 나타나지 않는다", async () => {
    const user = userEvent.setup();
    render(<QuizPlayer questions={questions} />);

    await user.click(screen.getByRole("button", { name: "X (거짓)" }));

    expect(
      screen.queryByRole("button", { name: "다시 풀기" })
    ).not.toBeInTheDocument();
  });

  it("'다시 풀기'를 누르면 같은 문제를 다시 풀 수 있다", async () => {
    const user = userEvent.setup();
    render(<QuizPlayer questions={questions} />);

    await user.click(screen.getByRole("button", { name: "O (참)" }));
    expect(screen.getByText(/오답!/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다시 풀기" }));
    expect(screen.queryByText(/오답!/)).not.toBeInTheDocument();
    expect(screen.getByText("고양이는 물을 아주 좋아한다.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "X (거짓)" }));
    expect(screen.getByText(/정답!/)).toBeInTheDocument();
  });

  it("마지막 문제까지 풀면 최종 점수를 보여준다", async () => {
    const user = userEvent.setup();
    render(<QuizPlayer questions={questions} />);

    await user.click(screen.getByRole("button", { name: "X (거짓)" }));
    await user.click(screen.getByRole("button", { name: "다음 문제" }));

    expect(screen.getByText("고양이는 밤에도 잘 볼 수 있다.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "O (참)" }));
    await user.click(screen.getByRole("button", { name: "결과 보기" }));

    expect(screen.getByText("2 / 2 정답!")).toBeInTheDocument();
  });

  it("문제 위에 랜덤 고양이 사진이 표시된다", async () => {
    render(<QuizPlayer questions={questions} />);

    const image = await screen.findByRole("img", { name: "랜덤 고양이 사진" });
    expect(image).toHaveAttribute("src", "https://example.com/cat.jpg");
  });
});
