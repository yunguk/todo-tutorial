import Link from "next/link"
import { TodoList } from "@/components/todo-list"
import { AuroraText } from "@/components/ui/aurora-text"

export default function Page() {
  const title = (
    <h1 className="text-3xl font-bold tracking-tight">
      ✨ <AuroraText>Todo</AuroraText>
    </h1>
  )

  return (
    <div className="flex min-h-svh justify-center p-6">
      <div className="flex w-full max-w-md min-w-0 flex-col gap-6">
        <div>
          {title}
          <p className="font-mono text-xs text-muted-foreground">
            (Press <kbd>d</kbd> to toggle dark mode)
          </p>
        </div>
        <TodoList />
        <div className="flex justify-center gap-4">
          <Link
            href="/cat-facts"
            className="text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            🐱 고양이 상식 보러가기
          </Link>
          <Link
            href="/"
            className="text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            🐱 O/X 퀴즈 풀어보기
          </Link>
        </div>
      </div>
    </div>
  )
}
