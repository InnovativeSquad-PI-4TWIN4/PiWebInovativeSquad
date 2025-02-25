import React, { useState } from "react";
import { FaUsers, FaCog, FaChartBar } from "react-icons/fa";
import ManageUsers from "../ManageUsers/ManageUsers";
import "./dashbordAdmin.scss";

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
                        <div className="top-cards">
                            <div className="card">
                                <h3>Profit & Expenses</h3>
                                <p>$36,358</p>
                            </div>
                            <div className="card">
                                <h3>Top Clients</h3>
                                <p>243</p>
                            </div>
                            <div className="card">
                                <h3>Product Sales</h3>
                                <p>$6,820</p>
                            </div>
                        </div>

                        <div className="charts">
                            <div className="chart">Profit Over Time</div>
                            <div className="chart">Sales Distribution</div>
                        </div>

                        <div className="clients">
                            <h2>Top Paying Clients</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Service</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Sunil Joshi</td>
                                        <td>Elite Admin</td>
                                        <td>$3.9k</td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Andrew McDonald</td>
                                        <td>Real Homes WP</td>
                                        <td>$24.5k</td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>Christopher Jamil</td>
                                        <td>MedicalPro WP</td>
                                        <td>$12.8k</td>
                                    </tr>
                                </tbody>
                            </table>
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
