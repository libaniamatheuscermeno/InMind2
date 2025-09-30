export async function POST(request) {
  try {
    const { symptoms, question, language = "en" } = await request.json();

    let searchTerms = [];
    let analysisType = "";

    if (symptoms) {
      analysisType = "symptoms";
      // Extract medical terms from symptoms for Wikipedia search
      const commonNeurologicalTerms = [
        "memory loss",
        "tremor",
        "alzheimer",
        "parkinson",
        "multiple sclerosis",
        "ALS",
        "huntington",
        "dementia",
        "seizure",
        "stroke",
        "migraine",
        "neuropathy",
        "dystonia",
        "ataxia",
        "aphasia",
        "dysarthria",
      ];

      const symptomsLower = symptoms.toLowerCase();
      searchTerms = commonNeurologicalTerms.filter(
        (term) =>
          symptomsLower.includes(term.toLowerCase()) ||
          symptomsLower.includes(term.toLowerCase().replace(" ", "")),
      );

      // Add general neurological searches if no specific terms found
      if (searchTerms.length === 0) {
        if (
          symptomsLower.includes("memory") ||
          symptomsLower.includes("forget")
        ) {
          searchTerms.push("dementia", "alzheimer disease");
        }
        if (
          symptomsLower.includes("shake") ||
          symptomsLower.includes("tremor")
        ) {
          searchTerms.push("parkinson disease", "essential tremor");
        }
        if (
          symptomsLower.includes("walk") ||
          symptomsLower.includes("balance")
        ) {
          searchTerms.push("gait disorder", "ataxia");
        }
        if (
          symptomsLower.includes("speech") ||
          symptomsLower.includes("talk")
        ) {
          searchTerms.push("aphasia", "dysarthria");
        }
        if (searchTerms.length === 0) {
          searchTerms.push(
            "neurodegenerative disease",
            "neurological disorder",
          );
        }
      }
    } else if (question) {
      analysisType = "question";

      // Improved medical question processing
      const questionLower = question.toLowerCase();

      // Common medical conditions and terms
      const medicalConditions = [
        "diabetes",
        "hypertension",
        "cancer",
        "heart disease",
        "stroke",
        "alzheimer",
        "parkinson",
        "multiple sclerosis",
        "arthritis",
        "asthma",
        "copd",
        "depression",
        "anxiety",
        "migraine",
        "epilepsy",
        "obesity",
        "osteoporosis",
        "thyroid",
        "kidney disease",
        "liver disease",
        "pneumonia",
        "tuberculosis",
        "hepatitis",
        "hiv",
        "aids",
        "lupus",
        "fibromyalgia",
        "crohn",
        "ulcerative colitis",
        "celiac",
        "autism",
        "adhd",
        "schizophrenia",
        "bipolar",
        "dementia",
        "als",
        "huntington",
        "muscular dystrophy",
        "cerebral palsy",
      ];

      // Find medical conditions mentioned in the question
      const mentionedConditions = medicalConditions.filter((condition) =>
        questionLower.includes(condition),
      );

      // Check if it's a treatment-related question
      const isTreatmentQuestion =
        questionLower.includes("treatment") ||
        questionLower.includes("treat") ||
        questionLower.includes("cure") ||
        questionLower.includes("therapy") ||
        questionLower.includes("medication") ||
        questionLower.includes("medicine") ||
        questionLower.includes("drug") ||
        questionLower.includes("surgery") ||
        questionLower.includes("operation");

      // Check if it's a prevention question
      const isPreventionQuestion =
        questionLower.includes("prevent") ||
        questionLower.includes("prevention") ||
        questionLower.includes("avoid") ||
        questionLower.includes("reduce risk");

      // Check if it's a symptoms question
      const isSymptomsQuestion =
        questionLower.includes("symptom") ||
        questionLower.includes("sign") ||
        questionLower.includes("what are the") ||
        questionLower.includes("how do you know");

      // Build search terms based on question type and mentioned conditions
      if (mentionedConditions.length > 0) {
        // If specific conditions are mentioned, search for them
        searchTerms = mentionedConditions.slice(0, 2); // Limit to 2 conditions

        // Add specific search terms based on question type
        if (isTreatmentQuestion) {
          searchTerms = searchTerms.map(
            (condition) => `${condition} treatment`,
          );
        } else if (isPreventionQuestion) {
          searchTerms = searchTerms.map(
            (condition) => `${condition} prevention`,
          );
        } else if (isSymptomsQuestion) {
          searchTerms = searchTerms.map((condition) => `${condition} symptoms`);
        }
      } else {
        // No specific conditions mentioned, try to extract key medical terms
        const medicalKeywords = [
          "blood pressure",
          "blood sugar",
          "cholesterol",
          "heart rate",
          "blood test",
          "vaccination",
          "immunization",
          "antibiotic",
          "virus",
          "bacteria",
          "infection",
          "inflammation",
          "immune system",
          "metabolism",
          "hormone",
          "insulin",
          "thyroid",
          "vitamin",
          "mineral",
          "nutrition",
          "diet",
          "exercise",
          "sleep",
          "stress",
          "mental health",
          "physical therapy",
          "rehabilitation",
          "diagnosis",
          "prognosis",
        ];

        const foundKeywords = medicalKeywords.filter((keyword) =>
          questionLower.includes(keyword),
        );

        if (foundKeywords.length > 0) {
          searchTerms = foundKeywords.slice(0, 2);
        } else {
          // Fallback: extract meaningful words but filter better
          const questionWords = questionLower.split(" ");
          const meaningfulWords = questionWords.filter(
            (word) =>
              word.length > 5 && // Longer words more likely to be meaningful
              ![
                "what",
                "when",
                "where",
                "which",
                "should",
                "could",
                "would",
                "about",
                "treatment",
                "symptom",
                "condition",
                "disease",
              ].includes(word),
          );

          if (meaningfulWords.length > 0) {
            searchTerms = meaningfulWords.slice(0, 2);
          } else {
            searchTerms = ["general medicine", "health information"];
          }
        }
      }
    }

    // Search Wikipedia for each term
    const wikipediaResults = [];
    let wikipediaAvailable = true;

    for (const term of searchTerms.slice(0, 3)) {
      // Limit to 3 searches
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        // Search for the term
        const searchResponse = await fetch(
          `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`,
          {
            headers: {
              "User-Agent": "InMind-Medical-App/1.0 (educational-purpose)",
            },
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (searchResponse.ok) {
          const summary = await searchResponse.json();
          wikipediaResults.push({
            title: summary.title,
            extract: summary.extract,
            url: summary.content_urls?.desktop?.page || "",
            term: term,
          });
        } else {
          // Try alternative search if direct page not found
          const altController = new AbortController();
          const altTimeoutId = setTimeout(() => altController.abort(), 5000);

          const altSearchResponse = await fetch(
            `https://${language}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(term)}&limit=1&format=json&origin=*`,
            {
              headers: {
                "User-Agent": "InMind-Medical-App/1.0 (educational-purpose)",
              },
              signal: altController.signal,
            },
          );

          clearTimeout(altTimeoutId);

          if (altSearchResponse.ok) {
            const altData = await altSearchResponse.json();
            if (altData[1] && altData[1][0] && altData[2] && altData[2][0]) {
              wikipediaResults.push({
                title: altData[1][0],
                extract: altData[2][0],
                url: altData[3] ? altData[3][0] : "",
                term: term,
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching Wikipedia data for ${term}:`, error);
        wikipediaAvailable = false;
        // Continue trying other terms even if one fails
      }
    }

    // Format the response based on language and analysis type
    let formattedResponse = "";

    if (language === "es") {
      if (analysisType === "symptoms") {
        formattedResponse = formatSpanishSymptomResponse(
          wikipediaResults,
          symptoms,
          !wikipediaAvailable,
        );
      } else {
        formattedResponse = formatSpanishQuestionResponse(
          wikipediaResults,
          question,
          !wikipediaAvailable,
        );
      }
    } else if (language === "pt") {
      if (analysisType === "symptoms") {
        formattedResponse = formatPortugueseSymptomResponse(
          wikipediaResults,
          symptoms,
          !wikipediaAvailable,
        );
      } else {
        formattedResponse = formatPortugueseQuestionResponse(
          wikipediaResults,
          question,
          !wikipediaAvailable,
        );
      }
    } else if (language === "fr") {
      if (analysisType === "symptoms") {
        formattedResponse = formatFrenchSymptomResponse(
          wikipediaResults,
          symptoms,
          !wikipediaAvailable,
        );
      } else {
        formattedResponse = formatFrenchQuestionResponse(
          wikipediaResults,
          question,
          !wikipediaAvailable,
        );
      }
    } else {
      if (analysisType === "symptoms") {
        formattedResponse = formatEnglishSymptomResponse(
          wikipediaResults,
          symptoms,
          !wikipediaAvailable,
        );
      } else {
        formattedResponse = formatEnglishQuestionResponse(
          wikipediaResults,
          question,
          !wikipediaAvailable,
        );
      }
    }

    return Response.json({ response: formattedResponse });
  } catch (error) {
    console.error("Error in Wikipedia medical API:", error);

    // Return a fallback response instead of an error
    const fallbackResponse = `**Medical Information**\n\nI'm currently experiencing technical difficulties accessing external medical databases. However, I can still provide general guidance:\n\n**Important:** For any health concerns, please consult with healthcare professionals immediately. They can provide proper diagnosis and treatment.\n\n**General Medical Advice:**\n- Contact your primary care physician for evaluation\n- If symptoms are severe or sudden, seek immediate medical attention\n- Keep track of your symptoms to discuss with healthcare providers\n- Don't delay seeking professional medical care\n\n**Medical Disclaimer:** This tool is for educational purposes only and should never replace professional medical advice, diagnosis, or treatment.`;

    return Response.json({ response: fallbackResponse });
  }
}

function formatEnglishSymptomResponse(results, symptoms, isOffline = false) {
  let response = `**Medical Information Based on Your Symptoms**\n\n`;
  response += `**Symptoms Described:** ${symptoms}\n\n`;

  if (isOffline) {
    response += `**Note:** External medical databases are currently unavailable, but I can still provide general guidance.\n\n`;
  }

  if (results.length === 0) {
    response += `**General Medical Advice:**\n`;
    response += `Based on your symptoms, it's important to consult with a healthcare professional for proper evaluation. `;
    response += `Neurological symptoms can have various causes and require professional assessment.\n\n`;

    // Add specific advice based on symptoms
    const symptomsLower = symptoms.toLowerCase();
    if (symptomsLower.includes("memory") || symptomsLower.includes("forget")) {
      response += `**Memory-related symptoms** may be associated with various conditions including stress, depression, medication effects, or neurological conditions. A comprehensive evaluation by a healthcare provider is essential.\n\n`;
    }
    if (symptomsLower.includes("tremor") || symptomsLower.includes("shake")) {
      response += `**Tremors** can have many causes including essential tremor, Parkinson's disease, medication effects, or other conditions. A neurologist can help determine the cause.\n\n`;
    }
    if (symptomsLower.includes("balance") || symptomsLower.includes("walk")) {
      response += `**Balance and walking difficulties** should be evaluated promptly, especially if they developed suddenly. These may require immediate medical attention.\n\n`;
    }
  } else {
    response += `**Related Medical Conditions Found:**\n\n`;

    results.forEach((result, index) => {
      response += `**${index + 1}. ${result.title}**\n`;
      response += `${result.extract}\n`;
      if (result.url) {
        response += `Learn more: ${result.url}\n`;
      }
      response += `\n`;
    });
  }

  response += `**Important Medical Disclaimer:**\n`;
  response += `This information is for educational purposes only and should NOT replace professional medical diagnosis. `;
  response += `Please consult with healthcare professionals, especially neurologists or specialists, for accurate diagnosis and treatment.\n\n`;
  response += `**Recommended Next Steps:**\n`;
  response += `1. Schedule an appointment with your primary care physician\n`;
  response += `2. Consider consulting a neurologist if symptoms persist\n`;
  response += `3. Keep a symptom diary to track changes\n`;
  response += `4. Discuss any concerns with qualified medical professionals`;

  return response;
}

function formatEnglishQuestionResponse(results, question, isOffline = false) {
  let response = `**Medical Information Response**\n\n`;
  response += `**Your Question:** ${question}\n\n`;

  if (isOffline) {
    response += `**Note:** External medical databases are currently unavailable, but I can still provide general guidance.\n\n`;
  }

  if (results.length === 0) {
    response += `**General Medical Information:**\n`;
    response += `For accurate medical information, I recommend consulting with healthcare professionals or reliable medical sources. `;
    response += `Medical questions often require personalized assessment by qualified practitioners.\n\n`;

    // Provide basic guidance based on common questions
    const questionLower = question.toLowerCase();
    if (questionLower.includes("treatment") || questionLower.includes("cure")) {
      response += `**Treatment Information:** Medical treatments vary greatly depending on the specific condition, severity, and individual patient factors. Only qualified healthcare providers can prescribe appropriate treatments.\n\n`;
    }
    if (
      questionLower.includes("diagnosis") ||
      questionLower.includes("diagnose")
    ) {
      response += `**Diagnosis Information:** Medical diagnosis requires professional evaluation, often including physical examination, medical history, and appropriate tests. Self-diagnosis can be dangerous.\n\n`;
    }
    if (
      questionLower.includes("prevent") ||
      questionLower.includes("prevention")
    ) {
      response += `**Prevention Information:** Many conditions can be prevented or their risk reduced through healthy lifestyle choices, regular check-ups, and following medical advice.\n\n`;
    }
  } else {
    response += `**Related Medical Information:**\n\n`;

    results.forEach((result, index) => {
      response += `**${index + 1}. ${result.title}**\n`;
      response += `${result.extract}\n`;
      if (result.url) {
        response += `Source: ${result.url}\n`;
      }
      response += `\n`;
    });
  }

  response += `**Medical Disclaimer:**\n`;
  response += `This information is educational only. Always consult healthcare professionals for medical advice, diagnosis, or treatment decisions.`;

  return response;
}

function formatSpanishSymptomResponse(results, symptoms, isOffline = false) {
  let response = `**Información Médica Basada en Sus Síntomas**\n\n`;
  response += `**Síntomas Descritos:** ${symptoms}\n\n`;

  if (isOffline) {
    response += `**Nota:** Las bases de datos médicas externas no están disponibles actualmente, pero aún puedo proporcionar orientación general.\n\n`;
  }

  if (results.length === 0) {
    response += `**Consejo Médico General:**\n`;
    response += `Basado en sus síntomas, es importante consultar con un profesional de la salud para una evaluación adecuada. `;
    response += `Los síntomas neurológicos pueden tener varias causas y requieren evaluación profesional.\n\n`;
  } else {
    response += `**Condiciones Médicas Relacionadas Encontradas:**\n\n`;

    results.forEach((result, index) => {
      response += `**${index + 1}. ${result.title}**\n`;
      response += `${result.extract}\n`;
      if (result.url) {
        response += `Más información: ${result.url}\n`;
      }
      response += `\n`;
    });
  }

  response += `**Descargo Médico Importante:**\n`;
  response += `Esta información es solo para fines educativos y NO debe reemplazar el diagnóstico médico profesional. `;
  response += `Consulte con profesionales de la salud, especialmente neurólogos o especialistas, para un diagnóstico y tratamiento precisos.\n\n`;
  response += `**Próximos Pasos Recomendados:**\n`;
  response += `1. Programe una cita con su médico de atención primaria\n`;
  response += `2. Considere consultar a un neurólogo si los síntomas persisten\n`;
  response += `3. Mantenga un diario de síntomas para hacer seguimiento\n`;
  response += `4. Discuta cualquier preocupación con profesionales médicos calificados`;

  return response;
}

function formatSpanishQuestionResponse(results, question, isOffline = false) {
  let response = `**Respuesta de Información Médica**\n\n`;
  response += `**Su Pregunta:** ${question}\n\n`;

  if (isOffline) {
    response += `**Nota:** Las bases de datos médicas externas no están disponibles actualmente, pero aún puedo proporcionar orientación general.\n\n`;
  }

  if (results.length === 0) {
    response += `**Información Médica General:**\n`;
    response += `Para información médica precisa, recomiendo consultar con profesionales de la salud o fuentes médicas confiables. `;
    response += `Las preguntas médicas a menudo requieren evaluación personalizada por profesionales calificados.\n\n`;
  } else {
    response += `**Información Médica Relacionada:**\n\n`;

    results.forEach((result, index) => {
      response += `**${index + 1}. ${result.title}**\n`;
      response += `${result.extract}\n`;
      if (result.url) {
        response += `Fuente: ${result.url}\n`;
      }
      response += `\n`;
    });
  }

  response += `**Descargo Médico:**\n`;
  response += `Esta información es solo educativa. Siempre consulte a profesionales de la salud para consejos médicos, diagnóstico o decisiones de tratamiento.`;

  return response;
}

function formatPortugueseSymptomResponse(results, symptoms, isOffline = false) {
  let response = `**Informações Médicas Baseadas em Seus Sintomas**\n\n`;
  response += `**Sintomas Descritos:** ${symptoms}\n\n`;

  if (isOffline) {
    response += `**Nota:** As bases de dados médicas externas estão atualmente indisponíveis, mas ainda posso fornecer orientação geral.\n\n`;
  }

  if (results.length === 0) {
    response += `**Conselho Médico Geral:**\n`;
    response += `Com base em seus sintomas, é importante consultar um profissional de saúde para avaliação adequada. `;
    response += `Sintomas neurológicos podem ter várias causas e requerem avaliação profissional.\n\n`;
  } else {
    response += `**Condições Médicas Relacionadas Encontradas:**\n\n`;

    results.forEach((result, index) => {
      response += `**${index + 1}. ${result.title}**\n`;
      response += `${result.extract}\n`;
      if (result.url) {
        response += `Saiba mais: ${result.url}\n`;
      }
      response += `\n`;
    });
  }

  response += `**Aviso Médico Importante:**\n`;
  response += `Esta informação é apenas para fins educacionais e NÃO deve substituir o diagnóstico médico profissional. `;
  response += `Consulte profissionais de saúde, especialmente neurologistas ou especialistas, para diagnóstico e tratamento precisos.\n\n`;
  response += `**Próximos Passos Recomendados:**\n`;
  response += `1. Agende uma consulta com seu médico de cuidados primários\n`;
  response += `2. Considere consultar um neurologista se os sintomas persistirem\n`;
  response += `3. Mantenha um diário de sintomas para acompanhar mudanças\n`;
  response += `4. Discuta quaisquer preocupações com profissionais médicos qualificados`;

  return response;
}

function formatPortugueseQuestionResponse(
  results,
  question,
  isOffline = false,
) {
  let response = `**Resposta de Informações Médicas**\n\n`;
  response += `**Sua Pergunta:** ${question}\n\n`;

  if (isOffline) {
    response += `**Nota:** As bases de dados médicas externas estão atualmente indisponíveis, mas ainda posso fornecer orientação geral.\n\n`;
  }

  if (results.length === 0) {
    response += `**Informações Médicas Gerais:**\n`;
    response += `Para informações médicas precisas, recomendo consultar profissionais de saúde ou fontes médicas confiáveis. `;
    response += `Perguntas médicas frequentemente requerem avaliação personalizada por profissionais qualificados.\n\n`;
  } else {
    response += `**Informações Médicas Relacionadas:**\n\n`;

    results.forEach((result, index) => {
      response += `**${index + 1}. ${result.title}**\n`;
      response += `${result.extract}\n`;
      if (result.url) {
        response += `Fonte: ${result.url}\n`;
      }
      response += `\n`;
    });
  }

  response += `**Aviso Médico:**\n`;
  response += `Esta informação é apenas educacional. Sempre consulte profissionais de saúde para conselhos médicos, diagnóstico ou decisões de tratamento.`;

  return response;
}

function formatFrenchSymptomResponse(results, symptoms, isOffline = false) {
  let response = `**Informations Médicales Basées sur Vos Symptômes**\n\n`;
  response += `**Symptômes Décrits:** ${symptoms}\n\n`;

  if (isOffline) {
    response += `**Note:** Les bases de données médicales externes sont actuellement indisponibles, mais je peux encore fournir des conseils généraux.\n\n`;
  }

  if (results.length === 0) {
    response += `**Conseil Médical Général:**\n`;
    response += `Basé sur vos symptômes, il est important de consulter un professionnel de la santé pour une évaluation appropriée. `;
    response += `Les symptômes neurologiques peuvent avoir diverses causes et nécessitent une évaluation professionnelle.\n\n`;
  } else {
    response += `**Conditions Médicales Connexes Trouvées:**\n\n`;

    results.forEach((result, index) => {
      response += `**${index + 1}. ${result.title}**\n`;
      response += `${result.extract}\n`;
      if (result.url) {
        response += `En savoir plus: ${result.url}\n`;
      }
      response += `\n`;
    });
  }

  response += `**Avertissement Médical Important:**\n`;
  response += `Cette information est à des fins éducatives uniquement et ne doit PAS remplacer le diagnostic médical professionnel. `;
  response += `Consultez des professionnels de la santé, en particulier des neurologues ou spécialistes, pour un diagnostic et traitement précis.\n\n`;
  response += `**Prochaines Étapes Recommandées:**\n`;
  response += `1. Programmez un rendez-vous avec votre médecin de soins primaires\n`;
  response += `2. Considérez consulter un neurologue si les symptômes persistent\n`;
  response += `3. Tenez un journal des symptômes pour suivre les changements\n`;
  response += `4. Discutez de toute préoccupation avec des professionnels médicaux qualifiés`;

  return response;
}

function formatFrenchQuestionResponse(results, question, isOffline = false) {
  let response = `**Réponse d'Informations Médicales**\n\n`;
  response += `**Votre Question:** ${question}\n\n`;

  if (isOffline) {
    response += `**Note:** Les bases de données médicales externes sont actuellement indisponibles, mais je peux encore fournir des conseils généraux.\n\n`;
  }

  if (results.length === 0) {
    response += `**Informations Médicales Générales:**\n`;
    response += `Pour des informations médicales précises, je recommande de consulter des professionnels de la santé ou des sources médicales fiables. `;
    response += `Les questions médicales nécessitent souvent une évaluation personnalisée par des praticiens qualifiés.\n\n`;
  } else {
    response += `**Informations Médicales Connexes:**\n\n`;

    results.forEach((result, index) => {
      response += `**${index + 1}. ${result.title}**\n`;
      response += `${result.extract}\n`;
      if (result.url) {
        response += `Source: ${result.url}\n`;
      }
      response += `\n`;
    });
  }

  response += `**Avertissement Médical:**\n`;
  response += `Cette information est éducative uniquement. Consultez toujours des professionnels de la santé pour des conseils médicaux, diagnostic ou décisions de traitement.`;

  return response;
}
