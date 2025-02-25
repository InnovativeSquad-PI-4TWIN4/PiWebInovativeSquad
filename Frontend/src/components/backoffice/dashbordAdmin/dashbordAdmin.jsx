import React from "react";
import { FaChartBar, FaUsers, FaCog, FaDollarSign } from "react-icons/fa";
import "./dashbordAdmin.scss";

const DashbordAdmin = () => {
  return (
    <div className="dashboard-admin">
      {/* Barre latérale */}
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li><FaChartBar /> Dashboard</li>
          <li><FaUsers /> Manage Users</li>
          <li><FaCog /> Settings</li>
        </ul>
      </div>

      {/* Contenu principal */}
      <div className="content">
        {/* Cards */}
        <div className="cards">
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

        {/* Graphiques */}
        <div className="charts">
          <div className="chart">
            <h3>Profit Over Time</h3>
            <img src="https://via.placeholder.com/600x300" alt="Chart" />
          </div>
          <div className="chart">
            <h3>Sales Distribution</h3>
            <img src="https://via.placeholder.com/300x300" alt="Chart" />
          </div>
        </div>

        {/* Tableau */}
        <div className="table">
          <h3>Top Paying Clients</h3>
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
    </div>
  );
};

export default DashbordAdmin;
