"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface UserAnswer {
  questionNumber: number;
  selectedAnswer: string;
  isCorrect: boolean;
  score: number;
}

interface Question {
  questionNumber: number;
  question: string;
  correctAnswer: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface Result {
  id: string;
  studentName: string;
  totalScore: number;
  percentage: number;
  test: {
    subject: string;
    testCode: string;
    questions: Question[];
  };
  answers: UserAnswer[];
}

export default function Results() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/results/${id}`);
        if (!res.ok) throw new Error("Natija topilmadi");
        
        const data = await res.json();
        setResult(data);
      } catch (error) {
        console.error(error);
        alert("Natija yuklashda xato");
        router.push("/student");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResult();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Natija yuklanyotgan...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-red-600">Natija topilmadi</div>
      </div>
    );
  }

  const correctAnswers = result.answers.filter(a => a.isCorrect).length;
  const totalQuestions = result.test.questions.length;
  const grade = result.percentage >= 90 ? "A+" : 
                result.percentage >= 80 ? "A" :
                result.percentage >= 70 ? "B" :
                result.percentage >= 60 ? "C" :
                "F";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* NATIJA SUMMARY */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">✅ TEST TUGALLANDI!</h1>
            <p className="text-gray-600 text-lg">Siz testni muvaffaqiyatli yakunladingiz</p>
          </div>

          {/* MAIN STATS */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* BALL */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white text-center">
              <div className="text-5xl font-bold">{result.totalScore.toFixed(1)}</div>
              <div className="text-sm mt-2 opacity-90">BALL</div>
            </div>

            {/* FOIZ */}
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white text-center">
              <div className="text-5xl font-bold">{result.percentage.toFixed(1)}%</div>
              <div className="text-sm mt-2 opacity-90">FOIZ</div>
            </div>

            {/* BAHO */}
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-6 text-white text-center">
              <div className="text-5xl font-bold">{grade}</div>
              <div className="text-sm mt-2 opacity-90">BAHO</div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Fani</p>
                <p className="text-2xl font-bold text-gray-800">{result.test.subject}</p>
              </div>
              <div>
                <p className="text-gray-600">Test kodi</p>
                <p className="text-2xl font-bold text-gray-800">{result.test.testCode}</p>
              </div>
              <div>
                <p className="text-gray-600">To'g'ri javoblar</p>
                <p className="text-2xl font-bold text-green-600">
                  {correctAnswers} / {totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Xato javoblar</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalQuestions - correctAnswers} / {totalQuestions}
                </p>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition"
            >
              {showDetails ? "Tafsili yashirish" : "📋 Tafsili ko'rish"}
            </button>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition"
            >
              🏠 Asosiy sahifaga
            </button>
          </div>
        </div>

        {/* DETAILED ANSWERS */}
        {showDetails && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800">📝 Savollar va Javoblar</h2>
            
            {result.test.questions.map((question, idx) => {
              const userAnswer = result.answers.find(a => a.questionNumber === question.questionNumber);
              const isCorrect = userAnswer?.isCorrect;

              return (
                <div
                  key={question.questionNumber}
                  className={`bg-white rounded-lg p-6 border-l-4 ${
                    isCorrect ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center ${
                      isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                      {question.questionNumber}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-800">{question.question}</p>
                    </div>
                  </div>

                  <div className="space-y-2 ml-14">
                    {["A", "B", "C", "D"].map((option) => {
                      const text = question[`option${option}` as keyof typeof question];
                      const selected = userAnswer?.selectedAnswer === option;
                      const correct = question.correctAnswer === option;

                      return (
                        <div
                          key={option}
                          className={`p-3 rounded-lg ${
                            correct
                              ? "bg-green-100 border-2 border-green-500"
                              : selected
                              ? "bg-red-100 border-2 border-red-500"
                              : "bg-gray-100"
                          }`}
                        >
                          <span className="font-bold">{option}.</span> {text}
                          {correct && <span className="ml-2 text-green-700 font-bold">✅ To'g'ri</span>}
                          {selected && !correct && <span className="ml-2 text-red-700 font-bold">❌ Siz tanladingiz</span>}
                        </div>
                      );
                    })}
                  </div>

                  {userAnswer && (
                    <div className="mt-3 ml-14 text-sm">
                      <p className={isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        Ball: {userAnswer.score}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
