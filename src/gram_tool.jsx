
// src/gram_tool.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:5000"; // backend where gram.py is running

export default function GramPlanningTool() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("CHAMPAWAT");
  const [villages, setVillages] = useState([]);
  const [selectedVillageCode, setSelectedVillageCode] = useState("");
  const [villageDetail, setVillageDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load districts on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/districts`)
      .then((res) => res.json())
      .then((data) => setDistricts(data.districts || []))
      .catch(console.error);
  }, []);

  // Load villages whenever district changes
  useEffect(() => {
    if (!selectedDistrict) return;
    fetch(`${API_BASE}/api/villages?district=${encodeURIComponent(selectedDistrict)}`)
      .then((res) => res.json())
      .then((data) => setVillages(data.villages || []))
      .catch(console.error);
  }, [selectedDistrict]);

  function handleVillageClick(code) {
    setSelectedVillageCode(code);
    setLoadingDetail(true);
    fetch(`${API_BASE}/api/village_detail?village_code=${code}`)
      .then((res) => res.json())
      .then((data) => {
        setVillageDetail(data);
        setLoadingDetail(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingDetail(false);
      });
  }

  return (
    <section className="space-y-4">
      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="text-base font-semibold">🧠 Smart Gram Planning Tool</h2>

        <div className="flex flex-wrap gap-3 items-center text-sm">
          <div>
            <label className="block text-xs font-medium mb-1">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VILLAGE LIST + DETAIL */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Left: village list */}
        <div className="bg-white rounded-2xl shadow-sm p-3 max-h-[70vh] overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2">
            Villages (highest deficit first)
          </h3>
          <ul className="space-y-2 text-sm">
            {villages.map((v) => (
              <li
                key={v.village_code}
                onClick={() => handleVillageClick(v.village_code)}
                className={`border rounded-xl p-2 cursor-pointer hover:bg-gray-50
                  ${
                    selectedVillageCode === v.village_code
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
              >
                <div className="font-medium">
                  {v.village_name} ({v.gp_name})
                </div>
                <div className="text-xs text-gray-500">
                  {v.block_name}, {v.district_name}
                </div>
                <div className="text-xs mt-1">
                  Overall Deficit Index:{" "}
                  <span className="font-semibold">
                    {v.service_deficit_index?.toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: village detail */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          {loadingDetail && <p className="text-sm">Loading village details…</p>}

          {!loadingDetail && !villageDetail && (
            <p className="text-sm text-gray-500">
              Select a village from the left to see priority sectors and
              planning suggestions.
            </p>
          )}

          {!loadingDetail && villageDetail && (
            <div className="space-y-3 text-sm">
              <h3 className="text-base font-semibold">
                {villageDetail.village_name} ({villageDetail.gp_name})
              </h3>
              <p className="text-xs text-gray-500">
                {villageDetail.block_name}, {villageDetail.district_name} |
                Code: {villageDetail.village_code}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(villageDetail.deficits).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="border rounded-xl p-2 flex flex-col gap-1"
                    >
                      <span className="font-semibold capitalize">
                        {key}
                      </span>
                      <span>Score: {value.score?.toFixed(2)}</span>
                      <span
                        className={
                          value.level === "High"
                            ? "text-red-600 font-semibold"
                            : value.level === "Medium"
                            ? "text-orange-500 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        {value.level} deficit
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="mt-3 border-t pt-2 text-xs">
                <h4 className="font-semibold mb-1">Basic Suggestion</h4>
                <p>
                  Focus first on all sectors with{" "}
                  <span className="font-semibold">High</span> deficit.
                  If health and roads are high, propose health infra
                  upgrades (sub-centre, ANM, ASHA) and road connectivity
                  to nearest PHC/market.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
