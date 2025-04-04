import React, { useEffect, useState } from "react";
import axios from "axios";
import NotificationPopup from "../Marketplace/NotificationPopup";
import notificationSound from "../../../assets/notification.mp3";
import { useNavigate } from "react-router-dom";

const GlobalNotification = () => {
  const [popupMessage, setPopupMessage] = useState("");
  const [highlightedCourseId, setHighlightedCourseId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const justConnected = sessionStorage.getItem("justConnected");

    if (user && justConnected === "true") {
      axios.get(`http://localhost:3000/notifications/${user._id}`).then((res) => {
        if (res.data.length > 0) {
          const lastNotif = res.data[0];
          const match = lastNotif.message.match(/cours intitulé ['"](.*?)['"]/i);

          if (match) {
            const title = match[1].toLowerCase();

            axios.get("http://localhost:3000/courses/getallcourses").then((res) => {
              const course = res.data.find((c) =>
                c.title.toLowerCase().includes(title)
              );
              if (course) {
                localStorage.setItem("highlightedCourse", course._id);
                setHighlightedCourseId(course._id);
              }
            });
          }

          setPopupMessage("🆕 Nouveau cours disponible ! Cliquez ici");
          setShowPopup(true);
          new Audio(notificationSound).play();
        }
      });

      // 🔁 On évite que ça se répète
      sessionStorage.setItem("justConnected", "false");
    }
  }, []);

  const handleClick = () => {
    setShowPopup(false);
    navigate("/marketplace/premium");
  };

  return (
    <>
      {showPopup && (
        <NotificationPopup
          message={popupMessage}
          onClick={handleClick}
        />
      )}
    </>
  );
};

export default GlobalNotification;
