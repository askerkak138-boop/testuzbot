"use client";

import { useState, useEffect } from "react";
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

export default function TeacherPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"add" | "monitor">("add");

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (session?.user?.role !== "TEACHER") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* HEADER */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              O'qituvchi Paneli 👨‍🏫
            </h1>
            <p className="text-gray-600">Test yaratish va monitoring</p>
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
            onClick={() => setActiveTab("add")}
            className={`px-8 py-3 rounded-lg font-bold transition ${
              activeTab === "add"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            ➕ Test Qo'shish
          </button>
          <button
            onClick={() => setActiveTab("monitor")}
            className={`px-8 py-3 rounded-lg font-bold transition ${
              activeTab === "monitor"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            📊 Monitoring
          </button>
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === "add" && <AddTestForm />}
          {activeTab === "monitor" && <MonitoringPanel />}
        </div>
      </div>
    </div>
  );
}

// ============ TEST QOSHISH FORMASI ============
function AddTestForm() {
  const [formData, setFormData] = useState({
    subject: "",
    testCode: "",
    questionCount: 30,
    scoringMode: "GENERAL",
    questions: [
      {
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "A",
        },
      ],
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData({
        ...formData,
        questions: formData.questions.filter((_, i) => i !== index),
      });
    }
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Tekshirish
      if (!formData.subject || !formData.testCode) {
        throw new Error("Fan va test kodini to'ldiring");
      }

      if (formData.questionCount < 10 || formData.questionCount > 90) {
        throw new Error("Savollar soni 10-90 orasida bo'lishi kerak");
      }

      if (formData.questions.length !== formData.questionCount) {
        throw new Error(
          `${formData.questionCount} ta savol kerak, lekin ${formData.questions.length} ta bor`
        );
      }

      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Test qo'shishda xato");
      }

      setSuccess("✅ Test muvaffaqiyatli qo'shildi!");
      
      // Formani reset qilish
      setFormData({
        subject: "",
        testCode: "",
        questionCount: 30,
        scoringMode: "GENERAL",
        questions: [
          {
            question: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "A",
          },
        ],
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SUCCESS/ERROR MESSAGES */}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {/* TEST ASOSIY SOZLAMALARI */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Test Sozlamalari</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* FAN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📖 Fanni tanlang:
            </label>
            <select
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            >
              <option value="">-- Tanlang --</option>
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* TEST KODI */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔐 Test kodi (masalan: 11):
            </label>
            <input
              type="text"
              value={formData.testCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  testCode: e.target.value.toUpperCase(),
                })
              }
              required
              placeholder="11"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {/* SAVOLLAR SONI */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Savollar soni (10-90):
            </label>
            <input
              type="number"
              min="10"
              max="90"
              value={formData.questionCount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  questionCount: parseInt(e.target.value),
                })
              }
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {/* BALL TARTIBI */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⭐ Ball tartibi:
            </label>
            <select
              value={formData.scoringMode}
              onChange={(e) =>
                setFormData({ ...formData, scoringMode: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            >
              <option value="GENERAL">
                Umumiy (har biri 1 ball)
              </option>
              <option value="SPECIAL">
                Mahsus (30li 1.1, 30li 2.1, 30li 3.1)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* SAVOLLAR */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            📋 Savollar ({formData.questions.length}/{formData.questionCount})
          </h3>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {formData.questions.map((q, idx) => (
            <div key={idx} className="border-2 border-gray-300 p-4 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800">Savol #{idx + 1}</h4>
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ❌ O'chirish
                  </button>
                )}
              </div>

              {/* SAVOL MATN */}
              <input
                type="text"
                placeholder="Savol matnini kiriting"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(idx, "question", e.target.value)
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:border-green-500"
              />

              {/* VARIANTLAR */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {["A", "B", "C", "D"].map((option) => (
                  <input
                    key={option}
                    type="text"
                    placeholder={`${option}. Javob`}
                    value={q[`option${option}` as keyof typeof q] || ""}
                    onChange={(e) =>
                      handleQuestionChange(
                        idx,
                        `option${option}`,
                        e.target.value
                      )
                    }
                    required
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                  />
                ))}
              </div>

              {/* TO'G'RI JAVOB */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✅ To'g'ri javobni tanlang:
                </label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(idx, "correctAnswer", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* SAVOL QO'SHISH TUGMASI */}
        {formData.questions.length < formData.questionCount && (
          <button
            type="button"
            onClick={handleAddQuestion}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold transition"
          >
            ➕ Savol Qo'shish
          </button>
        )}

        {formData.questions.length === formData.questionCount && (
          <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
            ✅ Barcha savollar qo'shildi!
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={loading || formData.questions.length !== formData.questionCount}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "⏳ Saqlanyotgan..." : "💾 TESTNI SAQLASH"}
      </button>
    </form>
  );
}

// ============ MONITORING PANELI ============
function MonitoringPanel() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((r) =>
    filter ? r.test.testCode.includes(filter.toUpperCase()) : true
  );

  // Eng yuqori ballni topish (teng bo'lsa eng birinchi)
  const topResult = [...filteredResults].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
  })[0];

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-lg">Natijalar yuklanyotgan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* FILTER */}
      <div>
        <input
          type="text"
          placeholder="Test kodi orqali qidirish (masalan: 11)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
        />
      </div>

      {/* NATIJALAR JADVALI */}
      {filteredResults.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="px-4 py-3 font-bold">O'quvchi Ismi</th>
                <th className="px-4 py-3 font-bold">Test Kodi</th>
                <th className="px-4 py-3 font-bold">Ball</th>
                <th className="px-4 py-3 font-bold">Foiz %</th>
                <th className="px-4 py-3 font-bold">Sana</th>
                <th className="px-4 py-3 font-bold">Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr
                  key={result.id}
                  className={`border-b hover:bg-gray-50 transition ${
                    result.id === topResult?.id ? "bg-yellow-50 border-2 border-yellow-400" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">
                    {result.id === topResult?.id && "🏆 "}
                    {result.studentName}
                  </td>
                  <td className="px-4 py-3 font-mono">{result.test.testCode}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">
                    {result.totalScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    <span
                      className={
                        result.percentage >= 80
                          ? "text-green-600"
                          : result.percentage >= 60
                          ? "text-yellow-600"
                          : "text-red-600"
                      }
                    >
                      {result.percentage.toFixed(1)}%
                    </span>
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
          <p className="text-lg">Natijalar topilmadi</p>
        </div>
      )}

      {/* REFRESH BUTTON */}
      <button
        onClick={fetchResults}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition"
      >
        🔄 Yangilash
      </button>
    </div>
  );
}
