import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UpdateAdminPassword.scss"

const UpdateAdminPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email"); // Récupérer l'email depuis l'URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  

  // ✅ Vérifier si l'email est bien récupéré
  useEffect(() => {
    console.log("📌 Email récupéré :", email);
    
    if (email === null) {
        return;  // Attendre avant de rediriger
    }

    if (!email) {
        alert("❌ Erreur : Email non trouvé. Redirection vers SignIn");
        navigate("/signin");
    }
}, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/users/updateAdminPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Mot de passe mis à jour avec succès !");
        navigate("/signin");  // Redirection vers Sign In après mise à jour
      } else {
        setError(data.message || "Une erreur s'est produite.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      setError("❌ Une erreur s'est produite, veuillez réessayer.");
    }
  };

  return (
    <div className="container">
      <h2>Set your password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Confirm</button>
      </form>
    </div>
  );
};

export default UpdateAdminPassword;
