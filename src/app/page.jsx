'use client';

import { useState, useCallback } from "react";
import {
  MessageCircle,
  Globe,
  Stethoscope,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  Download,
} from "lucide-react";

const languages = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  pt: { name: "Português", flag: "🇧🇷" },
  fr: { name: "Français", flag: "🇫🇷" },
};

const translations = {
  en: {
    title: "InMind.",
    subtitle: "AI-Powered Neurological Diagnostic Assistant",
    disclaimer:
      "This tool is for educational purposes only and should not replace professional medical advice.",
    diagnosisTab: "Diagnosis",
    questionsTab: "Medical Q&A",
    faqTab: "FAQ",
    symptomsPlaceholder:
      "Describe your symptoms in detail (e.g., memory loss, tremors, difficulty walking, speech problems...)",
    questionPlaceholder: "Ask any health or medicine related question...",
    analyze: "Analyze Symptoms",
    askQuestion: "Ask Question",
    analyzing: "Analyzing...",
    asking: "Processing...",
    results: "Analysis Results",
    answer: "Answer",
    downloadChat: "Download Chat",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "How accurate are the diagnostic suggestions?",
        answer:
          "InMind provides educational insights based on symptom analysis, but should never replace professional medical diagnosis. Always consult healthcare professionals for accurate diagnosis and treatment.",
      },
      {
        question: "What neurodegenerative diseases can be analyzed?",
        answer:
          "Our AI can analyze symptoms related to Alzheimer's, Parkinson's, ALS, Huntington's disease, Multiple Sclerosis, and other neurological conditions.",
      },
      {
        question: "Is my health information secure?",
        answer:
          "We do not store personal health information. All conversations are processed securely and are not saved on our servers.",
      },
      {
        question: "Can I use this tool for someone else?",
        answer:
          "Yes, you can describe symptoms for family members or others, but remember this is for educational purposes only.",
      },
      {
        question: "What should I do after getting results?",
        answer:
          "Use the results as a starting point for discussion with healthcare professionals. Schedule appointments with recommended specialists for proper evaluation.",
      },
    ],
  },
  es: {
    title: "InMind.",
    subtitle: "Asistente de Diagnóstico Neurológico con IA",
    disclaimer:
      "Esta herramienta es solo para fines educativos y no debe reemplazar el consejo médico profesional.",
    diagnosisTab: "Diagnóstico",
    questionsTab: "Preguntas Médicas",
    faqTab: "Preguntas Frecuentes",
    symptomsPlaceholder:
      "Describe tus síntomas en detalle (ej: pérdida de memoria, temblores, dificultad para caminar, problemas del habla...)",
    questionPlaceholder:
      "Haz cualquier pregunta relacionada con salud o medicina...",
    analyze: "Analizar Síntomas",
    askQuestion: "Hacer Pregunta",
    analyzing: "Analizando...",
    asking: "Procesando...",
    results: "Resultados del Análisis",
    answer: "Respuesta",
    downloadChat: "Descargar Chat",
    faqTitle: "Preguntas Frecuentes",
    faqs: [
      {
        question: "¿Qué tan precisas son las sugerencias de diagnóstico?",
        answer:
          "InMind proporciona información educativa basada en análisis de síntomas, pero nunca debe reemplazar el diagnóstico médico profesional. Siempre consulte a profesionales de la salud para un diagnóstico y tratamiento precisos.",
      },
      {
        question: "¿Qué enfermedades neurodegenerativas se pueden analizar?",
        answer:
          "Nuestra IA puede analizar síntomas relacionados con Alzheimer, Parkinson, ELA, enfermedad de Huntington, Esclerosis Múltiple y otras condiciones neurológicas.",
      },
      {
        question: "¿Es segura mi información de salud?",
        answer:
          "No almacenamos información personal de salud. Todas las conversaciones se procesan de forma segura y no se guardan en nuestros servidores.",
      },
      {
        question: "¿Puedo usar esta herramienta para otra persona?",
        answer:
          "Sí, puedes describir síntomas para familiares u otros, pero recuerda que esto es solo para fines educativos.",
      },
      {
        question: "¿Qué debo hacer después de obtener los resultados?",
        answer:
          "Usa los resultados como punto de partida para discutir con profesionales de la salud. Programa citas con especialistas recomendados para una evaluación adecuada.",
      },
    ],
  },
  pt: {
    title: "InMind.",
    subtitle: "Assistente de Diagnóstico Neurológico com IA",
    disclaimer:
      "Esta ferramenta é apenas para fins educacionais e não deve substituir o conselho médico profissional.",
    diagnosisTab: "Diagnóstico",
    questionsTab: "Perguntas Médicas",
    faqTab: "Perguntas Frequentes",
    symptomsPlaceholder:
      "Descreva seus sintomas em detalhes (ex: perda de memória, tremores, dificuldade para caminhar, problemas de fala...)",
    questionPlaceholder:
      "Faça qualquer pergunta relacionada à saúde ou medicina...",
    analyze: "Analisar Sintomas",
    askQuestion: "Fazer Pergunta",
    analyzing: "Analisando...",
    asking: "Processando...",
    results: "Resultados da Análise",
    answer: "Resposta",
    downloadChat: "Baixar Chat",
    faqTitle: "Perguntas Frequentes",
    faqs: [
      {
        question: "Quão precisas são as sugerências de diagnóstico?",
        answer:
          "O InMind fornece informações educacionais baseadas em análise de sintomas, mas nunca deve substituir o diagnóstico médico profissional. Sempre consulte profissionais de saúde para diagnóstico e tratamento precisos.",
      },
      {
        question: "Quais doenças neurodegenerativas podem ser analisadas?",
        answer:
          "Nossa IA pode analisar sintomas relacionados ao Alzheimer, Parkinson, ELA, doença de Huntington, Esclerose Múltipla e outras condições neurológicas.",
      },
      {
        question: "Minhas informações de saúde estão seguras?",
        answer:
          "Não armazenamos informações pessoais de saúde. Todas as conversas são processadas com segurança e não são salvas em nossos servidores.",
      },
      {
        question: "Posso usar esta ferramenta para outra pessoa?",
        answer:
          "Sim, você pode descrever sintomas para familiares ou outros, mas lembre-se de que isso é apenas para fins educacionais.",
      },
      {
        question: "O que devo fazer após obter os resultados?",
        answer:
          "Use os resultados como ponto de partida para discussão com profissionais de la saúde. Agende consultas com especialistas recomendados para avaliação adequada.",
      },
    ],
  },
  fr: {
    title: "InMind.",
    subtitle: "Assistant de Diagnostic Neurologique IA",
    disclaimer:
      "Cet outil est à des fins éducatives uniquement et ne doit pas remplacer les conseils médicaux professionnels.",
    diagnosisTab: "Diagnostic",
    questionsTab: "Questions Médicales",
    faqTab: "FAQ",
    symptomsPlaceholder:
      "Décrivez vos symptômes en détail (ex: perte de mémoire, tremblements, difficulté à marcher, problèmes d'élocution...)",
    questionPlaceholder:
      "Posez toute question liée à la santé ou à la médecine...",
    analyze: "Analyser les Symptômes",
    askQuestion: "Poser une Question",
    analyzing: "Analyse en cours...",
    asking: "Traitement...",
    results: "Résultats de l'Analyse",
    answer: "Réponse",
    downloadChat: "Télécharger Chat",
    faqTitle: "Questions Fréquemment Posées",
    faqs: [
      {
        question: "Quelle est la précision des suggestions de diagnostic?",
        answer:
          "InMind fournit des informations éducatives basées sur l'analyse des symptômes, mais ne doit jamais remplacer un diagnostic médical professionnel. Consultez toujours des professionnels de la santé pour un diagnostic et un traitement précis.",
      },
      {
        question: "Quelles maladies neurodégénératives peuvent être analysées?",
        answer:
          "Notre IA peut analyser les symptômes liés à Alzheimer, Parkinson, SLA, maladie de Huntington, Sclérose en Plaques et autres conditions neurologiques.",
      },
      {
        question: "Mes informations de santé sont-elles sécurisées?",
        answer:
          "Nous ne stockons pas d'informations personnelles de santé. Toutes les conversations sont traitées de manière sécurisée et ne sont pas sauvegardées sur nos serveurs.",
      },
      {
        question: "Puis-je utiliser cet outil pour quelqu'un d'autre?",
        answer:
          "Oui, vous pouvez décrire les symptômes pour des membres de la famille ou d'autres, mais rappelez-vous que c'est à des fins éducatives uniquement.",
      },
      {
        question: "Que dois-je faire après avoir obtenu les résultats?",
        answer:
          "Utilisez les résultats comme point de départ pour discuter avec des professionnels de la santé. Planifiez des rendez-vous avec des spécialistes recommandés pour une évaluation appropriée.",
      },
    ],
  },
};

