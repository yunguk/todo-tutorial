import Link from "next/link";
import { getCatFacts } from "@/lib/cat-facts";
import { CatFactList } from "@/components/cat-fact-list";

export default async function CatFactsPage() {
  const facts = await getCatFacts();

  return (
    <div className="flex min-h-svh justify-center p-6">
      <div className="flex w-full max-w-md min-w-0 flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🐱 고양이 상식</h1>
          <p className="font-mono text-xs text-muted-foreground">
            항목을 누르면 전체 설명이 나타납니다.
          </p>
        </div>
        <CatFactList facts={facts} />
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            🐱 O/X 퀴즈 풀어보기
          </Link>
          <Link
            href="/todo"
            className="text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            ✅ 할 일 관리 보러가기
          </Link>
        </div>
      </div>
    </div>
  );
}
