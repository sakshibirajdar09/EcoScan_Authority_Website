import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import StatsCard from "./StatsCard";

const DashboardCards = ({ setError }) => {
  const [stats, setStats] = useState({
    users: 0,
    collectors: 0,
    attendance: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const collectorsSnap = await getDocs(collection(db, "collectors"));
        const attendanceSnap = await getDocs(collection(db, "attendance"));
        const feedbackSnap = await getDocs(collection(db, "feedback"));

        let totalRating = 0;
        feedbackSnap.forEach((doc) => {
          totalRating += doc.data().totalRating || 0;
        });

        const avgRating =
          feedbackSnap.size > 0
            ? (totalRating / feedbackSnap.size).toFixed(1)
            : 0;

        setStats({
          users: usersSnap.size,
          collectors: collectorsSnap.size,
          attendance: attendanceSnap.size,
          avgRating,
        });
      } catch (err) {
        console.error("🔥 Firestore fetch error:", err);
        setError("Unable to load dashboard stats.");
      }
    };

    fetchStats();
  }, [setError]);

  return (
    <div className="row g-4">
      <div className="col-md-3">
        <StatsCard
          title="Total Users"
          count={stats.users}
          icon="👥"
          bg="linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)"
        />
      </div>
      <div className="col-md-3">
        <StatsCard
          title="Collectors"
          count={stats.collectors}
          icon="🚛"
          bg="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
        />
      </div>
      <div className="col-md-3">
        <StatsCard
          title="Attendance Entries"
          count={stats.attendance}
          icon="📅"
          bg="linear-gradient(135deg, #f7971e 0%, #ffd200 100%)"
        />
      </div>
      <div className="col-md-3">
        <StatsCard
          title="Avg. Feedback Rating"
          count={stats.avgRating}
          icon="⭐"
          bg="linear-gradient(135deg, #ff0844 0%, #ffb199 100%)"
        />
      </div>
    </div>
  );
};

export default DashboardCards;
