import React from "react";

const StatsCard = ({ title, count, icon, bg }) => {
  return (
    <div
      className="stats-card shadow-sm h-100"
      style={{
        background: bg,
      }}
    >
      <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
        <div className="stats-icon">{icon}</div>
        <h5 className="mt-3 fw-bold">{title}</h5>
        <h2 className="fw-bolder">{count}</h2>
      </div>

      {/* Internal Component Styles */}
      <style jsx="true">{`
        .stats-card {
          border-radius: 18px;
          color: white;
          padding: 20px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(6px);
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Glow effect behind card */
        .stats-card::before {
          content: "";
          position: absolute;
          top: -40%;
          left: -40%;
          width: 180%;
          height: 180%;
          background: radial-gradient(circle, rgba(255,255,255,0.25), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        /* On hover → lift + glow + scale */
        .stats-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
        }

        .stats-card:hover::before {
          opacity: 1;
        }

        /* Icon animation */
        .stats-icon {
          font-size: 2.8rem;
          transition: transform 0.3s ease;
        }

        .stats-card:hover .stats-icon {
          transform: scale(1.2) rotate(5deg);
        }
      `}</style>
    </div>
  );
};

export default StatsCard;
