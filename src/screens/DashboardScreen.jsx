import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.jsx";
import ServiceCard from "../components/ui/ServiceCard.jsx";

const CHAT_API = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const TRAIN_API = "http://127.0.0.1:7000";
const GRAM_API = "http://127.0.0.1:5000";

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [village, setVillage] = useState(null);

  // 1) Recommended schemes
  useEffect(() => {
    if (!token) return;

    fetch(`${CHAT_API}/user/recommended-schemes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // backend may return {items: [...]} or plain array; handle both
        if (Array.isArray(data)) setSchemes(data);
        else if (Array.isArray(data.items)) setSchemes(data.items);
        else setSchemes([]);
      })
      .catch((err) => {
        console.error(err);
        setSchemes([]);
      });
  }, [token]);

  // 2) Trainings + village detail (based on user profile)
  useEffect(() => {
    if (!user) return;

    // Trainings
    const params = new URLSearchParams();
    if (user.district) params.append("district", user.district);
    if (user.block) params.append("block", user.block);

    fetch(`${TRAIN_API}/trainings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setTrainings(data.items || []))
      .catch((err) => {
        console.error(err);
        setTrainings([]);
      });

    // Village infra detail
    if (user.village_code) {
      fetch(`${GRAM_API}/api/village_detail?village_code=${user.village_code}`)
        .then((res) => res.json())
        .then(setVillage)
        .catch((err) => {
          console.error(err);
          setVillage(null);
        });
    } else {
      setVillage(null);
    }
  }, [user]);

  if (!user) {
    return (
      <section className="mt-8 text-sm text-center space-y-3">
        <p>Please login to see your personalised dashboard.</p>
        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center px-4 py-2 rounded-full bg-[#166534] text-white text-xs font-semibold hover:bg-green-800"
        >
          Go to Login
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-4 text-sm flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            Namaste, {user.full_name || user.username} 👋
          </h2>
          <p className="text-[11px] text-gray-500">
            Yeh aapka personalised dashboard hai – schemes, trainings aur village
            status aapke profile ke basis par.
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            {user.district && (
              <>District: <span className="font-semibold">{user.district}</span> </>
            )}
            {user.block && (
              <>• Block: <span className="font-semibold">{user.block}</span> </>
            )}
            {user.village_code && (
              <>• Village code: <span className="font-semibold">{user.village_code}</span></>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate("/profile/edit")}
            className="self-start sm:self-auto px-3 py-1.5 rounded-full border border-gray-300 text-[11px] hover:bg-gray-50"
          >
           ✏️ Edit profile
          </button>
        </div>
      </div>

      {/* Recommended schemes */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#166534]">
            Recommended Schemes for you
          </h3>
          <button
            onClick={() => navigate("/finder")}
            className="text-[11px] text-[#166534] underline"
          >
            Open Schemes Finder ↗
          </button>
        </div>

        {schemes.length === 0 ? (
          <p className="text-[11px] text-gray-500">
            Abhi koi recommendation nahi mila. Registration me apni details check
            karo ya chat me schemes pucho.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {schemes.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  navigate("/finder", {
                    state: {
                      initialQuery:
                        s.title ||
                        s.name_en ||
                        s.name_hi ||
                        "",
                    },
                  })
                }
                className="text-left"
              >
                <ServiceCard
                  icon="📄"
                  title={
                    s.title ||
                    s.name_hi ||
                    s.name_en ||
                    "Scheme"
                  }
                  description={
                    s.subtitle ||
                    s.description_hi ||
                    s.description_en ||
                    "—"
                  }
                  badges={s.badges}
                  applyUrl={s.apply_url}
                  readMoreUrl={s.read_more_url}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trainings */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#166534]">
            Upcoming trainings in your area
          </h3>
          <button
            onClick={() => navigate("/my-panchayat/trainings")}
            className="text-[11px] text-[#166534] underline"
          >
            See all trainings ↗
          </button>
        </div>

        {trainings.length === 0 ? (
          <p className="text-[11px] text-gray-500">
            Abhi trainings list nahi mili. District/block sahi bharo registration
            me.
          </p>
        ) : (
          <div className="space-y-2 text-[11px]">
            {trainings.slice(0, 5).map((t, idx) => (
              <div
                key={idx}
                className="border rounded-xl p-2 flex flex-col gap-0.5"
              >
                <div className="font-semibold text-gray-800">
                  {t.training_name || "Training"}
                </div>
                <div className="text-gray-500 text-[10px]">
                  {t.org_institute}
                </div>
                <div className="text-gray-600">
                  🗓 {t.start_date} – {t.end_date}
                </div>
                <div className="text-[10px] text-gray-500">
                  {t.district}
                  {t.block ? ` • ${t.block}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Village infra status */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#166534]">
            Village infra status
          </h3>
          <button
            onClick={() => navigate("/my-panchayat/planning")}
            className="text-[11px] text-blue-600 underline"
          >
            Open full planning tool ↗
          </button>
        </div>

        {!village ? (
          <p className="text-[11px] text-gray-500">
            Registration me village code bharoge to yahan status dikhega.
          </p>
        ) : (
          <div className="text-[11px] space-y-2">
            <div className="font-semibold">
              {village.village_name} ({village.gp_name})
            </div>
            <div className="text-gray-500">
              {village.block_name}, {village.district_name} | Code:{" "}
              {village.village_code}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(village.deficits).map(([k, v]) => (
                <div key={k} className="border rounded-xl p-2">
                  <div className="font-semibold capitalize">{k}</div>
                  <div>Score: {v.score?.toFixed(2)}</div>
                  <div
                    className={
                      v.level === "High"
                        ? "text-red-600 font-semibold"
                        : v.level === "Medium"
                        ? "text-orange-500 font-semibold"
                        : "text-green-600 font-semibold"
                    }
                  >
                    {v.level} deficit
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
