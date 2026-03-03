import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

// O'QITUVCHILARNI OLISH
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const users = await prisma.user.findMany({
      where: {
        role: role as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teacherCode: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Server xatosi" },
      { status: 500 }
    );
  }
}

// O'QITUVCHI QO'SHISH
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Faqat admin qo'sha oladi
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Ruxsat yo'q" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, role, teacherCode } = body;

    if (!name || !role) {
      return NextResponse.json(
        { error: "Hamma maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    // Kod tekshirish
    if (role === "TEACHER" && !teacherCode) {
      return NextResponse.json(
        { error: "O'qituvchi uchun kod kerak" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        role,
        teacherCode: role === "TEACHER" ? teacherCode : undefined,
        email: `${role.toLowerCase()}-${Date.now()}@testuzbot.local`,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu kod allaqachon ishlatilgan" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Server xatosi" },
      { status: 500 }
    );
  }
}
