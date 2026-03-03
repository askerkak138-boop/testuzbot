import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// NATIJA YARATISH (TEST TOPSHIRILDI)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testId, studentName, telegramUsername, answers, scoringMode, questions } = body;

    // Javoblarni tekshirish va ball hisoblash
    const userAnswers = [];
    let totalScore = 0;

    for (const question of questions) {
      const selectedAnswer = answers[question.questionNumber];
      const isCorrect = selectedAnswer === question.correctAnswer;

      let score = 0;
      if (isCorrect) {
        if (scoringMode === "GENERAL") {
          score = 1;
        } else if (scoringMode === "SPECIAL") {
          if (question.questionNumber <= 30) score = 1.1;
          else if (question.questionNumber <= 60) score = 2.1;
          else score = 3.1;
        }
      }

      totalScore += score;

      userAnswers.push({
        questionNumber: question.questionNumber,
        selectedAnswer,
        isCorrect,
        score,
      });
    }

    // Max ball hisoblash
    let maxScore = 0;
    if (scoringMode === "GENERAL") {
      maxScore = questions.length;
    } else {
      maxScore = 30 * 1.1 + 30 * 2.1 + 30 * 3.1;
    }

    const percentage = (totalScore / maxScore) * 100;

    // Natijani saqla
    const result = await prisma.testResult.create({
      data: {
        testId,
        userId: `student-${Date.now()}`,
        studentName,
        telegramUsername,
        totalScore,
        percentage,
        answers: {
          createMany: {
            data: userAnswers,
          },
        },
      },
      include: {
        answers: true,
        test: true,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error saving result:", error);
    return NextResponse.json(
      { error: "Server xatosi" },
      { status: 500 }
    );
  }
}

// NATIJALARNI OLISH
export async function GET(req: NextRequest) {
  try {
    const results = await prisma.testResult.findMany({
      include: {
        test: true,
        answers: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Server xatosi" },
      { status: 500 }
    );
  }
}
