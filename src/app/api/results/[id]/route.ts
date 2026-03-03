import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await prisma.testResult.findUnique({
      where: { id: params.id },
      include: {
        test: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Natija topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json(
      { error: "Server xatosi" },
      { status: 500 }
    );
  }
}
