// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../auth/useAuth.jsx";

// const API_BASE = "http://127.0.0.1:8000";

// export default function LoginScreen() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const { setToken } = useAuth();
//   const navigate = useNavigate();

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     try {
//       const body = new URLSearchParams();
//       body.append("username", username);
//       body.append("password", password);

//       const res = await fetch(`${API_BASE}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body,
//       });
//       if (!res.ok) throw new Error("Login failed");
//       const data = await res.json();
//       setToken(data.access_token);
//       navigate("/dashboard");
//     } catch (err) {
//       console.error(err);
//       setError("गलत username या password.");
//     }
//   }

//   return (
//     <section className="flex justify-center mt-8">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm space-y-3 text-sm"
//       >
//         <h2 className="text-lg font-semibold">Login</h2>
//         <input
//           className="w-full border rounded-md px-3 py-2 text-sm"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//         <input
//           className="w-full border rounded-md px-3 py-2 text-sm"
//           placeholder="Password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         {error && <p className="text-xs text-red-600">{error}</p>}
//         <button
//           type="submit"
//           className="w-full bg-[#166534] text-white rounded-md py-2 text-sm"
//         >
//           Login
//         </button>
//       </form>
//     </section>
//   );
// }


// src/screens/LoginScreen.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth.jsx";

export default function LoginScreen() {
  const { login, loadingUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }
    try {
      setSubmitting(true);
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center mt-8 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-soft border border-cardBorder px-6 py-6 space-y-4 text-left">
        <h1 className="text-xl font-semibold text-textMain">
          Login to Panchayat Sahayika
        </h1>
        <p className="text-[12px] text-gray-600">
          Use your account to see personalised schemes, trainings and village
          status.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-700">
              Username
            </label>
            <input
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || loadingUser}
            className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#166534] text-white text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-[11px] text-gray-600">
          New here?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-[#166534] underline"
          >
            Create an account
          </button>
        </p>
      </div>
    </section>
  );
}
