import { useEffect, useState } from "react";
import './noticeWebsite';

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
        <div className="container">
            <h2>Give Your Feedback</h2>
            {client ? (
                <form onSubmit={handleSubmit} className="form-container">
                    <p className="client-info"><strong>User:</strong> {client}</p>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className="star"
                                style={{ color: star <= rating ? "#FFD700" : "#ccc" }}
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
                    />
                    <button type="submit">Submit</button>
                </form>
            ) : (
                <p>Loading user information...</p>
            )}

            <h2>Customer Reviews</h2>
            <div className="review-list">
                {avis.map((item) => (
                    <div key={item._id} className="review-item">
                        <p className="client-name">{item.client}</p>
                        <div className="stars">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i} className="star" style={{ color: i < item.rating ? "#FFD700" : "#ccc" }}>★</span>
                            ))}
                        </div>
                        <p className="description">{item.description}</p>
                        <p>_________________</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Avis;
