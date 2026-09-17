import { getQuizQuestions } from "@/lib/cat-quiz";
import { QuizPlayer } from "@/components/quiz-player";

export default async function CatQuizPage() {
  const questions = await getQuizQuestions();

  return (
    <div className="flex min-h-svh justify-center p-6">
      <div className="flex w-full max-w-md min-w-0 flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            🐱 고양이 O/X 퀴즈
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            문장을 읽고 참(O)인지 거짓(X)인지 골라보세요.
          </p>
        </div>
        <QuizPlayer questions={questions} />
      </div>
    </div>
  );
}
