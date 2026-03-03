import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        studentName: { label: "Full Name", type: "text" },
        telegramUsername: { label: "Telegram", type: "text" },
        role: { label: "Role", type: "hidden" },
        code: { label: "Code", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { studentName, telegramUsername, role, code } = credentials;

        // O'QUVCHI KIRISHI
        if (role === "STUDENT") {
          if (!studentName || studentName.trim() === "") {
            throw new Error("Ism familani kiriting");
          }

          return {
            id: `student-${Date.now()}`,
            name: studentName,
            email: `student-${Date.now()}@testuzbot.local`,
            role: "STUDENT",
            telegramUsername: telegramUsername || null,
          };
        }

        // O'QITUVCHI KIRISHI
        if (role === "TEACHER") {
          if (!code) {
            throw new Error("Kod kiriting");
          }

          const teacher = await prisma.user.findFirst({
            where: {
              role: "TEACHER",
              teacherCode: code,
            },
          });

          if (!teacher) {
            throw new Error("Kod noto'g'ri");
          }

          return {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            role: "TEACHER",
          };
        }

        // ADMIN KIRISHI
        if (role === "ADMIN") {
          if (code !== process.env.ADMIN_CODE) {
            throw new Error("Admin kod noto'g'ri");
          }

          return {
            id: "admin",
            name: "Admin",
            email: "admin@testuzbot.local",
            role: "ADMIN",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.telegramUsername = user.telegramUsername;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.telegramUsername = token.telegramUsername;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