export default function MedicalDiagnosticTool() {
  const [language, setLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("diagnosis");
  const [symptoms, setSymptoms] = useState("");
  const [question, setQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [lastResponse, setLastResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const t = translations[language];

  const downloadChat = useCallback(() => {
    const chatContent = chatHistory
      .map((item, index) => {
        return `${index + 1}. ${item.type === "symptoms" ? "Symptoms" : "Question"}: ${item.input}\n\nResponse: ${item.response}\n\n${"=".repeat(50)}\n\n`;
      })
      .join("");

    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inmind-chat-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [chatHistory]);

  const analyzeSymptoms = useCallback(async () => {
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    setLastResponse("");

    try {
      const response = await fetch("/api/wikipedia-medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptoms,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setLastResponse(data.response);

      // Add to chat history
      const newEntry = {
        type: "symptoms",
        input: symptoms,
        response: data.response,
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, newEntry]);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      setLastResponse(
        "Sorry, there was an error fetching medical information. Please try again later.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [symptoms, language]);

  const askMedicalQuestion = useCallback(async () => {
    if (!question.trim()) return;

    setIsAsking(true);
    setLastResponse("");

    try {
      const response = await fetch("/api/wikipedia-medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setLastResponse(data.response);

      // Add to chat history
      const newEntry = {
        type: "question",
        input: question,
        response: data.response,
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, newEntry]);
    } catch (error) {
      console.error("Error asking question:", error);
      setLastResponse(
        "Sorry, there was an error fetching medical information. Please try again later.",
      );
    } finally {
      setIsAsking(false);
    }
  }, [question, language]);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-black rounded-lg p-6 mb-4">
            <h1
              className="text-5xl font-bold text-white"
              style={{ fontFamily: "Hiragino Mincho ProN, serif" }}
            >
              {t.title}
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">{t.subtitle}</p>

          {/* Language Selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              {Object.entries(languages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    language === code
                      ? "bg-white text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Download Chat Button */}
          {chatHistory.length > 0 && (
            <div className="mb-4">
              <button
                onClick={downloadChat}
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2 mx-auto"
              >
                <Download className="w-4 h-4" />
                {t.downloadChat}
              </button>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-300">{t.disclaimer}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-900 rounded-lg p-1 mb-6 shadow-sm border border-gray-800">
          <button
            onClick={() => setActiveTab("diagnosis")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === "diagnosis"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Stethoscope className="w-5 h-5" />
            {t.diagnosisTab}
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === "questions"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            {t.questionsTab}
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === "faq"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            {t.faqTab}
          </button>
        </div>

        {/* Content */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
          {activeTab === "diagnosis" ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.symptomsPlaceholder.split("(")[0]}
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={t.symptomsPlaceholder}
                  className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent resize-none text-gray-200 placeholder-gray-500"
                />
              </div>

              <button
                onClick={analyzeSymptoms}
                disabled={isAnalyzing || !symptoms.trim()}
                className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    {t.analyze}
                  </>
                )}
              </button>
            </div>
          ) : activeTab === "questions" ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.questionPlaceholder.split("...")[0]}
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t.questionPlaceholder}
                  className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent resize-none text-gray-200 placeholder-gray-500"
                />
              </div>

              <button
                onClick={askMedicalQuestion}
                disabled={isAsking || !question.trim()}
                className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAsking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {t.asking}
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5" />
                    {t.askQuestion}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-gray-200 mb-6">
                {t.faqTitle}
              </h3>
              <div className="space-y-4">
                {t.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4 bg-gray-800"
                  >
                    <h4 className="font-semibold text-gray-200 mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results - only show for diagnosis and questions tabs */}
          {activeTab !== "faq" && lastResponse && (
            <div className="mt-8 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-white" />
                {activeTab === "diagnosis" ? t.results : t.answer}
              </h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="prose prose-sm max-w-none text-gray-300 whitespace-pre-wrap">
                  {lastResponse}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
