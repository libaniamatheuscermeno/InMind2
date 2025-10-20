"use client";

import { useState } from "react";

export default function MedicalPage() {
  const [symptoms, setSymptoms] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [botResponse, setBotResponse] = useState("");

  const analyzeSymptoms = async () => {
    if (!symptoms) return;
    setLoading(true);
    try {
      const response = await fetch("/api/medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }

      const data = await response.json();
      setAnalysisResult(data.analysis || "No analysis found.");
      setChatHistory((prev) => [
        ...prev,
        { sender: "user", message: `Symptoms: ${symptoms}` },
        { sender: "bot", message: data.analysis || "No analysis found." },
      ]);
    } catch (error) {
      console.error(error);
      setAnalysisResult("An error occurred while analyzing.");
    } finally {
      setLoading(false);
    }
  };

  const askMedicalQuestion = async () => {
    if (!question) return;
    setLoading(true);
    try {
      const response = await fetch("/api/medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch answer");
      }

      const data = await response.json();
      setBotResponse(data.analysis || "No answer found.");
      setChatHistory((prev) => [
        ...prev,
        { sender: "user", message: question },
        { sender: "bot", message: data.analysis || "No answer found." },
      ]);
    } catch (error) {
      console.error(error);
      setBotResponse("An error occurred while getting the answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Medical Analyzer 🩺</h1>

      <div className="mb-6">
        <textarea
          className="w-full p-3 border rounded mb-2"
          placeholder="Describe your symptoms..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <button
          onClick={analyzeSymptoms}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Symptoms"}
        </button>
      </div>

      {analysisResult && (
        <div className="mb-6 p-3 bg-gray-100 border rounded">
          <h2 className="font-semibold mb-2">Analysis Results:</h2>
          <p>{analysisResult}</p>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          className="w-full p-3 border rounded mb-2"
          placeholder="Ask a medical question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={askMedicalQuestion}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask Question"}
        </button>
      </div>

      {botResponse && (
        <div className="mb-6 p-3 bg-gray-100 border rounded">
          <h2 className="font-semibold mb-2">Bot Response:</h2>
          <p>{botResponse}</p>
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-2">Chat History:</h2>
        <div className="bg-gray-50 p-3 rounded border max-h-64 overflow-y-auto">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`mb-2 ${
                chat.sender === "user" ? "text-blue-600" : "text-green-600"
              }`}
            >
              <strong>{chat.sender === "user" ? "You" : "Bot"}:</strong>{" "}
              {chat.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
