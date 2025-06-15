import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#a1cfff"];

export default function ChartPanel() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const snapshot = await getDocs(collection(db, "reports"));
      const data = snapshot.docs.map((doc) => doc.data());
      setReports(data);
    };

    fetchReports();
  }, []);

  // Group data by type
  const crimeTypeCounts = reports.reduce((acc, report) => {
    acc[report.type] = (acc[report.type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(crimeTypeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  // Group data by date
  const dateCounts = reports.reduce((acc, report) => {
    acc[report.date] = (acc[report.date] || 0) + 1;
    return acc;
  }, {});

  const dateData = Object.entries(dateCounts).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
        Crime Statistics
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Pie Chart: Crime by Type */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-center mb-2">
            Crime Distribution by Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {typeData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Crimes Over Dates */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-center mb-2">
            Crimes Reported Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dateData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Reports" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
