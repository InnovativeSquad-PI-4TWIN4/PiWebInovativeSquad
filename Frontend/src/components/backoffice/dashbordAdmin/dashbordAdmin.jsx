import React, { useState } from "react";
import { FaUsers, FaCog, FaChartBar, FaDollarSign } from "react-icons/fa";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdOutlineTaskAlt } from "react-icons/md";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ManageUsers from "../ManageUsers/ManageUsers";
import "./dashbordAdmin.scss";

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
                <h3>BUDGET</h3>
                <p>$24k</p>
                <span className="positive">↑ 12% Since last month</span>
                <FaDollarSign className="icon red" />
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
              <div className="card">
                <h3>TOTAL PROFIT</h3>
                <p>$15k</p>
                <AiOutlineShoppingCart className="icon purple" />
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-container">
              <div className="chart sales-chart">
                <h2>Sales</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={salesData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart traffic-chart">
                <h2>Traffic Source</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={trafficData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "manageUsers" && <ManageUsers />}
        {activeTab === "settings" && <div>Settings Content</div>}
      </div>
    </div>
  );
};

export default DashbordAdmin;
