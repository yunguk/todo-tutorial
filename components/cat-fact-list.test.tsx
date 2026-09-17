import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatFactList } from "@/components/cat-fact-list";

const facts = [
  { id: "1", fact: "짧은 사실" },
  {
    id: "2",
    fact: "아주 긴 고양이 상식 문장입니다. 이 문장은 미리보기 길이를 넘겨서 목록에서는 줄여서 보여야 합니다.",
  },
];

describe("CatFactList", () => {
  it("목록이 비어있으면 안내 메시지를 보여준다", () => {
    render(<CatFactList facts={[]} />);
    expect(
      screen.getByText("불러올 고양이 상식이 없습니다.")
    ).toBeInTheDocument();
  });

  it("긴 항목은 목록에서 미리보기(줄임)로 표시된다", () => {
    render(<CatFactList facts={facts} />);
    expect(
      screen.getByRole("button", { name: /아주 긴 고양이 상식 문장입니다.*\.\.\./ })
    ).toBeInTheDocument();
  });

  it("항목 클릭 → 전체 설명이 표시된다", async () => {
    const user = userEvent.setup();
    render(<CatFactList facts={facts} />);

    const button = screen.getByRole("button", { name: /아주 긴 고양이/ });
    await user.click(button);

    expect(screen.getByText(facts[1].fact)).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("펼쳐진 항목을 다시 클릭 → 접힌다", async () => {
    const user = userEvent.setup();
    render(<CatFactList facts={facts} />);

    const button = screen.getByRole("button", { name: /아주 긴 고양이/ });
    await user.click(button);
    await user.click(button);

    expect(screen.queryByText(facts[1].fact)).not.toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
