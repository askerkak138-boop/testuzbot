import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

// TEST OLISH (GET)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const testCode = searchParams.get("testCode");

    const test = await prisma.test.findFirst({
      where: {
        subject: subject as any,
        testCode: testCode || undefined,
        status: "ACTIVE",
      },
      include: {
        questions: true,
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: "Test topilmadi. Kodni tekshiring." },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Server xatosi" },
      { status: 500 }
    );
  }
}

// TEST YARATISH (POST) - O'QITUVCHI UCHUN
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Ruxsat yo'q. O'qituvchi bo'lishingiz kerak." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { subject, testCode, questionCount, scoringMode, questions } = body;

    // Tekshirish
    if (!subject || !testCode || !questionCount || !questions?.length) {
      return NextResponse.json(
        { error: "Hamma maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    if (questionCount < 10 || questionCount > 90) {
      return NextResponse.json(
        { error: "Savollar soni 10-90 orasida bo'lishi kerak" },
        { status: 400 }
      );
    }

    // Test yaratish
    const test = await prisma.test.create({
      data: {
        subject,
        testCode: testCode.toUpperCase(),
        questionCount,
        scoringMode,
        createdById: session.user.id,
        questions: {
          createMany: {
            data: questions.map((q: any, idx: number) => ({
              questionNumber: idx + 1,
              question: q.question,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctAnswer: q.correctAnswer,
            })),
          },
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: "Server xatosi" },
      { status: 500 }
    );
  }
}
