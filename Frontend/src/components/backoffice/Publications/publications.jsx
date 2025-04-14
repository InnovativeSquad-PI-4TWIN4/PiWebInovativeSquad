import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import "./publications.scss";

const Publications = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/publication/stats", {

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques des publications :", error);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ["#6366F1", "#10B981"];

  return (
    <div className="publications-stats">
      <h2>Statistiques des Publications</h2>
      <div className="charts">
        <div className="chart">
          <h3>Offres vs Demandes (Bar Chart)</h3>
          <BarChart width={400} height={300} data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366F1" />
          </BarChart>
        </div>

        <div className="chart">
          <h3>Répartition des Types (Pie Chart)</h3>
          <PieChart width={300} height={300}>
          <Pie
  data={stats}
  cx="50%"
  cy="50%"
  outerRadius={80}
  fill="#8884d8"
  dataKey="count"
  nameKey="type"    // ✅ C'est ça qui manquait
  label
>

              {stats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default Publications;
