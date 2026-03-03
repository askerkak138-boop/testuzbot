"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [role, setRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">(
    "STUDENT"
  );
  const [studentName, setStudentName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let credentials: any = { role };

      if (role === "STUDENT") {
        credentials.studentName = studentName;
        credentials.telegramUsername = telegramUsername;
      } else {
        credentials.code = code;
      }

      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        if (role === "STUDENT") {
          router.push("/student");
        } else if (role === "TEACHER") {
          router.push("/teacher");
        } else {
          router.push("/admin");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 TestUzBot</h1>
          <p className="text-gray-600">Onlayn test tizimi</p>
        </div>

        {/* ROLE TANLASH */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setRole("STUDENT");
              setError("");
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
              role === "STUDENT"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            👨‍🎓 O'quvchi
          </button>
          <button
            onClick={() => {
              setRole("TEACHER");
              setError("");
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
              role === "TEACHER"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            👨‍🏫 O'qituvchi
          </button>
          <button
            onClick={() => {
              setRole("ADMIN");
              setError("");
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
              role === "ADMIN"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            🔒 Admin
          </button>
        </div>

        {/* LOGIN FORMI */}
        <form onSubmit={handleLogin} className="space-y-4">
          {role === "STUDENT" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ism Familya
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Aliyev Vali"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telegram (ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </>
          )}

          {(role === "TEACHER" || role === "ADMIN") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {role === "ADMIN" ? "Admin Kod" : "O'qituvchi Kod"}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Kirish..." : "KIRISH"}
          </button>
        </form>

        {role === "ADMIN" && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Admin:</strong> Maxfiy kod: D1yoRBeK
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
