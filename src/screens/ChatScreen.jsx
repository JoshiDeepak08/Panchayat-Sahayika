// src/screens/ChatScreen.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnswerCard from "../components/ui/AnswerCard.jsx";
import { useAuth } from "../auth/useAuth.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import SCHEMES from "../data/samaj_kalyan_vibhag_clean_typed.json";

// Configure API base once; override via .env: VITE_API_BASE=http://127.0.0.1:8000
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const API_URL = `${API_BASE}/ask`;

// Base key for localStorage
const STORAGE_KEY_BASE = "ps_chats_v1";

// Initial welcome message for every new chat
const WELCOME_MESSAGE = {
  from: "bot",
  type: "text",
  text:
    "नमस्ते! मैं आपकी पंचायत सहायिका हूं। Aap apna sawal bolkar ya likhkar pooch sakte hain.",
};

// Helper to make a new empty chat
function createNewChat() {
  return {
    id: `chat_${Date.now()}`,
    title: "New chat",
    createdAt: Date.now(),
    messages: [WELCOME_MESSAGE],
  };
}

// ------- Scheme details modal (same idea as finder screen) -------
function SchemeDetailsModal({ scheme, onClose }) {
  if (!scheme) return null;

  const fields = [
    ["TYPE", "type"],
    ["CATEGORY", "category"],
    ["DEPARTMENT", "department"],
    ["ELIGIBILITY", "eligibility"],
    ["BENEFIT", "benefit"],
    ["APPLY PROCESS", "apply_process"],
    ["SOURCE", "source"],
    ["LANGUAGE", "language"],
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 md:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-xl text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-1">
          {scheme.name_hi || scheme.name_en || "Scheme details"}
        </h2>
        {scheme.name_en && (
          <p className="text-sm text-gray-600 mb-3">{scheme.name_en}</p>
        )}

        {/* Meta line */}
        <p className="text-xs text-gray-500 mb-4">
          Scheme / Yojana {scheme.category ? `• ${scheme.category}` : ""}{" "}
          {scheme.department ? `• ${scheme.department}` : ""}
        </p>

        {/* Descriptions */}
        {scheme.description_hi && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold mb-1">विवरण (Hindi)</h3>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {scheme.description_hi}
            </p>
          </div>
        )}

        {scheme.description_en && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-1">Description (English)</h3>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {scheme.description_en}
            </p>
          </div>
        )}

        {/* Grid of extra fields */}
        <div className="mt-2 grid gap-4 md:grid-cols-2 text-sm">
          {fields.map(([label, key]) => {
            const value = scheme[key];
            if (!value) return null;
            return (
              <div key={key}>
                <div className="text-[11px] font-semibold tracking-wide text-gray-500 mb-1">
                  {label}
                </div>
                <div className="whitespace-pre-line text-gray-800">
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ======================== CHAT SCREEN ========================
export default function ChatScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLanguage(); // global site language (hi/en)
  const isHi = lang === "hi";

  // 🔑 storage key is per-user now
  const storageKey = user?.username
    ? `${STORAGE_KEY_BASE}_${user.username}`
    : `${STORAGE_KEY_BASE}_guest`;

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔤 UI language for chat responses (KEPT LOCAL - chat can use its own toggle)
  const [uiLang, setUiLang] = useState("hi"); // "hi" or "en"

  // 🎤 Mic listening status
  const [listening, setListening] = useState(false);

  // 🔈 / 📋 per-message state
  const [speakingKey, setSpeakingKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // 👁️ show/hide sidebar
  const [showSidebar, setShowSidebar] = useState(true);

  // 💡 currently opened scheme (for popup)
  const [selectedScheme, setSelectedScheme] = useState(null);

  // ---------- helpers for scheme popup & filtering ----------
  function getSchemeByLabel(label) {
    if (!label) return null;

    const norm = label.replace(/[()]/g, "").trim().toLowerCase();

    const match =
      SCHEMES.find((s) => {
        const hi = String(s.name_hi || "").toLowerCase();
        const en = String(s.name_en || "").toLowerCase();
        return (
          hi === norm ||
          en === norm ||
          hi.includes(norm) ||
          en.includes(norm)
        );
      }) || null;

    return match;
  }

  function openSchemeByName(label) {
    const match = getSchemeByLabel(label);
    if (match) {
      setSelectedScheme(match);
    } else {
      console.warn("Scheme not found for pill:", label);
    }
  }

  // ---------- Load chats from localStorage on first mount ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const loadedChats = Array.isArray(parsed.chats) ? parsed.chats : [];
        if (loadedChats.length > 0) {
          setChats(loadedChats);
          setActiveChatId(parsed.activeChatId || loadedChats[0].id);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load chats from storage:", err);
    }

    const firstChat = createNewChat();
    setChats([firstChat]);
    setActiveChatId(firstChat.id);
  }, [storageKey]);

  // ---------- Persist chats to localStorage whenever they change ----------
  useEffect(() => {
    if (!chats.length) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ chats, activeChatId }));
    } catch (err) {
      console.error("Failed to save chats:", err);
    }
  }, [chats, activeChatId, storageKey]);

  const activeChat =
    chats.find((c) => c.id === activeChatId) || chats[0] || null;
  const messages = activeChat?.messages || [];

  // ---------- Helper functions ----------
  function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  function stripApplyReadMore(html) {
    if (!html) return html;
    return html.replace(/Apply\s*\/\s*Read More[^<]*/gi, "");
  }

  function handleSpeak(msgKey, msg) {
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        alert(isHi ? "आपका ब्राउज़र वॉइस सपोर्ट नहीं करता।" : "Your browser doesn't support TTS.");
        return;
      }

      if (speakingKey === msgKey) {
        window.speechSynthesis.cancel();
        setSpeakingKey(null);
        return;
      }

      const plainText = stripHtml(msg.text || "");
      if (!plainText.trim()) return;

      const utterance = new SpeechSynthesisUtterance(plainText);
      const hasDevanagari = /[\u0900-\u097F]/.test(plainText);
      if (msg.lang === "en" && !hasDevanagari) {
        utterance.lang = "en-IN";
      } else {
        utterance.lang = "hi-IN";
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setSpeakingKey(msgKey);
      utterance.onend = () => setSpeakingKey(null);
    } catch (err) {
      console.error("TTS error:", err);
      setSpeakingKey(null);
    }
  }

  async function handleCopy(msgKey, msg) {
    try {
      const plainText = stripHtml(msg.text || "");
      if (!plainText.trim()) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(plainText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = plainText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedKey(msgKey);
      setTimeout(() => setCopiedKey((curr) => (curr === msgKey ? null : curr)), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
      alert(isHi ? "कॉपी विफल हुआ।" : "Copy failed.");
    }
  }

  function startListening() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert(isHi ? "आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता।" : "Your browser does not support voice input.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN";
      recognition.interimResults = false;

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);

      recognition.onresult = (event) => {
        const speechText = event.results?.[0]?.[0]?.transcript ?? "";
        if (!speechText) return;
        setInput((prev) => (prev ? `${prev.trimEnd()} ${speechText}` : speechText));
      };

      recognition.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setListening(false);
        alert((isHi ? "माइक त्रुटि: " : "Mic error: ") + (err?.error ?? "unknown"));
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition exception:", err);
      setListening(false);
    }
  }

  function handleNewChat() {
    const newChat = createNewChat();
    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChat.id);
    setInput("");
    setSpeakingKey(null);
    setCopiedKey(null);
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function handleDeleteChat(chatId, e) {
    e.stopPropagation();
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== chatId);
      if (filtered.length === 0) {
        const nc = createNewChat();
        setActiveChatId(nc.id);
        return [nc];
      }
      if (chatId === activeChatId) setActiveChatId(filtered[0].id);
      return filtered;
    });
  }

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;
    if (!activeChatId || !activeChat) return;

    const prevMessages = messages || [];
    const historyForBackend = prevMessages.slice(-6).map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: stripHtml(m.text || ""),
    }));

    const userMeta = user
      ? {
          district: user.district || null,
          block: user.block || null,
          village_code: user.village_code || null,
          age: user.age || null,
          gender: user.gender || null,
          interest_tag: user.interest_tag || null,
          disability: user.disability || null,
          occupation: user.occupation || null,
          income_bracket: user.income_bracket || null,
          social_category: user.social_category || null,
        }
      : null;

    const userMsg = { from: "user", type: "text", text: question };
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title:
                chat.title === "New chat"
                  ? question.length > 30
                    ? question.slice(0, 30) + "..."
                    : question
                  : chat.title,
              messages: [...chat.messages, userMsg],
            }
          : chat
      )
    );

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          ui_lang: uiLang,
          mode: "auto",
          history: historyForBackend,
          user_meta: userMeta,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
      const data = await res.json();

      let botMsg;
      if (data.message || data.cards) {
        botMsg = {
          from: "bot",
          type: "answer+cards",
          text: stripApplyReadMore(data.message || ""),
          cards: Array.isArray(data.cards) ? data.cards : [],
          lang: uiLang,
          sources: Array.isArray(data.sources) ? data.sources : [],
        };
      } else {
        botMsg = {
          from: "bot",
          type: "answer",
          text: stripApplyReadMore(data.response || ""),
          sources: Array.isArray(data.sources) ? data.sources : [],
          lang: uiLang,
        };
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId ? { ...chat, messages: [...chat.messages, botMsg] } : chat
        )
      );
    } catch (e) {
      console.error(e);
      const errorMsg = {
        from: "bot",
        type: "text",
        text: isHi
          ? "माफ़ कीजिए, सर्वर से कनेक्शन नहीं हो पाया। कृपया थोड़ी देर बाद पुनः प्रयास करें।"
          : "Sorry, couldn't connect to the server. Please try again later.",
      };
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId ? { ...chat, messages: [...chat.messages, errorMsg] } : chat
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleSelectChat(chatId) {
    setActiveChatId(chatId);
    setSpeakingKey(null);
    setCopiedKey(null);
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  }

  if (!activeChat) return null;

  return (
    <>
      <section className="h-full w-full flex gap-4 overflow-hidden">
        {/* Left: chat history sidebar */}
        <aside
          className={[
            "bg-white rounded-3xl shadow-md flex flex-col transition-all duration-200",
            showSidebar ? "w-64 p-4" : "w-0 p-0",
          ].join(" ")}
        >
          {showSidebar && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="text-xs px-3 py-2 rounded-full bg-[#166534] text-white hover:bg-[#14532d]"
                  title={isHi ? "नया चैट" : "New chat"}
                >
                  {isHi ? "+ नया चैट" : "+ New chat"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSidebar(false)}
                  className="w-7 h-7 text-xs rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  title={isHi ? "छुपाएँ" : "Hide"}
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 text-xs">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => handleSelectChat(chat.id)}
                    className={`w-full text-left px-3 py-2 rounded-2xl border flex items-center justify-between gap-2 ${
                      chat.id === activeChatId
                        ? "bg-[#E6F4EA] border-[#166534] text-gray-900"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    title={isHi ? "खोलें" : "Open"}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{chat.title}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(chat.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="ml-1 text-[11px] text-red-500 hover:text-red-700"
                      title={isHi ? "चैट हटाएँ" : "Delete chat"}
                      aria-label={isHi ? "चैट हटाएँ" : "Delete chat"}
                    >
                      🗑
                    </button>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Middle + right column */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Middle: language toggle + chat UI (chat area keeps internal toggle) */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Top row: sidebar icon + chat's language toggle */}
            <div className="w-full flex items-center justify-between pr-4">
              <button
                type="button"
                onClick={() => setShowSidebar((s) => !s)}
                className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-sm"
                title={showSidebar ? (isHi ? "इतिहास छुपाएँ" : "Hide history") : (isHi ? "इतिहास दिखाएँ" : "Show history")}
              >
                ☰
              </button>

              <div className="flex gap-2 text-[11px] ml-auto">
                <button
                  type="button"
                  onClick={() => setUiLang("hi")}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    uiLang === "hi"
                      ? "bg-[#166534] text-white border-[#166534]"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  title={isHi ? "यहाँ चैट भाषा बदलें (हिन्दी)" : "Change chat language (Hindi)"}
                >
                  {isHi ? "हिन्दी/ Hinglish" : "हिन्दी / Hinglish"}
                </button>
                <button
                  type="button"
                  onClick={() => setUiLang("en")}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    uiLang === "en"
                      ? "bg-[#166534] text-white border-[#166534]"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  title={isHi ? "यहाँ चैट भाषा बदलें (अंग्रेज़ी)" : "Change chat language (English)"}
                >
                  {isHi ? "English" : "English"}
                </button>
              </div>
            </div>

            {/* Chat area – only this scrolls */}
            <div className="flex-1 flex justify-center overflow-hidden">
              <div className="w-full max-w-3xl bg-white rounded-3xl shadow-md p-4 flex flex-col gap-3 overflow-y-auto">
                {messages.map((msg, idx) => {
                  const msgKey = `${activeChatId}-${idx}`;

                  if (msg.from === "user") {
                    return (
                      <div
                        key={msgKey}
                        className="self-end bg-[#166534] text-white text-xs rounded-2xl px-3 py-2 max-w-[60%]"
                      >
                        {msg.text}
                      </div>
                    );
                  }

                  if (msg.type === "answer+cards") {
                    return (
                      <div key={msgKey} className="self-start max-w-[85%] flex flex-col gap-2">
                        <div className="bg-[#E6F4EA] text-[10px] text-gray-800 rounded-2xl px-3 py-1 inline-block">
                          🤖 Panchayat Sahayika
                        </div>

                        <AnswerCard>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-500">
                              Panchayat Sahayika ka jawab
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSpeak(msgKey, msg)}
                                className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]"
                                title={speakingKey === msgKey ? (isHi ? "बोलना बंद करें" : "Stop") : (isHi ? "उत्तर सुनें" : "Listen")}
                              >
                                {speakingKey === msgKey ? "⏹" : "🔈"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(msgKey, msg)}
                                className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]"
                                title={isHi ? "कॉपि करें" : "Copy"}
                              >
                                📋
                              </button>
                              {copiedKey === msgKey && <span className="text-[10px] text-gray-500">{isHi ? "कॉपी हुआ" : "Copied"}</span>}
                            </div>
                          </div>

                          <div className="text-xs leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: msg.text }} />

                          {msg.sources?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {msg.sources.map((s, i) => {
                                const label = s.name_hi || s.name_en;
                                const hasData = getSchemeByLabel(label);
                                if (!hasData) return null;
                                return (
                                  <button key={i} type="button" onClick={() => openSchemeByName(label)} className="px-3 py-1 bg-[#ECFDF5] text-[10px] text-[#166534] rounded-full border border-[#BBF7D0] cursor-pointer hover:bg-[#D1F1DE]">
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {msg.cards?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {msg.cards.map((c, i) => {
                                const label = c.title_hi || c.title;
                                const hasData = getSchemeByLabel(label);
                                if (!hasData) return null;
                                return (
                                  <button key={i} type="button" onClick={() => openSchemeByName(label)} className="w-full text-left border border-[#E5E7EB] rounded-2xl bg-[#F9FAFB] px-3 py-2 hover:bg-white hover:shadow-sm transition cursor-pointer">
                                    <div className="text-xs font-semibold text-gray-900">{c.title}</div>
                                    {c.subtitle && <div className="text-[11px] text-gray-600 mt-0.5">{c.subtitle}</div>}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </AnswerCard>
                      </div>
                    );
                  }

                  if (msg.type === "answer") {
                    return (
                      <div key={msgKey} className="self-start max-w-[80%] flex flex-col gap-2">
                        <div className="bg-[#E6F4EA] text-[10px] text-gray-800 rounded-2xl px-3 py-1 inline-block">🤖 Panchayat Sahayika</div>
                        <AnswerCard>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-500">Panchayat Sahayika ka jawab</span>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => handleSpeak(msgKey, msg)} className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]" title={speakingKey === msgKey ? (isHi ? "बोलना बंद करें" : "Stop") : (isHi ? "उत्तर सुनें" : "Listen")}>{speakingKey === msgKey ? "⏹" : "🔈"}</button>
                              <button type="button" onClick={() => handleCopy(msgKey, msg)} className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]" title={isHi ? "कॉपि करें" : "Copy"}>📋</button>
                              {copiedKey === msgKey && <span className="text-[10px] text-gray-500">{isHi ? "कॉपी हुआ" : "Copied"}</span>}
                            </div>
                          </div>

                          <div className="text-xs leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: msg.text }} />

                          {msg.sources?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {msg.sources.map((s, i) => {
                                const label = s.name_hi || s.name_en;
                                const hasData = getSchemeByLabel(label);
                                if (!hasData) return null;
                                return (
                                  <button key={i} type="button" onClick={() => openSchemeByName(label)} className="px-3 py-1 bg-[#ECFDF5] text-[10px] text-[#166534] rounded-full border border-[#BBF7D0] cursor-pointer hover:bg-[#D1F1DE]">
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </AnswerCard>
                      </div>
                    );
                  }

                  return (
                    <div key={msgKey} className="self-start bg-[#E6F4EA] text-xs text-gray-800 rounded-2xl px-3 py-2 max-w-[70%]">
                      <div className="font-semibold mb-1">🤖 Panchayat Sahayika</div>
                      <div>{msg.text}</div>
                    </div>
                  );
                })}

                {loading && <div className="self-start bg-[#E6F4EA] text-[10px] text-gray-600 rounded-2xl px-3 py-1 max-w-[40%]">{isHi ? "सोच रही हूँ..." : "Thinking..."}</div>}
              </div>
            </div>

            {/* Input bar */}
            <div className="w-full max-w-3xl bg-white border-t border-gray-200 px-3 py-3 rounded-t-3xl flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center text-sm" type="button" onClick={startListening} title={isHi ? "वॉइस इनपुट" : "Voice input"}>
                {listening ? "🔴" : "🎙️"}
              </button>

              <input
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-xs outline-none"
                placeholder={isHi ? "अपना सवाल यहाँ लिखें..." : "Type your question... / अपना सवाल यहाँ लिखें..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center text-sm disabled:opacity-60" type="button" onClick={sendMessage} disabled={loading || !input.trim()} title={isHi ? "भेजें" : "Send"}>
                ➤
              </button>
            </div>

            {listening && <div className="text-[11px] text-green-700 pl-14 pb-2">🎙️ {isHi ? "मैं आपकी बात सुन रही हूँ... साफ़-साफ़ बोलिए।" : "I'm listening... speak clearly."}</div>}
          </div>

          {/* Right side: 3 bilingual cards but now fully Hindi when isHi */}
          <div className="w-80 flex flex-col gap-4 pr-4 pt-10">
            <button type="button" onClick={() => navigate("/finder")} className="bg-white rounded-3xl shadow-md border border-[#F4E3C3] px-4 py-4 text-left hover:shadow-lg transition cursor-pointer" title={isHi ? "योजनाएँ / सेवाएँ" : "Find Schemes & Services"}>
              <div className="text-xs font-semibold text-[#166534] mb-1">{isHi ? "योजनाएँ / सेवाएँ / प्रोग्राम" : "योजनाएँ / सेवाएँ / प्रोग्राम"}</div>
              <div className="text-sm font-semibold mb-1">{isHi ? "सरकारी योजनाएं खोजें" : "Find Schemes & Services"}</div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{isHi ? "अपने गाँव, जाति, सेवा या अन्य विवरण के आधार पर आपके लिए उपलब्ध सरकारी योजनाएँ देखें।" : "Check government schemes available for your village, caste, service or other details."}</p>
            </button>

            <button type="button" onClick={() => navigate("/my-panchayat/trainings")} className="bg-white rounded-3xl shadow-md border border-[#F4E3C3] px-4 py-4 text-left hover:shadow-lg transition cursor-pointer" title={isHi ? "प्रशिक्षण / क्षमता विकास" : "Panchayat Trainings Finder"}>
              <div className="text-xs font-semibold text-[#166534] mb-1">{isHi ? "प्रशिक्षण / क्षमता विकास" : "प्रशिक्षण / क्षमता विकास"}</div>
              <div className="text-sm font-semibold mb-1">{isHi ? "पंचायत प्रशिक्षण खोजक" : "Panchayat Trainings Finder"}</div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{isHi ? "जिला और ब्लॉक के हिसाब से सभी पंचायत प्रशिक्षण एक ही जगह पर देखें।" : "View all Panchayat trainings by District and Block in one place."}</p>
            </button>

            <button type="button" onClick={() => navigate("/my-panchayat/planning")} className="bg-white rounded-3xl shadow-md border border-[#F4E3C3] px-4 py-4 text-left hover:shadow-lg transition cursor-pointer" title={isHi ? "स्मार्ट ग्राम प्लानिंग" : "Smart Gram Planning"}>
              <div className="text-xs font-semibold text-[#166534] mb-1">{isHi ? "स्मार्ट ग्राम प्लानिंग" : "स्मार्ट ग्राम प्लानिंग"}</div>
              <div className="text-sm font-semibold mb-1">{isHi ? "स्मार्ट ग्राम योजना उपकरण" : "Smart Gram Planning Tool"}</div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{isHi ? "ग्राम इन्फ्रा डेफिसिट इंडेक्स के आधार पर विकास प्राथमिकताएँ और सुझाए गए परियोजनाएं देखें।" : "See development priorities and suggested projects based on village infra deficit index."}</p>
            </button>
          </div>
        </div>
      </section>

      {/* Scheme popup */}
      <SchemeDetailsModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />
    </>
  );
}
