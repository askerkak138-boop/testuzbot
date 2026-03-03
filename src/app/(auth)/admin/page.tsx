"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"teachers" | "reports">("teachers");

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  // Admin faqat kodni orqali kira oladi
  // Session da role ADMIN bo'lsa, ko'rsatamiz

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      {/* HEADER */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🔒 Admin Panel
            </h1>
            <p className="text-gray-600">Tizim boshqaruvi</p>
          </div>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Chiqish
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("teachers")}
            className={`px-8 py-3 rounded-lg font-bold transition ${
              activeTab === "teachers"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            👨‍🏫 O'qituvchilar
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-8 py-3 rounded-lg font-bold transition ${
              activeTab === "reports"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            📊 Barcha Natijalar
          </button>
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === "teachers" && <TeachersManagement />}
          {activeTab === "reports" && <AllReports />}
        </div>
      </div>
    </div>
  );
}

// ============ O'QITUVCHILAR BOSHQARUVI ============
function TeachersManagement() {
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherCode, setNewTeacherCode] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users?role=TEACHER");
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!newTeacherName || !newTeacherCode) {
        throw new Error("Hamma maydonlarni to'ldiring");
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeacherName,
          role: "TEACHER",
          teacherCode: newTeacherCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "O'qituvchi qo'shishda xato");
      }

      setMessageType("success");
      setMessage("✅ O'qituvchi muvaffaqiyatli qo'shildi!");
      setNewTeacherName("");
      setNewTeacherCode("");
      
      setTimeout(() => setMessage(""), 3000);
      fetchTeachers();
    } catch (err: any) {
      setMessageType("error");
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("O'qituvchini o'chirmoqchimisiz?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessageType("success");
        setMessage("✅ O'qituvchi o'chirildi!");
        fetchTeachers();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* YANGI O'QITUVCHI QO'SHISH */}
      <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          ➕ Yangi O'qituvchi Qo'shish
        </h3>

        {message && (
          <div
            className={`mb-4 p-4 rounded border-l-4 ${
              messageType === "success"
                ? "bg-green-100 text-green-700 border-green-500"
                : "bg-red-100 text-red-700 border-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              O'qituvchi Ismi:
            </label>
            <input
              type="text"
              placeholder="Masalan: Aziz O'run"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maxsus Kod (o'qituvchi uchun):
            </label>
            <input
              type="text"
              placeholder="Masalan: TEACHER2024"
              value={newTeacherCode}
              onChange={(e) => setNewTeacherCode(e.target.value.toUpperCase())}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
          >
            {submitting ? "Qo'shilmoqda..." : "O'qituvchi Qo'shish"}
          </button>
        </form>
      </div>

      {/* O'QITUVCHILAR RO'YXATI */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📋 O'qituvchilar Ro'yxati ({teachers.length})
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Yuklanyotgan...</div>
        ) : teachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 font-bold">Ismi</th>
                  <th className="px-4 py-3 font-bold">Maxsus Kod</th>
                  <th className="px-4 py-3 font-bold">Qo'shildi</th>
                  <th className="px-4 py-3 font-bold">Harakati</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{teacher.name}</td>
                    <td className="px-4 py-3 font-mono bg-gray-100 rounded">
                      {teacher.teacherCode}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(teacher.createdAt).toLocaleDateString("uz-UZ")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ❌ O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            O'qituvchilar topilmadi
          </div>
        )}
      </div>
    </div>
  );
}

// ============ BARCHA NATIJALAR ============
function AllReports() {
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTest, setFilterTest] = useState("");

  useEffect(() => {
    fetchAllResults();
  }, []);

  const fetchAllResults = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/results?admin=true");
      if (res.ok) {
        const data = await res.json();
        setAllResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = allResults.filter((r) =>
    filterTest ? r.test.testCode.includes(filterTest.toUpperCase()) : true
  );

  if (loading) {
    return <div className="text-center py-8 text-lg">Natijalar yuklanyotgan...</div>;
  }

  return (
    <div className="space-y-6">
      {/* FILTER */}
      <input
        type="text"
        placeholder="Test kodi orqali qidirish"
        value={filterTest}
        onChange={(e) => setFilterTest(e.target.value)}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
      />

      {/* JADVALI */}
      {filteredResults.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 font-bold">O'quvchi</th>
                <th className="px-4 py-3 font-bold">Fan</th>
                <th className="px-4 py-3 font-bold">Kod</th>
                <th className="px-4 py-3 font-bold">Ball</th>
                <th className="px-4 py-3 font-bold">Foiz %</th>
                <th className="px-4 py-3 font-bold">Sana</th>
                <th className="px-4 py-3 font-bold">Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{result.studentName}</td>
                  <td className="px-4 py-3">{result.test.subject}</td>
                  <td className="px-4 py-3 font-mono">{result.test.testCode}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">
                    {result.totalScore.toFixed(1)}
                  </td>
                  <td
                    className={`px-4 py-3 font-bold ${
                      result.percentage >= 80
                        ? "text-green-600"
                        : result.percentage >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.percentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    {new Date(result.completedAt).toLocaleDateString("uz-UZ")}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(result.completedAt).toLocaleTimeString("uz-UZ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">
          Natijalar topilmadi
        </div>
      )}

      {/* YANGILASH */}
      <button
        onClick={fetchAllResults}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition"
      >
        🔄 Yangilash
      </button>
    </div>
  );
}
