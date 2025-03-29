import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3000/auth/current_user", {
            credentials: "include",
        })
        .then((res) => res.json())
        .then((data) => {
            if (data && data.id) {
                const formattedUser = {
                    ...data,
                    _id: data.id, // ✅ Ajoute le champ _id
                };
                localStorage.setItem("user", JSON.stringify(formattedUser));
                navigate("/");
                window.location.reload();
            } else {
                navigate("/signin");
            }
        })
        
            .catch((err) => {
                console.error("Erreur lors de la récupération de l'utilisateur :", err);
                navigate("/signin"); // Redirection en cas d'erreur
            });
    }, [navigate]);

    return <p>Connexion réussie... Redirection en cours ⏳</p>;
};

export default AuthSuccess;
