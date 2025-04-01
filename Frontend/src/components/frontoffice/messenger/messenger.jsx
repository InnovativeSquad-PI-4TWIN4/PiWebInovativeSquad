import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Messenger.scss';

const Messenger = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();
    const [messageText, setMessageText] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:3000/users/getAllUsers", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) return console.error("Failed to fetch users");
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        if (token) {
            fetchUsers();
        } else {
            navigate("/signin");
        }
    }, [navigate, token]);

    const startChat = (user) => {
        setSelectedUser(user);
        fetchMessages(user._id);
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/messages/conversation/${userId}?page=1&limit=10`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) return console.error("Failed to fetch messages");
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };
   
    const sendMessage = async () => {
        if (!messageText.trim()) {
            console.error("Le message est vide.");
            return;
        }
    
        const user = JSON.parse(localStorage.getItem("user"));
        const senderId = user?.id;  
        const receiverId = selectedUser?._id;
    
        if (!senderId || !receiverId) {
            console.error("Erreur : Champs manquants.");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:3000/messages/send-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ senderId, receiverId, content: messageText })
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log("Message envoyé :", data);
                
                // Met à jour la liste des messages en ajoutant le nouveau message
                setMessages((prevMessages) => [...prevMessages, data.savedMessage]);
                await fetchMessages();
                setMessageText(""); // Réinitialise l'input après l'envoi
            } else {
                console.error("Erreur backend :", data.error);
            }
        } catch (error) {
            console.error("Erreur d'envoi :", error);
        }
    };
    
    
       

    return (
        <div className="messenger-container">
            <div className="sidebar">
    <input type="text" placeholder="Search..." className="search-bar" />
    <ul className="user-list">
        {users.map((user) => (
            <li 
                key={user._id} 
                onClick={() => startChat(user)} 
                className={selectedUser?._id === user._id ? "active" : ""}
            >
                <div className="user-info">
                    {/* Image de profil */}
                    <img
                        src={user.image ? `http://localhost:3000${user.image}` : "/default-profile.png"}
                        alt="Profil"
                        className="profile-image"
                    />
                    {/* Nom et prénom */}
                    <span className="user-name">{user.name} {user.surname}</span>
                </div>
            </li>
        ))}
    </ul>
</div>


            <div className="chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h3>{selectedUser.name}</h3>
                        </div>
                        <div className="messages">
                            {messages.map((msg) => (
                                <div key={msg._id} className={msg.sender._id === userId ? "message sent" : "message received"}>
                                    <p>{msg.sender._id === userId ? "You" : msg.sender.name}</p>
                                    <h4>{msg.content}</h4>
                                </div>
                            ))}
                        </div>
                        <div className="message-input">
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Write a message..."
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">Select a user to start chatting</div>
                )}
            </div>
        </div>
    );
};

export default Messenger;
