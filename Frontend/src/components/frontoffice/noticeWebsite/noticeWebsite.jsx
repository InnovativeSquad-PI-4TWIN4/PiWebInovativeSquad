import { useEffect, useState } from "react";

const Avis = () => {
    const [avis, setAvis] = useState([]);
    const [client, setClient] = useState(null);
    const [rating, setRating] = useState(1);
    const [description, setDescription] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchClientName = async () => {
            try {
                if (!token) {
                    console.error("No token found, redirecting to login.");
                    return;
                }
                const res = await fetch("http://localhost:3000/users/profile", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Error fetching profile");
                const data = await res.json();
                setClient(`${data.user.name} ${data.user.surname}`);
            } catch (error) {
                console.error("Error fetching client:", error);
            }
        };
        fetchClientName();
    }, [token]);

    useEffect(() => {
        fetch("http://localhost:3000/Avis/GetAvisList")
            .then(res => res.json())
            .then(data => setAvis(data))
            .catch(err => console.error("Error loading reviews:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!client) {
            alert("Error: Unable to identify the user.");
            return;
        }

        const newAvis = { client, rating, description };
        try {
            const res = await fetch("http://localhost:3000/Avis/addAvis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAvis),
            });

            if (!res.ok) throw new Error("Error adding review");
            alert("Review added!");
            setRating(1);
            setDescription("");
            const updatedAvis = await res.json();
            setAvis([...avis, updatedAvis.avis]);
        } catch (error) {
            console.error("Error adding review:", error);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center" }}>
            <h2 style={{ color: "white" }}>Give Your Feedback</h2>
            {client ? (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p style={{ color: "white" }}><strong>User:</strong> {client}</p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                style={{ fontSize: "24px", cursor: "pointer", color: star <= rating ? "#FFD700" : "#ccc" }}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <textarea
                        placeholder="Your review..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", backgroundColor: "white" }}
                    />
                    <button type="submit" style={{ padding: "10px", background: "#007BFF", color: "white", border: "none", borderRadius: "5px" }}>
                        Submit
                    </button>
                </form>
            ) : (
                <p>Loading user information...</p>
            )}

            <h2 style={{ marginTop: "20px", color: "white" }}>Customer Reviews</h2>
            <div style={{ maxHeight: "300px", overflowY: "auto", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "white" }}>
                {avis.map((item) => (
                    <div key={item._id} style={{ borderBottom: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
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
        </div>
    );
};

export default Avis;