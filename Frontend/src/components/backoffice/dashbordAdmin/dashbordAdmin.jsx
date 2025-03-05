import React, { useState, useEffect } from "react";
import { FaUsers, FaCog, FaChartBar } from "react-icons/fa";
import { MdOutlineTaskAlt } from "react-icons/md";
import "./dashbordAdmin.scss";
import ManageUsers from "../ManageUsers/ManageUsers";
import ManageAdmins from "../ManageAdmins/ManageAdmin"; // ✅ Ajout de ManageAdmins

const salesData = [
  { month: "Jan", sales: 18000 },
  { month: "Feb", sales: 15000 },
  { month: "Mar", sales: 8000 },
  { month: "Apr", sales: 5000 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 12000 },
  { month: "Jul", sales: 14000 },
  { month: "Aug", sales: 16000 },
  { month: "Sep", sales: 17000 },
  { month: "Oct", sales: 18000 },
  { month: "Nov", sales: 19000 },
  { month: "Dec", sales: 20000 },
];

const trafficData = [
  { name: "Desktop", value: 63, color: "#6366F1" },
  { name: "Tablet", value: 15, color: "#F59E0B" },
  { name: "Phone", value: 22, color: "#10B981" },
];
const DashbordAdmin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingUsers, setPendingUsers] = useState([]); // ✅ Assurez-vous qu'il commence comme un tableau
  const [clientStats, setClientStats] = useState({ totalClients: 0, approvedClients: 0 });

  useEffect(() => {
    const fetchClientStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        setClientStats(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques des clients :", error);
      }
    };

    const fetchPendingUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/pending", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        setPendingUsers(Array.isArray(data) ? data : []); // ✅ Vérification que c'est un tableau
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs en attente :", error);
        setPendingUsers([]); // ✅ Sécurisation pour éviter une erreur de mapping
      }
    };

    fetchPendingUsers();
    fetchClientStats();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await fetch(`http://localhost:3000/users/approve/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Erreur lors de l'approbation de l'utilisateur :", error);
    }
  };

  const handleReject = async (userId) => {
    try {
      await fetch(`http://localhost:3000/users/reject/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Erreur lors du rejet de l'utilisateur :", error);
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <ul>
          <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            <FaChartBar /> Dashboard
          </li>
          <li className={activeTab === "manageUsers" ? "active" : ""} onClick={() => setActiveTab("manageUsers")}>
            <FaUsers /> Manage Users
          </li>
          <li className={activeTab === "manageAdmins" ? "active" : ""} onClick={() => setActiveTab("manageAdmins")}>
            <FaUsers /> Manage Admins
          </li>
          <li className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
            <FaCog /> Settings
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === "dashboard" && (
          <div className="dashboard-content">
            {/* Top Cards */}
            <div className="top-cards">
              <div className="card">
                <h3>TOTAL CUSTOMERS</h3>
                <p>{clientStats.totalClients}</p>
                <span className="positive">↑ 16% Since last month</span>
                <FaUsers className="icon green" />
              </div>
              <div className="card">
                <h3>APPROVED CUSTOMERS</h3>
                <p>{clientStats.approvedClients}</p>
                <span className="positive">↑ 5% Since last month</span>
                <FaUsers className="icon blue" />
              </div>

              <div className="card">
                <h3>TOTAL CUSTOMERS</h3>
                <p>1.6k</p>
                <span className="negative">↓ 16% Since last month</span>
                <FaUsers className="icon green" />
              </div>
              <div className="card">
                <h3>TASK PROGRESS</h3>
                <p>75.5%</p>
                <MdOutlineTaskAlt className="icon orange" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "manageUsers" && <ManageUsers />}
        {activeTab === "manageAdmins" && <ManageAdmins />} {/* ✅ Ajout de ManageAdmins */}
        {activeTab === "settings" && <div>Settings Content</div>}
      </div>
    </div>
  );
};

export default DashbordAdmin;
