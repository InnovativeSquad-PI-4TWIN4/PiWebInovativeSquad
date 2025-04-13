// src/components/publication/Publication.jsx
"use client"
import GoogleTranslate from "./GoogleTranslate"
import { useState, useEffect } from "react"
import axios from "axios"
import "./Publication.scss"
import { FaPaperPlane } from "react-icons/fa"
import ChatComponent from "../chatcomponent/chatcomponent"
import { useLocation, useNavigate } from "react-router-dom"

const Publication = () => {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toastMessage, setToastMessage] = useState("")
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(""), 3000) // disparaît après 3 sec
  }
  
  const [newPublication, setNewPublication] = useState({
    type: "offer",
    description: "",
  })
  const [currentUser, setCurrentUser] = useState(null)
  const [viewMode, setViewMode] = useState("all") // "all" | "my"

  const [newComments, setNewComments] = useState({})
  const [newReplies, setNewReplies] = useState({})
  const [replyingTo, setReplyingTo] = useState({})
  const [activeReplyComment, setActiveReplyComment] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedPublication, setSelectedPublication] = useState(null)
  const [selectedSender, setSelectedSender] = useState(null)
  const [hasConversation, setHasConversation] = useState(false)

  const API_URL = "http://localhost:3000/publication"
  const USER_API_URL = "http://localhost:3000/users/profile"
  const BASE_URL = "http://localhost:3000"
  const CHAT_API_URL = "http://localhost:3000/chat"

  const location = useLocation()
  const navigate = useNavigate()

  const commentSuggestions = ["Parfait", `Excellent travail ${currentUser?.name || ""}`, "Super !", "Bien joué"]

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Utilisateur non connecté")
          setLoading(false)
          return
        }

        const response = await axios.get(USER_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.status === "SUCCESS") {
          setCurrentUser(response.data.user)
        } else {
          setError("Erreur lors de la récupération des informations utilisateur")
        }
      } catch (err) {
        setError("Erreur lors de la récupération des informations utilisateur")
      }
    }

    fetchCurrentUser()
  }, [])

  
  
  
  
  // Récupérer les publications
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await axios.get(`${API_URL}/getAllPub`)
        setPublications(response.data)
        setLoading(false)
      } catch (err) {
        setError("Erreur lors du chargement des publications")
        setLoading(false)
      }
    }

    fetchPublications()
  }, [])

  // Vérifier les paramètres d'URL pour ouvrir le chat
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const publicationId = params.get("id")
    const openChat = params.get("chat") === "true"
    const senderId = params.get("sender")

    console.log("URL params:", { publicationId, openChat, senderId })

    if (publicationId && publications.length > 0 && currentUser) {
      const publication = publications.find((pub) => pub._id === publicationId)
      if (publication) {
        setSelectedPublication(publication)

        // Si chat=true dans l'URL, ouvrir le chat automatiquement
        if (openChat && senderId) {
          // Utiliser directement les informations de l'utilisateur si c'est l'auteur de la publication
          if (publication.user && publication.user._id === senderId) {
            setSelectedSender(publication.user)
            setChatOpen(true)
          } else {
            // Sinon, chercher l'utilisateur dans les publications existantes
            findUserInPublications(senderId).then((user) => {
              if (user) {
                setSelectedSender(user)
                setChatOpen(true)
              } else {
                console.error("Impossible de trouver l'utilisateur dans les publications existantes")
              }
            })
          }
        }
      }
    }

    // Vérifier si nous avons un contexte de chat stocké dans localStorage
    const chatContext = localStorage.getItem("currentChatContext")
    if (chatContext) {
      try {
        const { publicationId: contextPublicationId, senderId: contextSenderId } = JSON.parse(chatContext)

        if (publications.length > 0) {
          const publication = publications.find((pub) => pub._id === contextPublicationId)
          if (publication) {
            setSelectedPublication(publication)

            if (contextSenderId) {
              // Utiliser directement les informations de l'utilisateur si c'est l'auteur de la publication
              if (publication.user && publication.user._id === contextSenderId) {
                setSelectedSender(publication.user)
                setChatOpen(true)
              } else {
                // Sinon, chercher l'utilisateur dans les publications existantes
                findUserInPublications(contextSenderId).then((user) => {
                  if (user) {
                    setSelectedSender(user)
                    setChatOpen(true)
                  } else {
                    console.error("Impossible de trouver l'utilisateur dans les publications existantes")
                  }
                })
              }
            }
          }
        }

        // Effacer le contexte après l'avoir utilisé
        localStorage.removeItem("currentChatContext")
      } catch (error) {
        console.error("Erreur lors du parsing du contexte de chat:", error)
      }
    }
  }, [location.search, publications, currentUser])

  // Nouvelle fonction pour trouver un utilisateur dans les publications existantes
  const findUserInPublications = async (userId) => {
    if (!userId) {
      console.error("findUserInPublications: userId est undefined ou null")
      return null
    }

    console.log("Recherche de l'utilisateur dans les publications:", userId)

    // Chercher d'abord dans les auteurs des publications
    for (const pub of publications) {
      if (pub.user && pub.user._id === userId) {
        console.log("Utilisateur trouvé comme auteur de publication:", pub.user)
        return pub.user
      }

      // Chercher dans les commentaires
      if (pub.comments) {
        for (const comment of pub.comments) {
          if (comment.user && comment.user._id === userId) {
            console.log("Utilisateur trouvé comme auteur de commentaire:", comment.user)
            return comment.user
          }

          // Chercher dans les réponses aux commentaires
          if (comment.replies) {
            for (const reply of comment.replies) {
              if (reply.user && reply.user._id === userId) {
                console.log("Utilisateur trouvé comme auteur de réponse:", reply.user)
                return reply.user
              }
            }
          }
        }
      }
    }

    // Si l'utilisateur n'est pas trouvé dans les publications, essayer de récupérer les informations via l'API de chat
    try {
      console.log("Tentative de récupération des informations utilisateur via l'API de chat")
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${CHAT_API_URL}/getUserInfo`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data && response.data.user) {
        console.log("Informations utilisateur récupérées via l'API de chat:", response.data.user)
        return response.data.user
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des informations utilisateur via l'API de chat:", error)
    }

    // Si tout échoue, créer un objet utilisateur minimal avec l'ID
    console.log("Création d'un objet utilisateur minimal")
    return {
      _id: userId,
      name: "Utilisateur",
      surname: userId.substring(0, 5),
      image: null,
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewPublication((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newPublication.description.trim()) {
      showToast("Veuillez entrer une description.")

      return
    }

    if (!currentUser) {
      alert("Utilisateur non connecté")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_URL}/createPub`,
        {
          user: currentUser._id,
          type: newPublication.type,
          description: newPublication.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setPublications((prev) => [response.data.publication, ...prev])
      setNewPublication({ type: "offer", description: "" })
    } catch (err) {
      alert("Erreur lors de la création de la publication.")
    }
  }

  const handleLike = async (publicationId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_URL}/like/${publicationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setPublications((prev) => prev.map((pub) => (pub._id === publicationId ? response.data.publication : pub)))
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'ajout du J'aime.")
    }
  }

  const handleCommentChange = (publicationId, value) => {
    setNewComments((prev) => ({
      ...prev,
      [publicationId]: value,
    }))
  }

  const handleReplyChange = (commentId, value) => {
    setNewReplies((prev) => ({
      ...prev,
      [commentId]: value,
    }))
  }

  const handleAddComment = async (publicationId) => {
    const content = newComments[publicationId]
    if (!content || content.trim().length === 0) {
      alert("Veuillez entrer un commentaire.")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_URL}/comment/${publicationId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setPublications((prev) => prev.map((pub) => (pub._id === publicationId ? response.data.publication : pub)))
      setNewComments((prev) => ({
        ...prev,
        [publicationId]: "",
      }))
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'ajout du commentaire.")
    }
  }

  const handleAddReply = async (publicationId, commentId) => {
    const content = newReplies[commentId]
    if (!content || content.trim().length === 0) {
      alert("Veuillez entrer une réponse.")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_URL}/reply/${publicationId}/${commentId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setPublications((prev) => prev.map((pub) => (pub._id === publicationId ? response.data.publication : pub)))
      setNewReplies((prev) => ({
        ...prev,
        [commentId]: "",
      }))
      setReplyingTo((prev) => ({
        ...prev,
        [publicationId]: null,
      }))
      setActiveReplyComment(null)
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'ajout de la réponse.")
    }
  }

  const handleSuggestionClick = (publicationId, suggestion) => {
    setNewComments((prev) => ({
      ...prev,
      [publicationId]: suggestion,
    }))
  }

  const handleReplySuggestionClick = (commentId, suggestion) => {
    setNewReplies((prev) => ({
      ...prev,
      [commentId]: suggestion,
    }))
  }

  const handleReplyClick = (publicationId, comment) => {
    const userName = comment.user ? `${comment.user.name} ${comment.user.surname}` : "Utilisateur inconnu"
    setReplyingTo((prev) => ({
      ...prev,
      [publicationId]: userName,
    }))
    setNewReplies((prev) => ({
      ...prev,
      [comment._id]: "",
    }))
    setActiveReplyComment(comment._id)
  }

  const handleNegotiate = async (publication) => {
    if (!currentUser) {
      alert("Utilisateur non connecté")
      return
    }

    try {
      // Utiliser directement les informations de l'utilisateur de la publication
      if (publication.user) {
        setSelectedSender(publication.user)
        setSelectedPublication(publication)
        setChatOpen(true)
      } else {
        alert("Impossible de récupérer les informations de l'auteur de la publication")
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture du chat:", error)
      alert("Une erreur s'est produite lors de l'ouverture du chat")
    }
  }

  const handleCloseChat = () => {
    setChatOpen(false)
    // Mettre à jour l'URL pour supprimer les paramètres de chat
    if (selectedPublication) {
      navigate(`/publication?id=${selectedPublication._id}`)
    }
  }

  const getImageUrl = (image) => {
    if (!image) {
      return "https://via.placeholder.com/40"
    }
    return image.startsWith("http") ? image : `${BASE_URL}${image}`
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000)
    if (diffInSeconds < 60) return `${diffInSeconds}s`
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  if (loading) return <div>Chargement des publications...</div>
  if (error) return <div>{error}</div>
  const displayedPublications =
  viewMode === "my"
    ? publications.filter((pub) => pub.user?._id === currentUser?._id)
    : publications

  return (
    
    <div className="publications-container">
      <div className="create-publication">
        <form onSubmit={handleSubmit}>
          <div className="create-publication-header">
            <img
              src={getImageUrl(currentUser?.image) || "/placeholder.svg"}
              alt={`${currentUser?.name || "Utilisateur"} ${currentUser?.surname || ""}`}
              className="user-avatar"
              onError={(e) => {
                console.error("Erreur de chargement de l'image pour l'utilisateur connecté")
                e.target.src = "https://via.placeholder.com/40"
              }}
            />
          <div className="publication-type-switch">
  {/* Ton switch Offre / Demande existant */}
  <div
    className={`switch-option ${newPublication.type === "offer" ? "active" : ""}`}
    onClick={() => setNewPublication((prev) => ({ ...prev, type: "offer" }))}
  >
    Offre
  </div>
  <div
    className={`switch-option ${newPublication.type === "request" ? "active" : ""}`}
    onClick={() => setNewPublication((prev) => ({ ...prev, type: "request" }))}
  >
    Demande
  </div>
  <div className={`switch-indicator ${newPublication.type}`}></div>
</div>

{/* AJOUT : Switcher Tous / Mes publications */}
<div className="switch-view-mode">
  <button
    className={viewMode === "all" ? "active" : ""}
    onClick={() => setViewMode("all")}
  >
    Tous
  </button>
  <button
    className={viewMode === "my" ? "active" : ""}
    onClick={() => setViewMode("my")}
  >
    Mes publications
  </button>
</div>

          </div>
          <textarea
            name="description"
            value={newPublication.description}
            onChange={handleInputChange}
            placeholder="What's on your mind?"
            className="publication-textarea"
          />
          <div className="create-publication-actions">
            <button type="submit" className="submit-btn">
              Post
            </button>
          </div>
        </form>
      </div>

      {displayedPublications.map((pub) => (
        <div key={pub._id} className="publication-card">
          <div className="publication-header">
            <img
              src={getImageUrl(pub.user?.image) || "/placeholder.svg"}
              alt={`${pub.user?.name || "Utilisateur"} ${pub.user?.surname || ""}`}
              className="user-avatar"
              onError={(e) => {
                console.error("Erreur de chargement de l'image pour", pub.user?.name)
                e.target.src = "https://via.placeholder.com/40"
              }}
            />
            <div className="user-info">
              <span className="user-name">
                {pub.user ? `${pub.user.name} ${pub.user.surname}` : "Utilisateur inconnu"}
              </span>
              <span className="publication-date">
                {new Date(pub.createdAt).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="publication-content">
            <span className={`publication-type ${pub.type}`}>{pub.type === "offer" ? "Offre" : "Demande"}</span>
            <p className="publication-description">{pub.description}</p>
          </div>
          <div className="publication-actions">
            <button
              className={`action-btn like-btn ${pub.likes.includes(currentUser?._id) ? "liked" : ""}`}
              onClick={() => handleLike(pub._id)}
            >
              <span className="icon">{pub.likes.includes(currentUser?._id) ? "👎" : "👍"}</span>
              {pub.likes.includes(currentUser?._id) ? "Dislike" : "Like"} ({pub.likes.length})
            </button>
            <button className="action-btn comment-btn">
              <span className="icon">💬</span> Comment
            </button>
            {/* Afficher le bouton Negotiate uniquement si l'utilisateur connecté n'est pas l'auteur de la publication */}
            {currentUser && pub.user && currentUser._id !== pub.user._id && (
              <button className="action-btn negotiate-btn" onClick={() => handleNegotiate(pub)}>
                <span className="icon">🤝</span> Negotiate
              </button>
            )}
          </div>

          <div className="comments-section">
            {pub.comments && pub.comments.length > 0 && (
              <div className="comments-header">
                <span className="comments-sort">Les plus pertinents ▼</span>
              </div>
            )}
            <div className="comments-list">
              {pub.comments && pub.comments.length > 0 ? (
                pub.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <div className="comment-body">
                      <img
                        src={getImageUrl(comment.user?.image) || "/placeholder.svg"}
                        alt={`${comment.user?.name || "Utilisateur"} ${comment.user?.surname || ""}`}
                        className="comment-avatar"
                        onError={(e) => {
                          console.error("Erreur de chargement de l'image pour", comment.user?.name)
                          e.target.src = "https://via.placeholder.com/40"
                        }}
                      />
                      <div className="comment-content-wrapper">
                        <div className="comment-content">
                          <span className="comment-user-name">
                            {comment.user ? `${comment.user.name} ${comment.user.surname}` : "Utilisateur inconnu"}
                          </span>
                          <p>{comment.content}</p>
                        </div>
                        <div className="comment-meta">
                          <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                          <button className="reply-btn" onClick={() => handleReplyClick(pub._id, comment)}>
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {comment.replies && comment.replies.length > 0 && (
                      <div className="replies-list">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="reply">
                            <img
                              src={getImageUrl(reply.user?.image) || "/placeholder.svg"}
                              alt={`${reply.user?.name || "Utilisateur"} ${reply.user?.surname || ""}`}
                              className="reply-avatar"
                              onError={(e) => {
                                console.error("Erreur de chargement de l'image pour", reply.user?.name)
                                e.target.src = "https://via.placeholder.com/40"
                              }}
                            />
                            <div className="reply-content-wrapper">
                              <div className="reply-content">
                                <span className="reply-user-name">
                                  {reply.user ? `${reply.user.name} ${reply.user.surname}` : "Utilisateur inconnu"}
                                </span>
                                <p>{reply.content}</p>
                              </div>
                              <div className="reply-meta">
                                <span className="reply-time">{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeReplyComment === comment._id && (
                      <div className="add-reply">
                        <img
                          src={getImageUrl(currentUser?.image) || "/placeholder.svg"}
                          alt={`${currentUser?.name || "Utilisateur"} ${currentUser?.surname || ""}`}
                          className="comment-avatar"
                          onError={(e) => {
                            console.error("Erreur de chargement de l'image pour l'utilisateur connecté")
                            e.target.src = "https://via.placeholder.com/40"
                          }}
                        />
                        <div className="comment-input-wrapper">
                          <div className="comment-suggestions">
                            {commentSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                className="suggestion-btn"
                                onClick={() => handleReplySuggestionClick(comment._id, suggestion)}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                          <div className="comment-input-container">
                            <textarea
                              value={newReplies[comment._id] || ""}
                              onChange={(e) => handleReplyChange(comment._id, e.target.value)}
                              placeholder="Reply"
                              className="reply-textarea"
                            />
                            <button
                              onClick={() => handleAddReply(pub._id, comment._id)}
                              className={`submit-reply-icon ${newReplies[comment._id]?.trim() ? "active" : ""}`}
                            >
                              <FaPaperPlane />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-comments">Aucun commentaire pour le moment.</p>
              )}
            </div>

            <div className="add-comment">
              <img
                src={getImageUrl(currentUser?.image) || "/placeholder.svg"}
                alt={`${currentUser?.name || "Utilisateur"} ${currentUser?.surname || ""}`}
                className="comment-avatar"
                onError={(e) => {
                  console.error("Erreur de chargement de l'image pour l'utilisateur connecté")
                  e.target.src = "https://via.placeholder.com/40"
                }}
              />
              <div className="comment-input-wrapper">
                <div className="comment-suggestions">
                  {commentSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="suggestion-btn"
                      onClick={() => handleSuggestionClick(pub._id, suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <div className="comment-input-container">
                  <textarea
                    value={newComments[pub._id] || ""}
                    onChange={(e) => handleCommentChange(pub._id, e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="comment-textarea"
                  />
                  <button
                    onClick={() => handleAddComment(pub._id)}
                    className={`submit-comment-icon ${newComments[pub._id]?.trim() ? "active" : ""}`}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {chatOpen && selectedPublication && selectedSender && (
        <ChatComponent
          publication={selectedPublication}
          currentUser={currentUser}
          selectedSender={selectedSender}
          onClose={handleCloseChat}
        />
      )}
      
      {toastMessage && (
  <div className="custom-toast">
    {toastMessage}
  </div>
)}
<GoogleTranslate />

</div>
  )
}

export default Publication