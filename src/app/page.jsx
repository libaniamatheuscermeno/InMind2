"use client";

import { useState } from "react";
import { ArrowRight, Activity, Lightbulb, MessageSquare } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("diagnosis");
  const [symptoms, setSymptoms] = useState("");
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("en");
  const [lastResponse, setLastResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

  const translations = {
    en: {
      title: "InMind AI Medical Assistant",
      subtitle: "For informational use only. Not a substitute for professional medical advice.",
      diagnosisTab: "Symptom Check",
      questionTab: "Ask a Question",
      faqTab: "FAQ",
      symptomPlaceholder: "Describe your symptoms (e.g., headache, sore throat, fatigue)...",
      questionPlaceholder: "Ask any medical question...",
      analyze: "Analyze",
      asking: "Thinking...",
      askQuestion: "Ask",
      results: "Possible Conditions",
      answer: "Answer",
      faqTitle: "Frequently Asked Questions",
      faqs: [
        {
          question: "Is this a medical diagnosis?",
          answer:
            "No. This tool is for informational purposes only. Please consult a healthcare professional for an official diagnosis.",
        },
        {
          question: "Is my data stored?",
          answer: "No. Your symptoms and questions are not stored or shared.",
        },
        {
          question: "What languages are supported?",
          answer: "Currently English and Spanish are supported.",
        },
      ],
    },
    es: {
      title: "Asistente Médico InMind AI",
      subtitle: "Solo para fines informativos. No sustituye el consejo médico profesional.",
      diagnosisTab: "Chequeo de Síntomas",
      questionTab: "Haz una Pregunta",
      faqTab: "Preguntas Frecuentes",
      symptomPlaceholder: "Describe tus síntomas (por ejemplo: dolor de cabeza, garganta irritada, fatiga)...",
      questionPlaceholder: "Haz cualquier pregunta médica...",
      analyze: "Analizar",
      asking: "Pensando...",
      askQuestion: "Preguntar",
      results: "Posibles Condiciones",
      answer: "Respuesta",
      faqTitle: "Preguntas Frecuentes",
      faqs: [
        {
          question: "¿Esto es un diagnóstico médico?",
          answer:
            "No. Esta herramienta es solo informativa. Consulta a un profesional de salud para un diagnóstico oficial.",
        },
        {
          question: "¿Se almacenan mis datos?",
          answer: "No. Tus síntomas y preguntas no se almacenan ni comparten.",
        },
        {
          question: "¿Qué idiomas son compatibles?",
          answer: "Actualmente se admite inglés y español.",
        },
      ],
    },
  };

  const t = translations[language];

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    setIsLoading(true);
    setLastResponse("");

    try {
      const response = await fetch("/api/medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, language }),
      });

      const data = await response.json();
      setLastResponse(data.result || "No results found.");
    } catch (error) {
      console.error(error);
      setLastResponse("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const askMedicalQuestion = async () => {
    if (!question.trim()) return;
    setIsAsking(true);
    setLastResponse("");

    try {
      const response = await fetch("/api/medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language }),
      });

      const data = await response.json();
      setLastResponse(data.result || "No answer found.");
    } catch (error) {
      console.error(error);
      setLastResponse("Something went wrong.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 text-center">{t.title}</h1>
        <p className="text-gray-400 mb-6 text-center">{t.subtitle}</p>

        {/* Language Selector */}
        <div className="flex justify-center mb-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg font-medium ${
              activeTab === "diagnosis" ? "bg-white text-black" : "bg-gray-800"
            }`}
            onClick={() => setActiveTab("diagnosis")}
          >
            {t.diagnosisTab}
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-medium ${
              activeTab === "question" ? "bg-white text-black" : "bg-gray-800"
            }`}
            onClick={() => setActiveTab("question")}
          >
            {t.questionTab}
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-medium ${
              activeTab === "faq" ? "bg-white text-black" : "bg-gray-800"
            }`}
            onClick={() => setActiveTab("faq")}
          >
            {t.faqTab}
          </button>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          {activeTab === "diagnosis" ? (
            <div>
              <label className="block mb-2 text-gray-300">{t.symptomPlaceholder.split("...")[0]}</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={t.symptomPlaceholder}
                className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent resize-none text-gray-200 placeholder-gray-500"
              />
              <button
                onClick={analyzeSymptoms}
                disabled={isLoading || !symptoms.trim()}
                className="mt-4 w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {t.asking}
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    {t.analyze}
                  </>
                )}
              </button>
            </div>
          ) : activeTab === "question" ? (
            <div>
              <label className="block mb-2 text-gray-300">{t.questionPlaceholder.split("...")[0]}</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t.questionPlaceholder}
                className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent resize-none text-gray-200 placeholder-gray-500"
              />
              <button
                onClick={askMedicalQuestion}
                disabled={isAsking || !question.trim()}
                className="mt-4 w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAsking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {t.asking}
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    {t.askQuestion}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">{t.faqTitle}</h2>
              <div className="space-y-4">
                {t.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                  >
                    <h3 className="text-lg font-medium text-white mb-2">
                      <Lightbulb className="w-5 h-5 inline mr-2 text-yellow-400" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-300 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {lastResponse && (
          <div className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">
              {activeTab === "diagnosis" ? t.results : t.answer}
            </h3>
            <p className="text-gray-300 whitespace-pre-line">{lastResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}
