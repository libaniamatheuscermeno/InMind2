export async function POST(request) {
  try {
    const { symptoms, question, language = "en" } = await request.json();

    let searchTerms = [];
    let analysisType = "";

    // Identify if user input is symptoms or a question
    if (symptoms) {
      analysisType = "symptoms";
      const symptomsLower = symptoms.toLowerCase();

      // Detect neurological keywords
      const neurologicalKeywords = [
        "memory loss",
        "forgetfulness",
        "tremor",
        "shaking",
        "alzheimer",
        "parkinson",
        "stroke",
        "migraine",
        "dementia",
        "neuropathy",
        "ataxia",
        "seizure",
        "speech problems",
        "balance",
        "gait",
        "aphasia",
      ];

      searchTerms = neurologicalKeywords.filter(term =>
        symptomsLower.includes(term.toLowerCase())
      );

      if (searchTerms.length === 0) {
        searchTerms.push("neurological disorder", "neurodegenerative disease");
      }

    } else if (question) {
      analysisType = "question";
      const words = question.toLowerCase().split(" ");
      const excluded = ["what", "how", "when", "where", "why", "is", "are", "the", "and"];
      searchTerms = words.filter(w => w.length > 3 && !excluded.includes(w)).slice(0, 3);

      if (searchTerms.length === 0) {
        searchTerms.push("medical condition", "neurological health");
      }
    }

    // Fetch Wikipedia data for first 2–3 terms
    const wikipediaResults = [];
    for (const term of searchTerms.slice(0, 3)) {
      try {
        const res = await fetch(
          `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`,
          {
            headers: { "User-Agent": "InMind-Medical-App/1.0 (educational)" },
          }
        );

        if (res.ok) {
          const data = await res.json();
          wikipediaResults.push({
            title: data.title,
            extract: data.extract,
            url: data.content_urls?.desktop?.page || "",
          });
        }
      } catch {
        // Ignore individual errors and continue
      }
    }

    // If Wikipedia gives nothing, use intelligent fallback
    if (wikipediaResults.length === 0) {
      const fallback = generateProfessionalFallback(analysisType, symptoms, question, language);
      return Response.json({ response: fallback });
    }

    // Format final response
    let formatted;
    if (language === "es") {
      formatted =
        analysisType === "symptoms"
          ? formatSpanishSymptomResponse(wikipediaResults, symptoms)
          : formatSpanishQuestionResponse(wikipediaResults, question);
    } else {
      formatted =
        analysisType === "symptoms"
          ? formatEnglishSymptomResponse(wikipediaResults, symptoms)
          : formatEnglishQuestionResponse(wikipediaResults, question);
    }

    return Response.json({ response: formatted });

  } catch (err) {
    console.error("Error in medical API:", err);
    const fallback = generateProfessionalFallback("general", "", "", "en");
    return Response.json({ response: fallback });
  }
}

/* -----------------------  ENGLISH RESPONSES  ----------------------- */
function formatEnglishSymptomResponse(results, symptoms) {
  let res = `**Medical Summary Based on Reported Symptoms**\n\n`;
  res += `**Symptoms Provided:** ${symptoms}\n\n`;
  res += `**Possible Related Neurological Conditions:**\n\n`;

  results.forEach((r, i) => {
    res += `**${i + 1}. ${r.title}**\n${r.extract}\n`;
    if (r.url) res += `Learn more: ${r.url}\n\n`;
  });

  res += `**Disclaimer:** This information is for educational purposes and not a substitute for professional medical advice. Always consult a licensed healthcare provider.`;
  return res;
}

function formatEnglishQuestionResponse(results, question) {
  let res = `**Medical Information Response**\n\n`;
  res += `**Question Asked:** ${question}\n\n`;
  res += `**Relevant Findings:**\n\n`;

  results.forEach((r, i) => {
    res += `**${i + 1}. ${r.title}**\n${r.extract}\n`;
    if (r.url) res += `Source: ${r.url}\n\n`;
  });

  res += `**Disclaimer:** This educational content is not a medical diagnosis. Consult healthcare professionals for clinical guidance.`;
  return res;
}

/* -----------------------  SPANISH RESPONSES  ----------------------- */
function formatSpanishSymptomResponse(results, symptoms) {
  let res = `**Resumen Médico Basado en los Síntomas Reportados**\n\n`;
  res += `**Síntomas Proporcionados:** ${symptoms}\n\n`;
  res += `**Posibles Condiciones Neurológicas Relacionadas:**\n\n`;

  results.forEach((r, i) => {
    res += `**${i + 1}. ${r.title}**\n${r.extract}\n`;
    if (r.url) res += `Más información: ${r.url}\n\n`;
  });

  res += `**Descargo de responsabilidad:** Esta información es educativa y no sustituye el diagnóstico médico profesional. Consulte siempre a un profesional de la salud.`;
  return res;
}

function formatSpanishQuestionResponse(results, question) {
  let res = `**Respuesta de Información Médica**\n\n`;
  res += `**Pregunta Realizada:** ${question}\n\n`;
  res += `**Hallazgos Relevantes:**\n\n`;

  results.forEach((r, i) => {
    res += `**${i + 1}. ${r.title}**\n${r.extract}\n`;
    if (r.url) res += `Fuente: ${r.url}\n\n`;
  });

  res += `**Descargo de responsabilidad:** Esta información es solo educativa. Consulte a profesionales médicos para orientación clínica.`;
  return res;
}

/* -----------------------  PROFESSIONAL FALLBACK ----------------------- */
function generateProfessionalFallback(type, symptoms, question, language) {
  if (language === "es") {
    return (
      `**Análisis Médico Basado en la Información Proporcionada**\n\n` +
      (type === "symptoms"
        ? `Los síntomas mencionados sugieren la posibilidad de una afección neurológica. Es recomendable una evaluación médica detallada, preferiblemente por un neurólogo. Las pruebas diagnósticas pueden incluir estudios de imagen cerebral, análisis sanguíneos y evaluación cognitiva.\n\n`
        : `La pregunta sugiere interés en información médica especializada. La orientación clínica precisa requiere una consulta presencial con un profesional de la salud.\n\n`) +
      `**Recomendaciones:**\n- Programe una cita médica para evaluación diagnóstica\n- Lleve un registro detallado de los síntomas\n- Evite la automedicación\n\n` +
      `**Nota:** Esta información tiene fines educativos y no sustituye la atención médica profesional.`
    );
  }

  return (
    `**Clinical Assessment Summary**\n\n` +
    (type === "symptoms"
      ? `The reported symptoms may be consistent with a neurological or systemic condition. A full evaluation, ideally by a neurologist, is recommended. Diagnostic steps may include MRI imaging, blood analysis, and cognitive testing.\n\n`
      : `Your question appears to relate to medical or neurological concerns. For accurate information, clinical assessment by a healthcare provider is required.\n\n`) +
    `**Recommendations:**\n- Schedule a medical consultation\n- Keep a detailed symptom log\n- Avoid self-diagnosis or self-treatment\n\n` +
    `**Note:** This information is provided for educational purposes and does not replace medical evaluation or treatment.`
  );
}
