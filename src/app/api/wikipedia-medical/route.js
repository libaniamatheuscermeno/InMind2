function formatFrenchQuestionResponse(results, question) {
  let response = `**Réponse d'Informations Médicales**\n\n`;
  response += `**Votre Question:** ${question}\n\n`;
  
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
