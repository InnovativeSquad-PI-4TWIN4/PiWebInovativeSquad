import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./PackDetails.scss";
import PackProgress from "./PackProgress";

const PackDetails = () => {
  const { id } = useParams();
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false); // L'utilisateur a-t-il réussi le quiz ?
  const [showQuiz, setShowQuiz] = useState(true); // Afficher le quiz d'abord
  

  const [question, setQuestion] = useState({
    text: "Quelle est la bibliothèque utilisée pour construire l'interface utilisateur ?",
    options: ["Vue.js", "React", "Laravel", "Django"],
    answer: "React",
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizError, setQuizError] = useState("");

  useEffect(() => {
    const fetchPack = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/packs/getPackById/${id}`);
        setPack(response.data);
      } catch (err) {
        setError("Erreur lors du chargement du pack.");
      } finally {
        setLoading(false);
      }
    };

    fetchPack();
  }, [id]);

  if (loading) return <div className="pack-details">Chargement...</div>;
  if (error) return <div className="pack-details error">{error}</div>;

const handleQuizSubmit = () => {
  if (selectedOption === question.answer) {
    setIsVerified(true);
    setShowQuiz(false);
  } else {
    setQuizError("❌ Mauvaise réponse. Essayez encore !");
  }
};

  return (
    <div className="pack-details">
      <h2>{pack.title}</h2>
      <p><strong>Description :</strong> {pack.description}</p>
      <p><strong>Catégorie :</strong> {pack.category}</p>
      <p><strong>Prix initial :</strong> {pack.price} DT</p>
      <p><strong>Réduction :</strong> {pack.discount}%</p>
      <p><strong>Prix après réduction :</strong> {(pack.price - (pack.price * pack.discount) / 100).toFixed(2)} DT</p>

      <div className="pack-details" >
      <h3 style={{ color: "black" }}>Contenu du Pack :</h3>
      <PackProgress packId={id} />
              </div>

    </div>
  );
};

export default PackDetails;
