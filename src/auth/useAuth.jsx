// src/auth/useAuth.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// Backend base
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("ps_token") || ""
  );
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Load /me when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    async function fetchMe() {
      try {
        setLoadingUser(true);

        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch /me");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error loading user:", err);
        setUser(null);
        setToken("");
        localStorage.removeItem("ps_token");
      } finally {
        setLoadingUser(false);
      }
    }

    fetchMe();
  }, [token]);

  // --- LOGIN ---
  const login = async (username, password) => {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }

    const data = await res.json();
    const t = data.access_token;
    setToken(t);
    localStorage.setItem("ps_token", t);
    return t;
  };

  // --- REGISTER ---
  const register = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed");
    }

    return res.json();
  };

  // --- UPDATE PROFILE ---
  const updateProfile = async (payload) => {
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_BASE}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Profile update failed");
    }

    const data = await res.json();
    setUser(data);
    return data;
  };

  // --- LOGOUT ---
  // 👉 Only remove auth info, DO NOT clear any chat keys.
  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("ps_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loadingUser, login, register, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
