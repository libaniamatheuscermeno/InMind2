export async function POST(request) {
  try {
    const { symptoms, question, language = 'en' } = await request.json();
    
    let searchTerms = [];
    let analysisType = '';
    
    if (symptoms) {
      analysisType = 'symptoms';
      // Extract medical terms from symptoms for Wikipedia search
      const commonNeurologicalTerms = [
        'memory loss', 'tremor', 'alzheimer', 'parkinson', 'multiple sclerosis',
        'ALS', 'huntington', 'dementia', 'seizure', 'stroke', 'migraine',
        'neuropathy', 'dystonia', 'ataxia', 'aphasia', 'dysarthria'
      ];
      
      const symptomsLower = symptoms.toLowerCase();
      searchTerms = commonNeurologicalTerms.filter(term => 
        symptomsLower.includes(term.toLowerCase()) || 
        symptomsLower.includes(term.toLowerCase().replace(' ', ''))
      );
      
      // Add general neurological searches if no specific terms found
      if (searchTerms.length === 0) {
        if (symptomsLower.includes('memory') || symptomsLower.includes('forget')) {
          searchTerms.push('dementia', 'alzheimer disease');
        }
        if (symptomsLower.includes('shake') || symptomsLower.includes('tremor')) {
          searchTerms.push('parkinson disease', 'essential tremor');
        }
        if (symptomsLower.includes('walk') || symptomsLower.includes('balance')) {
          searchTerms.push('gait disorder', 'ataxia');
        }
        if (symptomsLower.includes('speech') || symptomsLower.includes('talk')) {
          searchTerms.push('aphasia', 'dysarthria');
        }
        if (searchTerms.length === 0) {
          searchTerms.push('neurodegenerative disease', 'neurological disorder');
        }
      }
    } else if (question) {
      analysisType = 'question';
      // Extract key medical terms from the question
      const questionWords = question.toLowerCase().split(' ');
      const medicalKeywords = questionWords.filter(word => 
        word.length > 4 && !['what', 'when', 'where', 'which', 'should', 'could', 'would'].includes(word)
      );
      searchTerms = medicalKeywords.slice(0, 3);
      
      if (searchTerms.length === 0) {
        searchTerms.push('medical condition', 'health');
      }
    }

    // Search Wikipedia for each term
    const wikipediaResults = [];
    
    for (const term of searchTerms.slice(0, 3)) { // Limit to 3 searches
      try {
        // Search for the term
        const searchResponse = await fetch(
          `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`,
          {
            headers: {
              'User-Agent': 'InMind-Medical-App/1.0 (educational-purpose)'
            }
          }
        );
        
        if (searchResponse.ok) {
          const summary = await searchResponse.json();
          wikipediaResults.push({
            title: summary.title,
            extract: summary.extract,
            url: summary.content_urls?.desktop?.page || '',
            term: term
          });
        } else {
          // Try alternative search if direct page not found
          const altSearchResponse = await fetch(
            `https://${language}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(term)}&limit=1&format=json&origin=*`,
            {
              headers: {
                'User-Agent': 'InMind-Medical-App/1.0 (educational-purpose)'
              }
            }
          );
          
          if (altSearchResponse.ok) {
            const altData = await altSearchResponse.json();
            if (altData[1] && altData[1][0] && altData[2] && altData[2][0]) {
              wikipediaResults.push({
                title: altData[1][0],
                extract: altData[2][0],
                url: altData[3] ? altData[3][0] : '',
                term: term
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching Wikipedia data for ${term}:`, error);
      }
    }

    // Format the response based on language and analysis type
    let formattedResponse = '';
    
    if (language === 'es') {
      if (analysisType === 'symptoms') {
        formattedResponse = formatSpanishSymptomResponse(wikipediaResults, symptoms);
      } else {
        formattedResponse = formatSpanishQuestionResponse(wikipediaResults, question);
      }
    } else if (language === 'pt') {
      if (analysisType === 'symptoms') {
        formattedResponse = formatPortugueseSymptomResponse(wikipediaResults, symptoms);
      } else {
        formattedResponse = formatPortugueseQuestionResponse(wikipediaResults, question);
      }
    } else if (language === 'fr') {
      if (analysisType === 'symptoms') {
        formattedResponse = formatFrenchSymptomResponse(wikipediaResults, symptoms);
      } else {
        formattedResponse = formatFrenchQuestionResponse(wikipediaResults, question);
      }
    } else {
      if (analysisType === 'symptoms') {
        formattedResponse = formatEnglishSymptomResponse(wikipediaResults, symptoms);
      } else {
        formattedResponse = formatEnglishQuestionResponse(wikipediaResults, question);
      }
    }

    return Response.json({ response: formattedResponse });
    
  } catch (error) {
    console.error('Error in Wikipedia medical API:', error);
    return Response.json(
      { error: 'Failed to fetch medical information' },
      { status: 500 }
    );
  }
}

function formatEnglishSymptomResponse(results, symptoms) {
  let response = `**Medical Information Based on Your Symptoms**\n\n`;
  response += `**Symptoms Described:** ${symptoms}\n\n`;
  
  if (results.length === 0) {
    response += `**General Medical Advice:**\n`;
    response += `Based on your symptoms, it's important to consult with a healthcare professional for proper evaluation. `;
    response += `Neurological symptoms can have various causes and require professional assessment.\n\n`;
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

function formatEnglishQuestionResponse(results, question) {
  let response = `**Medical Information Response**\n\n`;
  response += `**Your Question:** ${question}\n\n`;
  
  if (results
