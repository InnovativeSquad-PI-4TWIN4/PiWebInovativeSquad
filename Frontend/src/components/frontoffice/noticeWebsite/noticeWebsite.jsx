import { useEffect, useState } from "react";

const Avis = () => {
    const [avis, setAvis] = useState([]);
    const [client, setClient] = useState(null); // Nom du client connecté
    const [rating, setRating] = useState(1);
    const [description, setDescription] = useState("");
    const token = localStorage.getItem("token"); // Récupération du token

    // ✅ Récupérer le nom du client connecté
    useEffect(() => {
        const fetchClientName = async () => {
            try {
                if (!token) {
                    console.error("Aucun token trouvé, redirection vers la connexion.");
                    return;
                }

                const res = await fetch("http://localhost:3000/users/profile", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error("Erreur lors de la récupération du profil");

                const data = await res.json();
                setClient(`${data.user.name} ${data.user.surname}`); // Stocke le nom du client connecté
            } catch (error) {
                console.error("Erreur lors de la récupération du client :", error);
            }
        };

        fetchClientName();
    }, [token]);

    // ✅ Charger les avis existants
    useEffect(() => {
        fetch("http://localhost:3000/Avis/GetAvisList")
            .then(res => res.json())
            .then(data => setAvis(data))
            .catch(err => console.error("Erreur lors du chargement des avis :", err));
    }, []);

    // ✅ Soumettre un nouvel avis
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!client) {
            alert("Erreur : impossible d'identifier l'utilisateur.");
            return;
        }

        const newAvis = { client, rating, description };

        try {
            const res = await fetch("http://localhost:3000/Avis/addAvis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAvis),
            });

            if (!res.ok) throw new Error("Erreur lors de l'ajout de l'avis");

            alert("Avis ajouté !");
            setRating(1);
            setDescription("");
            const updatedAvis = await res.json();
            setAvis([...avis, updatedAvis.avis]);
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'avis :", error);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center" }}>
            {/* Titre sans fond */}
            <h2 style={{ color: "white" }}>Donnez votre avis</h2>
            {client ? (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p style={{ color: "white" }}><strong>Utilisateur :</strong> {client}</p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                style={{
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: star <= rating ? "#FFD700" : "#ccc"
                                }}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>

                    <textarea
                        placeholder="Votre avis..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", backgroundColor: "white" }}
                    />
                    <button type="submit" style={{ padding: "10px", background: "#007BFF", color: "white", border: "none", borderRadius: "5px" }}>
                        Envoyer
                    </button>
                </form>
            ) : (
                <p>Chargement des informations utilisateur...</p>
            )}

            {/* Titre sans fond pour les avis */}
            <h2 style={{ marginTop: "20px", color: "white" }}>
                Avis des Clients
            </h2>

            {/* Affichage des avis */}
            {avis.map((item) => (
                <div
                    key={item._id}
                    style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        margin: "10px",
                        borderRadius: "5px",
                        backgroundColor: "white",
                        color: "black" // Texte noir pour le contenu de chaque avis
                    }}
                >
                    <h4 style={{ color: "black" }}>{item.client}</h4>
                    <p>
                        {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} style={{ color: i < item.rating ? "#FFD700" : "#ccc" }}>★</span>
                        ))}
                    </p>
                    <p style={{ color: "black" }}>{item.description}</p>
                </div>
            ))}
        </div>
    );
};

export default Avis;
