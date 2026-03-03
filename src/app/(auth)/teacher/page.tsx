"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const SUBJECTS = [
  { value: "RIGHTS", label: "Huquq" },
  { value: "FOREIGN_LANG", label: "Chet tili" },
  { value: "IQ", label: "IQ" },
  { value: "PHYSICS", label: "Fizika" },
  { value: "MATHEMATICS", label: "Matematika" },
  { value: "CHEMISTRY", label: "Kimyo" },
  { value: "BIOLOGY", label: "Biologiya" },
  { value: "HISTORY", label: "Tarix" },
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
            className={`px-8 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
              activeTab === "add"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-white text-gray-700"
            }`}
          >
            ➕ Test Qo'shish
          </button>
          <button
            onClick={() => setActiveTab("monitor")}
            className={`px-8 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
              activeTab === "monitor"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-white text-gray-700"
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

// TEST QOSHISH FORMI
function AddTestForm() {
  const [formData, setFormData] = useState({
    subject: "",
    testCode: "",
    questionCount: 30,
    scoringMode: "GENERAL",
    questions: [
      {
        question: "",
        option
