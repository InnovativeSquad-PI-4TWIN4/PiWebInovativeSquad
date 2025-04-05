import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Messenger.scss";
import { FaTrashAlt } from "react-icons/fa";
import {  MdDeleteForever } from "react-icons/md";
import { formatDistanceToNow } from 'date-fns';
const Messenger = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({}); // ✅ NEW: Unread messages count

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
            fetchUnreadCounts(); // ✅ Fetch unread counts on load
        } else {
            navigate("/signin");
        }
    }, [navigate, token]);

    // ✅ Fetch unread message counts
    const fetchUnreadCounts = async () => {
        if (!userId) return;

        try {
            const response = await fetch(`http://localhost:3000/messages/unread-counts/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCounts(data.unreadCounts);
            } else {
                console.error("Erreur lors du chargement des messages non lus");
            }
        } catch (err) {
            console.error("Erreur réseau (unreadCounts):", err);
        }
    };
    //fetchUnreadCounts();
    
    // ✅ Fetch messages when a user is selected
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    // ✅ Start chat
    const startChat = (user) => {
        setSelectedUser(user);
        // Optionally reset unread count immediately
        setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));
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
            fetchUnreadCounts(); // ✅ Refresh counts

            // ✅ Mark messages as read
            data.messages.forEach(async (msg) => {
                if (!msg.read) {
                    await markMessageAsRead(msg._id);
                }
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

        //delete message
    const handleDeleteMessage = async (messageId) => {
    if (!messageId || !userId) return;

    const confirm = window.confirm("Voulez-vous vraiment supprimer ce message ?");
    if (!confirm) return;

    try {
        const response = await fetch(`http://localhost:3000/messages/delete-message/${messageId}/${userId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            // Retire le message supprimé du state
            setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
        } else {
            const data = await response.json();
            alert(data.message || "Erreur lors de la suppression.");
        }
    } catch (error) {
        console.error("Erreur lors de la suppression du message :", error);
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
                fetchUnreadCounts(); // ✅ Refresh counts after sending
                setMessageText("");
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
    {users.map((user) => {
        const count = unreadCounts[user._id] || 0;

        return (
            <li
                key={user._id}
                onClick={() => startChat(user)}
                className={selectedUser?._id === user._id ? "active" : ""}
            >
                <div className="user-info">
                    <img
                        src={user.image ? `http://localhost:3000${user.image}` : "/default-profile.png"}
                        alt="Profile"
                        className="profile-image"
                    />
                    <span className="user-name">
                        {user.name} {user.surname}
                    </span>

                    {/* Badge des messages non lus */}
                    {count > 0 && <span className="unread-badge">{count}</span>}
                </div>
            </li>
        );
    })}
</ul>

            </div>

            <div className="chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h3>{selectedUser.name} {selectedUser.surname}<p> Skill : {selectedUser.Skill} </p>
                            </h3>
                        </div>
                                   
                        
                        <div className="messages">
                            
                            {messages.map((msg) => (
                                
                                <div key={msg._id} className={msg.sender._id === userId ? "message sent" : "message received"}>
   <small className="timestamp">
        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
      </small>
    <div className="message-row">
    
        {msg.sender._id === userId && (
            <button className="delete-float-btn" onClick={() => handleDeleteMessage(msg._id)}>
                <MdDeleteForever size={22} />
            </button>
        )}
       <div className={`message-content ${msg.sender._id === userId ? "sent" : "received"}`}>
            <p>{msg.sender._id === userId ? "You" : msg.sender.name}</p>
            <h4>{msg.content}</h4>
            {msg.sender._id === userId && (
                <span className={msg.read ? "read" : "unread"}>
                    {msg.read ? "seen ✔✔" : "✔"}
                </span>
            )}
        </div>
    </div>
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
