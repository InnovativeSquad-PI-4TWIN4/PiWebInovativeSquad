const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

/**
 * ➤ Obtenir l'embedding d’un texte (renvoie null en cas d’erreur ou quota)
 */
async function getEmbeddingFromCohere(text) {
  try {
    console.log("📨 Texte à embed :", text);
    console.log("🔑 Clé utilisée :", process.env.COHERE_API_KEY?.slice(0, 5) + "***");

    const response = await cohere.embed({
      texts: [text],
      model: "embed-english-v3.0",
      inputType: "search_document", // ✅ Important : camelCase requis ici
    });

    const embeddings = response.embeddings; // ✅ Nouvelle structure du SDK officiel

    if (!embeddings || embeddings.length === 0) {
      console.error("❌ Aucun embedding reçu de Cohere");
      console.error("🔍 Réponse brute:", response);
      return null;
    }

    console.log("✅ Embedding généré (premiers éléments) :", embeddings[0].slice(0, 5));
    return embeddings[0];
  } catch (error) {
    console.error("❌ Erreur Cohere:", error?.response?.body || error.message);
    return null;
  }
}

/**
 * ➤ Comparer deux textes et retourner un score de similarité (0 à 1)
 */
async function getSimilarityScore(text1, text2) {
    try {
      console.log("📥 Texte 1:", text1);
      console.log("📥 Texte 2:", text2);
  
      const response = await cohere.embed({
        texts: [text1, text2],
        model: "embed-english-v3.0",
      });
  
      console.log("📦 Réponse Cohere:", response);
  
      if (!response.embeddings || response.embeddings.length < 2) {
        console.error("❌ Embeddings invalides ou manquants:", response.embeddings);
        return null;
      }
  
      const [embedding1, embedding2] = response.embeddings;
  
      const dot = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
      const norm1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
      const norm2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
  
      const score = dot / (norm1 * norm2);
      console.log("✅ Similarity Score:", score);
      return score;
    } catch (error) {
      console.error("❌ Erreur dans getSimilarityScore:", error?.response?.body || error.message);
      return null;
    }
  }async function getSimilarityScore(text1, text2) {
    try {
      console.log("📥 Texte 1:", text1);
      console.log("📥 Texte 2:", text2);
  
      const response = await cohere.embed({
        texts: [text1, text2],
        model: "embed-english-v3.0",
        inputType: "search_document"  // 🔥 AJOUT OBLIGATOIRE
      });
  
      const [embedding1, embedding2] = response.embeddings;
  
      const dot = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
      const norm1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
      const norm2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
  
      const score = dot / (norm1 * norm2);
      console.log("✅ Similarity Score:", score);
      return score;
    } catch (error) {
      console.error("❌ Erreur dans getSimilarityScore:", error?.response?.body || error.message);
      return null;
    }
  }
  
  

module.exports = {
  getSimilarityScore,
  getEmbeddingFromCohere,
};