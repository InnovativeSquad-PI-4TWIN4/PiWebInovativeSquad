const axios = require("axios");

exports.generateCommentForPublication = async (description) => {
  console.log("Generating comment suggestions for description:", description);
  console.log("COHERE_API_KEY:", process.env.COHERE_API_KEY ? "Set" : "Not set");

  try {
    const suggestions = [];
    const numberOfSuggestions = 4;

    for (let i = 0; i < numberOfSuggestions; i++) {
      console.log(`Generating suggestion ${i + 1}/${numberOfSuggestions}...`);
      const response = await axios.post(
        "https://api.cohere.ai/v1/generate",
        {
          model: "command",
          prompt: `Rédige un commentaire positif, motivant et court (maximum 4 mots) pour la publication suivante : "${description}". Le commentaire doit être unique et différent des précédents.`,
          max_tokens: 20, // Reduced max_tokens to encourage shorter responses
          temperature: 0.8,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Cohere API response:", JSON.stringify(response.data, null, 2));
      const generation = response.data.generations?.[0];
      if (!generation) {
        console.log("No generations found in response");
        continue;
      }

      let suggestion = generation.text?.trim();
      console.log(`Generated suggestion ${i + 1}:`, suggestion);

      // Trim suggestion to 4 words or fewer
      if (suggestion) {
        const words = suggestion.split(/\s+/);
        if (words.length > 4) {
          suggestion = words.slice(0, 4).join(" ");
          console.log(`Trimmed suggestion ${i + 1} to 4 words:`, suggestion);
        }
        suggestions.push(suggestion);
      } else {
        console.log(`Suggestion ${i + 1} is empty or undefined`);
      }
    }

    console.log("Final suggestions array:", suggestions);
    return suggestions;
  } catch (error) {
    console.error("❌ Erreur Cohere AI :", error.message);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    return [];
  }
};