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
            const response = await fetch(`http://localhost:3000/messages/getMessages/${userId}?page=1&limit=10`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) return console.error("Failed to fetch messages");
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            const response = await fetch("http://localhost:3000/messages/send-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    senderId: userId,
                    receiverId: selectedUser._id,
                    content: message,
                }),
            });

            if (!response.ok) return;
            const data = await response.json();
            setMessages([...messages, data.savedMessage]);
            setMessage('');
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
                            {user.name} {user.surname}
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
                                    <p>{msg.content}</p>
                                    <small>{msg.sender._id === userId ? "You" : msg.sender.name}</small>
                                </div>
                            ))}
                        </div>
                        <div className="message-input">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write a message..."
                            />
                            <button onClick={handleSendMessage}>Send</button>
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
