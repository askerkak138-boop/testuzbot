"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const SUBJECTS = [
  { value: "RIGHTS", label: "🏛️ Huquq" },
  { value: "FOREIGN_LANG", label: "🌐 Chet tili" },
  { value: "IQ", label: "🧠 IQ" },
  { value: "PHYSICS", label: "⚡ Fizika" },
  { value: "MATHEMATICS", label: "📐 Matematika" },
  { value: "CHEMISTRY", label: "🧪 Kimyo" },
  { value: "BIOLOGY", label: "🧬 Biologiya" },
  { value: "HISTORY", label: "📚 Tarix" },
];

export default function StudentPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [testCode, setTestCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Yuklanyotgan...</div>
      </div>
    );
  }

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/tests?subject=${subject}&testCode=${testCode}`);
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Test topilmadi");
      }

      const test = await res.json();
      router.push(`/student/test-taking/${test.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* HEADER */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Assalamu aleykum, {session?.user?.name}! 👋
            </h1>
            <p className="text-gray-600">Test tizimiga xush kelibsiz</p>
          </div>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Chiqish
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Test Tanlang</h2>

          <form onSubmit={handleStartTest} className="space-y-6">
            {/* FANNI TANLASH */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                📖 Fanni tanlang:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition text-lg"
              >
                <option value="">-- Fanni tanlang --</option>
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* TEST KODI */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                🔐 Test kodini kiriting:
              </label>
              <input
                type="text"
                placeholder="Masalan: 11"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition text-lg"
              />
              <p className="text-gray-600 mt-2 text-sm">
                Test kodini o'qituvchi berib berishi kerak
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <p className="font-semibold">Xato:</p>
                <p>{error}</p>
              </div>
            )}

            {/* START BUTTON */}
            <button
              type="submit"
              disabled={loading || !subject || !testCode}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Testni yuklayotgan..." : "▶️ TESTNI BOSHLASH"}
            </button>
          </form>

          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <h3 className="font-bold text-gray-800 mb-2">ℹ️ Quyidagi narsalarni e'tiboringizga oling:</h3>
            <ul className="text-gray-700 space-y-2">
              <li>✅ Testni boshlashdan oldin vaqtingizni tekshiring</li>
              <li>✅ Barcha savolga javob berish kerak</li>
              <li>✅ Testni tugatgandan so'ng natija darhol ko'rsatiladi</li>
              <li>✅ Natija bazaga saqlanadi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
