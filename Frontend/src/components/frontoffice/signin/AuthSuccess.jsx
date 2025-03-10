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
                    localStorage.setItem("user", JSON.stringify(data)); // Sauvegarder l'utilisateur en local
                    navigate("/"); // Rediriger vers Home (où Navbar affichera le bon utilisateur)
                    window.location.reload(); // Rafraîchir la page pour que Navbar prenne en compte la mise à jour
                } else {
                    navigate("/signin"); // Redirection vers la connexion en cas d'échec
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
