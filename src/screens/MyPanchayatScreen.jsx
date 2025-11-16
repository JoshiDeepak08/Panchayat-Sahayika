

import React from "react";
import { useNavigate } from "react-router-dom";

export default function MyPanchayatScreen() {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
        <h2 className="text-sm font-semibold text-[#166534]">
          Meri Panchayat – Tools
        </h2>
        <p className="text-[11px] text-gray-500">
          Yahan se aap training details dekh sakte ho ya Smart Gram Planning AI
          tool open kar sakte ho.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Card 1: Trainings Finder */}
        <button
          onClick={() => navigate("/my-panchayat/trainings")}
          className="bg-white rounded-2xl shadow-md p-4 text-left hover:bg-green-50 transition"
        >
          <div className="text-2xl mb-2">🎓</div>
          <h3 className="text-sm font-semibold text-gray-800">
            Panchayat Trainings Finder
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            District & Block ke hisaab se saari panchayat trainings dekho.
          </p>
        </button>

        {/* Card 2: Gram Planning Tool */}
        <button
          onClick={() => navigate("/my-panchayat/planning")}
          className="bg-white rounded-2xl shadow-md p-4 text-left hover:bg-blue-50 transition"
        >
          <div className="text-2xl mb-2">🧠</div>
          <h3 className="text-sm font-semibold text-gray-800">
            Smart Gram Planning Tool
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            Village infra deficit index ke basis par planning priorities dekho.
          </p>
        </button>
      </div>
    </section>
  );
}
