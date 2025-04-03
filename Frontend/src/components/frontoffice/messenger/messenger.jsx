import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Messenger.scss";

const Messenger = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");

    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id || localStorage.getItem("userId");

    const navigate = useNavigate();

    // ✅ Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:3000/users/getAllUsers", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    console.error("Failed to fetch users");
                    return;
                }
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

    // ✅ Fetch messages when a user is selected
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    // ✅ Start chat
    const startChat = (user) => {
        setSelectedUser(user);
    };

    // ✅ Fetch messages between the logged-in user and the selected user
    const fetchMessages = async (receiverId) => {
        if (!userId || !receiverId) {
            console.error("Missing senderId or receiverId");
            return;
        }

        console.log(`Fetching messages for sender: ${userId}, receiver: ${receiverId}`);

        try {
            const response = await fetch(`http://localhost:3000/messages/conversation/${userId}/${receiverId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                console.error("Failed to fetch messages:", response.statusText);
                return;
            }

            const data = await response.json();
            console.log("Messages received:", data.messages);
            setMessages(data.messages);

            // ✅ Mark messages as read
            data.messages.forEach(async (msg) => {
                if (!msg.read) { // If the message is not already marked as read
                    await markMessageAsRead(msg._id);
                }
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    // ✅ Mark message as read
    const markMessageAsRead = async (messageId) => {
        try {
            const response = await fetch(`http://localhost:3000/messages/mark-as-read/${messageId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error("Failed to mark message as read");
            }
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim()) {
            console.error("Message is empty.");
            return;
        }

        const receiverId = selectedUser?._id;
        if (!userId || !receiverId) {
            console.error("Missing senderId or receiverId.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/messages/send-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ senderId: userId, receiverId, content: messageText }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("Message sent:", data);

                // Add new message to the state
                setMessages((prevMessages) => [...prevMessages, data.savedMessage]);
                fetchMessages(receiverId); // Refetch messages
                setMessageText(""); // Clear input after sending
            } else {
                console.error("Backend error:", data.error);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="messenger-container">
            <div className="sidebar">
                <input type="text" placeholder="Search..." className="search-bar" />
                <ul className="user-list">
                    {users.map((user) => (
                        <li key={user._id} onClick={() => startChat(user)} className={selectedUser?._id === user._id ? "active" : ""}>
                            <div className="user-info">
                                <img
                                    src={user.image ? `http://localhost:3000${user.image}` : "/default-profile.png"}
                                    alt="Profile"
                                    className="profile-image"
                                />
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
                            <h3>{selectedUser.name} {selectedUser.surname}</h3>
                        </div>
                        <div className="messages">
                            {messages.map((msg) => (
                                <div key={msg._id} className={msg.sender._id === userId ? "message sent" : "message received"}>
                                    <p>{msg.sender._id === userId ? "You" : msg.sender.name}</p>
                                    <h4>{msg.content}</h4>

                                    {/* Message status (ticks) */}
                                    {msg.sender._id === userId && (
                                        <div className="message-status">
                                            <span className={msg.read ? "read" : "unread"}>
                                                {msg.read ? "✔ ✔" : "✔"} {/* Checkmark for sent messages */}
                                            </span>
                                        </div>
                                    )}
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
