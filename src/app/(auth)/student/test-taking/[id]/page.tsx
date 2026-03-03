"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Question {
  id: string;
  questionNumber: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface Test {
  id: string;
  subject: string;
  testCode: string;
  questionCount: number;
  scoringMode: string;
  questions: Question[];
}

export default function TestTaking() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    // Test fayllarni olish
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/tests/${id}`);
        if (!res.ok) throw new Error("Test topilmadi");
        
        const data = await res.json();
        setTest(data);

        // Boshlang'ich javoblarni yaratish
        const initialAnswers: Record<number, string> = {};
        data.questions.forEach((q: Question) => {
          initialAnswers[q.questionNumber] = "";
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error(error);
        alert("Test yuklashda xato");
        router.push("/student");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTest();
    }
  }, [id, router]);

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setAnswers({ ...answers, [questionNumber]: answer });
  };

  const handleSubmit = async () => {
    // Tekshirish: barcha savolga javob berilganni tekshirish
    if (Object.values(answers).some(a => !a)) {
      alert("Barcha savolga javob berish kerak!");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: id,
          studentName: session?.user?.name,
          telegramUsername: session?.user?.telegramUsername,
          answers: answers,
          scoringMode: test?.scoringMode,
          questions: test?.questions,
        }),
      });

      if (!res.ok) throw new Error("Test topshirishda xato");

      const result = await res.json();
      router.push(`/student/results/${result.id}`);
    } catch (error) {
      console.error(error);
      alert("Test topshirishda xato");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Test yuklanyotgan...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-red-600">Test topilmadi</div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const answered = Object.values(answers).filter(a => a).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{test.subject}</h1>
              <p className="text-gray-600">Test kodi: {test.testCode}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800">
                Savol: {currentQuestion + 1} / {test.questions.length}
              </p>
              <p className="text-gray-600">Javob berildi: {answered}/{test.questions.length}</p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* SAVOL */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {question.questionNumber}. {question.question}
          </h2>

          {/* VARIANTLAR */}
          <div className="space-y-3">
            {["A", "B", "C", "D"].map((option) => (
              <label
                key={option}
                className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
              >
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value={option}
                  checked={answers[question.questionNumber] === option}
                  onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                  className="w-5 h-5 text-blue-500 cursor-pointer"
                />
                <span className="ml-4 text-gray-800">
                  <strong>{option}.</strong> {question[`option${option}` as keyof Question]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* NAVIGATSIYA */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4 justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition font-semibold"
            >
              ⬅️ Oldingi
            </button>

            <div className="flex gap-2 flex-wrap justify-center">
              {test.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-10 h-10 rounded-lg font-semibold transition ${
                    currentQuestion === idx
                      ? "bg-blue-500 text-white"
                      : answers[q.questionNumber]
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                  title={`Savol ${q.questionNumber}`}
                >
                  {q.questionNumber}
                </button>
              ))}
            </div>

            {currentQuestion < test.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(Math.min(test.questions.length - 1, currentQuestion + 1))}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
              >
                Keyingi ➡️
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.values(answers).some(a => !a)}
                className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Yuborilmoqda..." : "✅ TESTNI YAKUNLASH"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
