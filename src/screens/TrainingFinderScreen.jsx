// src/screens/TrainingFinderScreen.jsx
import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:7000"; // trainings FastAPI URL

export default function TrainingFinderScreen() {
  const [districts, setDistricts] = useState([]);
  const [blocksByDistrict, setBlocksByDistrict] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");

  const [trainings, setTrainings] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingTrainings, setLoadingTrainings] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoadingFilters(true);
      setError("");
        const res = await fetch(`${API_BASE}/filters`);
        const data = await res.json();

        console.log("Filters response:", data);

        const dists = data.districts || [];
        setDistricts(dists);
        setBlocksByDistrict(data.blocksByDistrict || {});

        if (dists.length > 0) {
          setSelectedDistrict(dists[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Filters load nahi ho paaye. Backend check karo.");
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilters();
  }, []);

  const currentBlocks = useMemo(() => {
    if (!selectedDistrict) return [];
    return blocksByDistrict[selectedDistrict] || [];
  }, [selectedDistrict, blocksByDistrict]);

  useEffect(() => {
    setSelectedBlock("");
  }, [selectedDistrict]);

  const handleSearch = async () => {
    try {
      setLoadingTrainings(true);
      setError("");

      const params = new URLSearchParams();
      if (selectedDistrict) params.append("district", selectedDistrict);
      if (selectedBlock) params.append("block", selectedBlock);

      const res = await fetch(`${API_BASE}/trainings?${params.toString()}`);
      const data = await res.json();
      setTrainings(data.items || []);
    } catch (err) {
      console.error(err);
      setError("Trainings load nahi ho paaye. Backend check karo.");
    } finally {
      setLoadingTrainings(false);
    }
  };

  return (
    <section className="space-y-4">
      {/* Selection area */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[#166534]">
          Uttarakhand Panchayat Trainings Finder
        </h2>
        <p className="text-[10px] text-gray-500">
          Pehle District aur Block select karo, phir trainings dekh sakte ho.
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* State – fixed Uttarakhand */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
            <span className="text-sm">📍</span>
            <span className="text-[11px] font-medium text-gray-700">
              State: Uttarakhand
            </span>
          </div>

          {/* District select */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
            <span className="text-sm">🏙️</span>
            <select
              className="bg-transparent text-[11px] outline-none cursor-pointer"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">
                {loadingFilters ? "Loading..." : "Select District"}
              </option>
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Block select */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
            <span className="text-sm">📌</span>
            <select
              className="bg-transparent text-[11px] outline-none cursor-pointer"
              value={selectedBlock}
              disabled={!selectedDistrict}
              onChange={(e) => setSelectedBlock(e.target.value)}
            >
              <option value="">
                {!selectedDistrict
                  ? "Select district first"
                  : currentBlocks.length === 0
                  ? "No blocks found"
                  : "Select Block"}
              </option>
              {currentBlocks.map((blk) => (
                <option key={blk} value={blk}>
                  {blk}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loadingTrainings || !selectedDistrict}
          className="mt-2 inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[#166534] text-white hover:bg-green-800 disabled:opacity-60"
        >
          {loadingTrainings ? "Loading trainings..." : "Show Trainings"}
        </button>

        {error && (
          <p className="text-[10px] text-red-500 mt-1">
            {error}
          </p>
        )}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {trainings.length === 0 && !loadingTrainings && (
          <div className="bg-white rounded-2xl shadow-sm p-3 text-[11px] text-gray-500">
            Abhi koi training list nahi hai. District/Block select karke{" "}
            <span className="font-semibold text-[#166534]">Show Trainings</span>{" "}
            dabao.
          </div>
        )}

        {trainings.map((t, idx) => (
          <div
            key={`${t.training_name}-${idx}`}
            className="bg-white rounded-2xl shadow-md p-3 space-y-1 text-[11px]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-gray-800">
                  {t.training_name || "Training"}
                </div>
                <div className="text-[10px] text-gray-500">
                  {t.org_institute}
                </div>
              </div>
              <div className="text-[9px] text-right text-gray-500">
                <div>{t.district}</div>
                <div>{t.block}</div>
              </div>
            </div>

            <div className="text-[10px] text-gray-600 mt-1">
              🗓️ {t.start_date} – {t.end_date}
            </div>

            {t.training_category && (
              <div className="text-[9px] text-gray-500">
                Category: {t.training_category}
                {t.training_sub_category
                  ? ` • ${t.training_sub_category}`
                  : ""}
              </div>
            )}

            {t.targeted_participants && (
              <div className="text-[9px] text-gray-500">
                👥 Target: {t.targeted_participants}
              </div>
            )}

            {t.agenda && (
              <p className="text-[9px] text-gray-600 line-clamp-2 mt-1">
                {t.agenda}
              </p>
            )}

            <p className="text-[8px] text-gray-400 mt-1">
              Source file: {t.source}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
