"use client";

import { useEffect, useState } from "react";
import type { QuizQuestion } from "@/lib/cat-quiz";
import { getRandomCatImageUrl } from "@/lib/random-cat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  questions: QuizQuestion[];
}

export function QuizPlayer({ questions }: QuizPlayerProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [catImageUrl, setCatImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (index >= questions.length) return;

    let cancelled = false;
    getRandomCatImageUrl().then((url) => {
      if (!cancelled) setCatImageUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [index, questions.length]);

  if (questions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        퀴즈를 불러오지 못했습니다.
      </p>
    );
  }

  if (index >= questions.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <p className="text-lg font-semibold">
          {score} / {questions.length} 정답!
        </p>
        <Button
          type="button"
          onClick={() => {
            setScore(0);
            setAnswer(null);
            setIndex(0);
          }}
        >
          게임을 다시 할까요?
        </Button>
      </div>
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function choose(value: boolean) {
    if (answer !== null) return;
    setAnswer(value);
    if (value === question.isTrue) setScore((s) => s + 1);
  }

  function next() {
    setAnswer(null);
    setIndex((i) => i + 1);
  }

  function retry() {
    setAnswer(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        {index + 1} / {questions.length}
      </p>

      {catImageUrl && (
        <img
          src={catImageUrl}
          alt="랜덤 고양이 사진"
          className="h-40 w-full rounded-md object-cover"
        />
      )}

      <p className="rounded-md border border-border p-4 text-sm">
        {question.statementKo}
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={answer === true ? "default" : "outline"}
          className="flex-1"
          disabled={answer !== null}
          onClick={() => choose(true)}
        >
          O (참)
        </Button>
        <Button
          type="button"
          variant={answer === false ? "default" : "outline"}
          className="flex-1"
          disabled={answer !== null}
          onClick={() => choose(false)}
        >
          X (거짓)
        </Button>
      </div>

      {answer !== null && (
        <p
          className={cn(
            "rounded-md border p-3 text-sm",
            answer === question.isTrue
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {answer === question.isTrue ? "정답!" : "오답!"} 이 문장은{" "}
          {question.isTrue ? "참" : "거짓"}입니다.
        </p>
      )}

      {answer !== null && (
        <div className="flex gap-2">
          {answer !== question.isTrue && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={retry}
            >
              다시 풀기
            </Button>
          )}
          <Button type="button" className="flex-1" onClick={next}>
            {isLast ? "결과 보기" : "다음 문제"}
          </Button>
        </div>
      )}
    </div>
  );
}
