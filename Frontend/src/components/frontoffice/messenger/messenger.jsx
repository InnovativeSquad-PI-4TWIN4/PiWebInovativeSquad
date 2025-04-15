import React, { useEffect, useState ,useRef} from "react";
import { useNavigate } from "react-router-dom";
import "./Messenger.scss";
import { FaTrashAlt } from "react-icons/fa";
import {  MdDeleteForever } from "react-icons/md";
import { formatDistanceToNow } from 'date-fns';
import { io } from "socket.io-client";

const Messenger = () => {
    const recognitionRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({}); // ✅ NEW: Unread messages count
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null); // ✅ Ajout de typingUser
    const [onlineUsers, setOnlineUsers] = useState([]);
   
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id || localStorage.getItem("userId");

    const navigate = useNavigate();
    const socket = useRef(null); // ✅ Ref pour socket

    let typingTimeout = null;
    const typingTimeoutRef = useRef(null);

    
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("La reconnaissance vocale n'est pas prise en charge par ce navigateur.");
    return;
  }

  recognitionRef.current = new SpeechRecognition();
  recognitionRef.current.continuous = false;
  recognitionRef.current.interimResults = false;
  recognitionRef.current.lang = "fr-FR";

  recognitionRef.current.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    console.log("📝 Texte dicté :", speechToText);
    setMessageText(prev => prev + " " + speechToText); // ✅ cette ligne ajoute bien le texte
  };

  recognitionRef.current.onend = () => {
    setIsRecording(false);
    console.log("🎤 Reconnaissance terminée.");
  };

  recognitionRef.current.onerror = (event) => {
    console.error("❌ Erreur de reconnaissance vocale :", event.error);
    setIsRecording(false);
  };
        socket.current = io("http://localhost:3000");

        if (!socket.current) return;

        if (userId) {
            socket.current.emit("join", userId);
        }

        socket.current.on("userTyping", (fromUser) => {
            setIsTyping(true);
            setTypingUser(fromUser.name);
        });

        socket.current.on("userStopTyping", () => {
            setIsTyping(false);
            setTypingUser(null);
        });

        socket.current.on("onlineUsers", (onlineUserIds) => {
            console.log("Utilisateurs en ligne :", onlineUserIds);
            setOnlineUsers(onlineUserIds.map(id => id.toString()));
        });
        
              
           
          
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
            fetchUnreadCounts();
        } else {
            navigate("/signin");
        }

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [navigate, token, userId]);

    const isUserOnline = (userIdToCheck) => {
        return onlineUsers.includes(userIdToCheck.toString());
    };
    const startListening = () => {
        if (!recognitionRef.current) return;
      
        if (isRecording) {
          console.warn("Reconnaissance déjà en cours...");
          return;
        }
      
        try {
          setIsRecording(true);
          recognitionRef.current.start();
          console.log("🎙️ Démarrage de la reconnaissance vocale...");
        } catch (err) {
          console.warn("Erreur lors du démarrage :", err.message);
          setIsRecording(false);
        }
      };
      
      
      
      
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

    // ✅ Fetch messages when a user is selected
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    // ✅ Start chat
    const startChat = (user) => {
        setSelectedUser(user);
        setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));
    };

    // ✅ Fetch messages between the logged-in user and the selected user
    const fetchMessages = async (receiverId) => {
        if (!userId || !receiverId) {
            console.error("Missing senderId or receiverId");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/messages/conversation/${userId}/${receiverId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                console.error("Failed to fetch messages:", response.statusText);
                return;
            }

            const data = await response.json();
            setMessages(data.messages);
            fetchUnreadCounts();

            data.messages.forEach(async (msg) => {
                if (!msg.read) {
                    await markMessageAsRead(msg._id);
                }
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!messageId || !userId) return;

        const confirm = window.confirm("Are you sure  you want delete this message ?");
        if (!confirm) return;

        try {
            const response = await fetch(`http://localhost:3000/messages/delete-message/${messageId}/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
            } else {
                const data = await response.json();
                alert(data.message || "Erreur lors de la suppression.");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du message :", error);
        }
    };

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
                setMessages((prevMessages) => [...prevMessages, data.savedMessage]);
                fetchMessages(receiverId);
                fetchUnreadCounts();
                setMessageText("");
                setIsTyping(false);
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
  <span className={`status-dot ${isUserOnline(user._id) ? 'online' : 'offline'}`}></span>
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
                        {isTyping && typingUser && (
  <div className="typing-indicator">
    {typingUser} est en train d’écrire...
  </div>
)}


                        <div className="message-input">
                            <textarea
                                value={messageText}
                                onChange={(e) => {
                                    setMessageText(e.target.value);
                                    if (!selectedUser) return;
                                  
                                    socket.current.emit("typing", {
                                      toUserId: selectedUser._id,
                                      fromUser: { id: userId, name: storedUser?.name },
                                    });
                                  
                                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = setTimeout(() => {
                                      socket.current.emit("stopTyping", { toUserId: selectedUser._id });
                                    }, 2000);
                                  }}
                                  
                                                                  
                                placeholder="Write a message..."
                            />
{/* <button onClick={startListening} className="mic-button">
  {isRecording ? "🎤 Enregistrement..." : "🎙️"}
</button> */}
<button
  onClick={startListening}
  className={`mic-button ${isRecording ? "recording" : ""}`}
  title={isRecording ? "Enregistrement en cours..." : "Démarrer la dictée vocale"}
>
  {isRecording ? "🎤" : "🎙️"}
</button>



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
