export async function POST(request) {
  try {
    const { symptoms, question, language = "en" } = await request.json();

    const input = symptoms || question;
    const isSymptom = !!symptoms;

    if (!input || input.trim().length === 0) {
      return Response.json({ response: "Please enter a valid input." });
    }

    const searchTerms = extractMedicalTerms(input);
    const wikipediaResults = [];

    for (const term of searchTerms.slice(0, 3)) {
      try {
        const response = await fetch(
          `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`,
          {
            headers: {
              "User-Agent": "InMind-Medical-App/1.0 (educational-purpose)",
            },
          }
        );

        if (response.ok) {
          const summary = await response.json();
          wikipediaResults.push({
            title: summary.title,
            extract: summary.extract,
            url: summary.content_urls?.desktop?.page || "",
          });
        }
      } catch {
        // Ignore failed fetches (Render sometimes blocks them)
      }
    }

    let formattedResponse = "";

    if (language === "es") {
      formattedResponse = formatSpanishResponse(
        wikipediaResults,
        input,
        isSymptom
      );
    } else {
      formattedResponse = formatEnglishResponse(
        wikipediaResults,
        input,
        isSymptom
      );
    }

    return Response.json({ response: formattedResponse });
  } catch (error) {
    console.error("Error in medical API:", error);
    return Response.json({
      response:
        "Something went wrong fetching medical information. Please try again later.",
    });
  }
}

function extractMedicalTerms(text) {
  const keywords = [
    "alzheimer",
    "parkinson",
    "stroke",
    "dementia",
    "migraine",
    "neuropathy",
    "tremor",
    "seizure",
    "balance",
    "memory",
    "ataxia",
    "aphasia",
    "dysarthria",
  ];
  const textLower = text.toLowerCase();
  const found = keywords.filter((k) => textLower.includes(k));
  return found.length ? found : ["neurological disorder"];
}

// ---------------- ENGLISH FORMATTER ----------------
function formatEnglishResponse(results, input, isSymptom) {
  let response = `**Medical Information**\n\n`;
  response += `**Your Input:** ${input}\n\n`;

  if (results.length > 0) {
    response += `**Related Information Found:**\n\n`;
    results.forEach((r, i) => {
      response += `**${i + 1}. ${r.title}**\n${r.extract}\n`;
      if (r.url) response += `Source: ${r.url}\n\n`;
    });
  } else {
    response += `**No direct results found.**\n\n`;
    response += generalEnglishAdvice(input, isSymptom);
  }

  response += `\n**Disclaimer:** This information is for educational purposes only and should not replace professional medical advice.`;
  return response;
}

function generalEnglishAdvice(input, isSymptom) {
  let text = "";
  const l = input.toLowerCase();

  if (isSymptom) {
    if (l.includes("memory")) {
      text +=
        "Memory-related issues can stem from stress, sleep problems, or neurological conditions like dementia.\n";
    } else if (l.includes("tremor") || l.includes("shake")) {
      text +=
        "Tremors may be caused by Parkinson’s disease, essential tremor, or medication effects.\n";
    } else if (l.includes("balance") || l.includes("walk")) {
      text +=
        "Balance issues may come from ear disorders or neurological conditions like ataxia.\n";
    } else {
      text +=
        "These symptoms could relate to various neurological issues. Please consult a neurologist for evaluation.\n";
    }
  } else {
    if (l.includes("treatment")) {
      text +=
        "Treatment varies depending on diagnosis and should be discussed with a doctor.\n";
    } else if (l.includes("diagnosis")) {
      text +=
        "Diagnosis usually involves medical exams, tests, and imaging under professional supervision.\n";
    } else {
      text +=
        "Your question may require medical evaluation for an accurate answer.\n";
    }
  }

  return text;
}

// ---------------- SPANISH FORMATTER ----------------
function formatSpanishResponse(results, input, isSymptom) {
  let response = `**Información Médica**\n\n`;
  response += `**Entrada del Usuario:** ${input}\n\n`;

  if (results.length > 0) {
    response += `**Información Relacionada Encontrada:**\n\n`;
    results.forEach((r, i) => {
      response += `**${i + 1}. ${r.title}**\n${r.extract}\n`;
      if (r.url) response += `Fuente: ${r.url}\n\n`;
    });
  } else {
    response += `**No se encontraron resultados directos.**\n\n`;
    response += generalSpanishAdvice(input, isSymptom);
  }

  response += `\n**Descargo de Responsabilidad:** Esta información es solo con fines educativos y no reemplaza el consejo médico profesional.`;
  return response;
}

function generalSpanishAdvice(input, isSymptom) {
  let text = "";
  const l = input.toLowerCase();

  if (isSymptom) {
    if (l.includes("memoria")) {
      text +=
        "Los problemas de memoria pueden deberse al estrés, la falta de sueño o condiciones neurológicas como la demencia.\n";
    } else if (l.includes("temblo") || l.includes("sacudi")) {
      text +=
        "Los temblores pueden estar relacionados con la enfermedad de Parkinson, temblor esencial o efectos secundarios de medicamentos.\n";
    } else if (l.includes("equilibrio") || l.includes("caminar")) {
      text +=
        "Los problemas de equilibrio pueden deberse a trastornos del oído interno o condiciones neurológicas como la ataxia.\n";
    } else {
      text +=
        "Estos síntomas podrían estar relacionados con diversos trastornos neurológicos. Consulte a un neurólogo para una evaluación profesional.\n";
    }
  } else {
    if (l.includes("tratamiento")) {
      text +=
        "El tratamiento varía según el diagnóstico y debe discutirse con un médico.\n";
    } else if (l.includes("diagnóstico")) {
      text +=
        "El diagnóstico generalmente implica exámenes médicos, pruebas y estudios de imagen realizados por profesionales.\n";
    } else {
      text +=
        "Su pregunta puede requerir una evaluación médica para una respuesta precisa.\n";
    }
  }

  return text;
}
