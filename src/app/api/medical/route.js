export async function POST(request) {
  try {
    const { symptoms, question, language = "en" } = await request.json();

    // Figure out what kind of analysis we're doing
    const isSymptom = !!symptoms;
    const inputText = isSymptom ? symptoms : question;

    // Build query for MedlinePlus — focused on neurological topics
    const neurologicalKeywords = [
      "Alzheimer",
      "Parkinson",
      "dementia",
      "stroke",
      "seizure",
      "epilepsy",
      "tremor",
      "neuropathy",
      "multiple sclerosis",
      "migraine",
      "brain injury",
      "spinal cord",
      "ataxia",
      "aphasia",
      "neurodegenerative",
      "dystonia",
      "memory loss",
      "confusion",
    ];

    // Find matching terms
    const inputLower = inputText.toLowerCase();
    const matched = neurologicalKeywords.filter((term) =>
      inputLower.includes(term.toLowerCase())
    );

    // If nothing matched, still try a general neurology query
    const searchTerms =
      matched.length > 0 ? matched.slice(0, 3) : ["neurological disorder"];

    // Fetch MedlinePlus data (limit to 1-2 topics)
    const results = [];
    for (const term of searchTerms) {
      try {
        const url = `https://connect.medlineplus.gov/service?mainSearchCriteria.v.c=${encodeURIComponent(
          term
        )}&knowledgeResponseType=application/json`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const topic = data?.feed?.entry?.[0];
          if (topic) {
            results.push({
              title: topic.title?.[0]?._,
              summary: topic.summary?.[0]?._,
              url: topic.link?.[0]?.$.href || "",
            });
          }
        }
      } catch (err) {
        console.error("MedlinePlus fetch failed:", err);
      }
    }

    // If no valid results, fall back to professional summaries
    let formattedResponse = "";
    if (results.length > 0) {
      formattedResponse = formatResults(language, isSymptom, inputText, results);
    } else {
      formattedResponse = formatFallback(language, isSymptom, inputText);
    }

    return Response.json({ response: formattedResponse });
  } catch (err) {
    console.error("Error in medical route:", err);
    return Response.json({
      response:
        "We're currently unable to retrieve medical information. Please try again later.",
    });
  }
}

function formatResults(language, isSymptom, inputText, results) {
  if (language === "es") {
    let response = isSymptom
      ? `**Análisis de Síntomas Neurológicos**\n\n**Síntomas Reportados:** ${inputText}\n\n`
      : `**Respuesta a la Consulta Médica Neurológica**\n\n**Pregunta:** ${inputText}\n\n`;

    response += `**Condiciones Relacionadas Encontradas:**\n\n`;
    results.forEach((r, i) => {
      response += `**${i + 1}. ${r.title}**\n${r.summary}\n`;
      if (r.url) response += `Más información: ${r.url}\n\n`;
    });

    response +=
      `**Aviso Médico:** Esta información se proporciona con fines educativos y no reemplaza la evaluación profesional. Consulte a un neurólogo o médico calificado para un diagnóstico y tratamiento precisos.`;
    return response;
  } else {
    let response = isSymptom
      ? `**Neurological Symptom Analysis**\n\n**Reported Symptoms:** ${inputText}\n\n`
      : `**Neurological Medical Inquiry Response**\n\n**Question:** ${inputText}\n\n`;

    response += `**Related Conditions Found:**\n\n`;
    results.forEach((r, i) => {
      response += `**${i + 1}. ${r.title}**\n${r.summary}\n`;
      if (r.url) response += `Learn more: ${r.url}\n\n`;
    });

    response +=
      `**Medical Disclaimer:** This information is provided for educational purposes only and does not replace professional medical evaluation. Consult a neurologist or qualified physician for accurate diagnosis and treatment.`;
    return response;
  }
}

function formatFallback(language, isSymptom, inputText) {
  if (language === "es") {
    return isSymptom
      ? `**Análisis de Síntomas Neurológicos**\n\nNo se encontraron resultados específicos para los síntomas descritos: "${inputText}".\n\nEs posible que los síntomas correspondan a condiciones neurológicas que requieren evaluación médica especializada. Se recomienda:\n\n- Consultar con un neurólogo para una valoración integral.\n- Registrar la evolución de los síntomas.\n- Buscar atención inmediata si los síntomas empeoran o aparecen de forma repentina.\n\n**Aviso Médico:** Esta información es educativa y no sustituye la consulta médica profesional.`
      : `**Respuesta a la Consulta Médica Neurológica**\n\nNo se encontró información específica para la pregunta: "${inputText}".\n\nSin embargo, las consultas neurológicas deben ser evaluadas por profesionales médicos calificados. Se sugiere programar una cita con un especialista en neurología.\n\n**Aviso Médico:** Esta información se proporciona con fines educativos y no reemplaza la opinión de un médico.`;
  } else {
    return isSymptom
      ? `**Neurological Symptom Analysis**\n\nNo direct medical results were found for the described symptoms: "${inputText}".\n\nThese symptoms may relate to neurological conditions that require professional evaluation. It is recommended to:\n\n- Schedule an appointment with a neurologist.\n- Monitor and document symptom changes.\n- Seek immediate medical attention if symptoms worsen or appear suddenly.\n\n**Medical Disclaimer:** This information is for educational purposes only and should not replace professional medical assessment.`
      : `**Neurological Medical Inquiry Response**\n\nNo specific information was found for the question: "${inputText}".\n\nNeurological questions often require detailed professional evaluation. It is recommended to consult a neurologist for personalized guidance.\n\n**Medical Disclaimer:** This information is educational and does not replace advice from a licensed healthcare provider.`;
  }
}
