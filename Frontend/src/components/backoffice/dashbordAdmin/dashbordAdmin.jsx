import React, { useState, useEffect } from "react";
import { FaUsers, FaCog, FaChartBar } from "react-icons/fa";
import { MdOutlineTaskAlt } from "react-icons/md";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./dashbordAdmin.scss";
import ManageUsers from "../ManageUsers/ManageUsers";
import ManageAdmins from "../ManageAdmins/ManageAdmin";
import Coursesadmin from "../Courses/coursesAdmin";
import PackAdmin from "../Packs/listpack";
import Publications from "../Publications/publications";


const DashbordAdmin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingUsers, setPendingUsers] = useState([]);
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
        setPendingUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs en attente :", error);
        setPendingUsers([]);
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

  const salesData = [
    { month: "Jan", sales: 18000 },
    { month: "Feb", sales: 15000 },
    { month: "Mar", sales: 8000 },
    { month: "Apr", sales: 5000 },
    { month: "May", sales: 6000 },
    { month: "Jun", sales: 12000 },
    { month: "Jul", sales: 14000 },
  ];

  const deviceData = [
    { name: "Desktop", value: 63 },
    { name: "Tablet", value: 15 },
    { name: "Phone", value: 22 },
  ];

  const COLORS = ["#6366F1", "#F59E0B", "#10B981"];

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h1><FaUsers /> Admin Panel</h1>
        <ul>
          <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}><FaChartBar /> Dashboard</li>
          <li className={activeTab === "manageUsers" ? "active" : ""} onClick={() => setActiveTab("manageUsers")}><FaUsers /> Manage Users</li>
          <li className={activeTab === "manageAdmins" ? "active" : ""} onClick={() => setActiveTab("manageAdmins")}><FaUsers /> Manage Admins</li>
          <li className={activeTab === "coursesadmin" ? "active" : ""} onClick={() => setActiveTab("coursesadmin")}><FaChartBar /> Courses</li>
          <li className={activeTab === "PackAdmin" ? "active" : ""} onClick={() => setActiveTab("PackAdmin")}><FaChartBar /> Packs</li>
          <li className={activeTab === "publications" ? "active" : ""} onClick={() => setActiveTab("publications")}><FaChartBar /> Publications</li>
         
        </ul>
      </div>

      <div className="main-content">
        {activeTab === "dashboard" && (
          <div className="dashboard-content">
            <div className="top-cards">
              <div className="card">
                <h3>TOTAL CLIENTS</h3>
                <p>{clientStats.totalClients}</p>
                <span className="positive">+16% depuis le mois dernier</span>
              </div>
              <div className="card">
                <h3>CLIENTS APPROUVÉS</h3>
                <p>{clientStats.approvedClients}</p>
                <span className="positive">+5% depuis le mois dernier</span>
              </div>
              <div className="card">
                <h3>TOTAL CLIENTS</h3>
                <p>1.6k</p>
                <span className="negative">-16% depuis le mois dernier</span>
              </div>
              <div className="card">
                <h3>PROGRESSION</h3>
                <p>75.5%</p>
                <MdOutlineTaskAlt className="icon orange" />
              </div>
            </div>

            <div className="charts-container">
              <div className="chart">
                <h3>Sales Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={3} />
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart">
                <h3>Device Statistics</h3>
                <PieChart width={250} height={300}>
                  <Pie data={deviceData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>

            <div className="pending-requests">
              <h2>Demandes en attente</h2>
              {pendingUsers.length === 0 ? (
                <p className="empty-message">Aucune demande en attente</p>
              ) : (
                <ul className="request-list">
                  {pendingUsers.map((user) => (
                    <li key={user._id}>
                      <div className="user-info">{user.name} {user.surname} - {user.email}</div>
                      <div className="actions">
                        <button className="approve" onClick={() => handleApprove(user._id)}>✅ Approuver</button>
                        <button className="reject" onClick={() => handleReject(user._id)}>❌ Rejeter</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === "manageUsers" && <ManageUsers />}
        {activeTab === "manageAdmins" && <ManageAdmins />} 
        {activeTab === "coursesadmin" && <Coursesadmin />} 
        {activeTab === "PackAdmin" && <PackAdmin />} 
        {activeTab === "publications" && <Publications />} 
        {activeTab === "settings" && <div>Paramètres à venir...</div>}
      </div>
    </div>
  );
};

export default DashbordAdmin;
