// // src/screens/ChatScreen.jsx
// import { useState } from "react";
// import AnswerCard from "../components/ui/AnswerCard.jsx";
// import ServiceCard from "../components/ui/ServiceCard.jsx";

// // Configure API base once; override via .env: VITE_API_BASE=http://127.0.0.1:8000
// const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
// const API_URL = `${API_BASE}/ask`;

// export default function ChatScreen() {
//   const [messages, setMessages] = useState([
//     {
//       from: "bot",
//       type: "text",
//       text:
//         "नमस्ते! मैं आपकी पंचायत सहायिका हूं। Aap apna sawal bolkar ya likhkar pooch sakte hain.",
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   // 🔤 UI language (Hindi / English)
//   const [uiLang, setUiLang] = useState("hi"); // "hi" or "en"

//   // 🎤 Mic listening status
//   const [listening, setListening] = useState(false);

//   // ---------- Helper functions ----------

//   // HTML -> plain text (copy + TTS ke liye)
//   function stripHtml(html) {
//     const tmp = document.createElement("div");
//     tmp.innerHTML = html;
//     return tmp.textContent || tmp.innerText || "";
//   }

//   // 🔈 Text aloud padhne ke liye (Web Speech API)
//   function handleSpeak(msg) {
//     try {
//       if (typeof window === "undefined" || !window.speechSynthesis) {
//         alert("Aapka browser voice output support nahi karta.");
//         return;
//       }

//       const plainText = stripHtml(msg.text || "");
//       if (!plainText.trim()) return;

//       const utterance = new SpeechSynthesisUtterance(plainText);

//       // Devanagari ho to Hindi, warna UI language ke hisaab se
//       const hasDevanagari = /[\u0900-\u097F]/.test(plainText);
//       if (msg.lang === "en" && !hasDevanagari) {
//         utterance.lang = "en-IN";
//       } else {
//         utterance.lang = "hi-IN";
//       }

//       window.speechSynthesis.cancel();
//       window.speechSynthesis.speak(utterance);
//     } catch (err) {
//       console.error("TTS error:", err);
//     }
//   }

//   // 📋 Response clipboard pe copy
//   async function handleCopy(msg) {
//     try {
//       const plainText = stripHtml(msg.text || "");
//       if (!plainText.trim()) return;

//       if (navigator.clipboard && navigator.clipboard.writeText) {
//         await navigator.clipboard.writeText(plainText);
//       } else {
//         // fallback
//         const textarea = document.createElement("textarea");
//         textarea.value = plainText;
//         document.body.appendChild(textarea);
//         textarea.select();
//         document.execCommand("copy");
//         document.body.removeChild(textarea);
//       }
//       // Optional: toast ya alert yahan de sakte ho
//       // alert("Text copy ho gaya ✅");
//     } catch (err) {
//       console.error("Copy failed:", err);
//       alert("Copy karne me dikkat aayi.");
//     }
//   }

//   // 🎤 Start voice recognition using Web Speech API
//   function startListening() {
//     try {
//       const SpeechRecognition =
//         window.SpeechRecognition || window.webkitSpeechRecognition;

//       if (!SpeechRecognition) {
//         alert(
//           "आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता। कृपया Google Chrome का इस्तेमाल करें।"
//         );
//         return;
//       }

//       const recognition = new SpeechRecognition();
//       recognition.lang = "hi-IN"; // Hindi; use "hi-IN,en-US" for Hinglish
//       recognition.interimResults = false;

//       recognition.onstart = () => setListening(true);
//       recognition.onend = () => setListening(false);

//       recognition.onresult = (event) => {
//         const speechText = event.results?.[0]?.[0]?.transcript ?? "";
//         if (!speechText) return;

//         // Mic se jo bola, use input box me daal do
//         setInput((prev) =>
//           prev ? `${prev.trimEnd()} ${speechText}` : speechText
//         );
//       };

//       recognition.onerror = (err) => {
//         console.error("Speech recognition error:", err);
//         setListening(false);
//         alert("Mic error: " + (err?.error ?? "unknown"));
//       };

//       recognition.start();
//     } catch (err) {
//       console.error("Speech recognition exception:", err);
//       setListening(false);
//     }
//   }

//   async function sendMessage() {
//     const question = input.trim();
//     if (!question || loading) return;

//     setMessages((m) => [...m, { from: "user", type: "text", text: question }]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         // Backend /ask expects { question, ui_lang, mode, history }
//         body: JSON.stringify({
//           question,
//           ui_lang: uiLang,
//           mode: "auto",
//           history: [],
//         }),
//       });

//       if (!res.ok)
//         throw new Error(`API error: ${res.status} ${res.statusText}`);

//       const data = await res.json();

//       // ---- new API shape ----
//       if (data.message || data.cards) {
//         setMessages((m) => [
//           ...m,
//           {
//             from: "bot",
//             type: "answer+cards",
//             text: data.message || "",
//             cards: Array.isArray(data.cards) ? data.cards : [],
//             lang: uiLang,
//           },
//         ]);
//         return;
//       }

//       // ---- old shape: { response, sources } ----
//       setMessages((m) => [
//         ...m,
//         {
//           from: "bot",
//           type: "answer",
//           text: data.response || "",
//           sources: Array.isArray(data.sources) ? data.sources : [],
//           lang: uiLang,
//         },
//       ]);
//     } catch (e) {
//       console.error(e);
//       setMessages((m) => [
//         ...m,
//         {
//           from: "bot",
//           type: "text",
//           text:
//             "माफ़ कीजिए, सर्वर से कनेक्शन नहीं हो पाया। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleKeyDown(e) {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   }

//   return (
//     <section className="flex flex-col gap-4 h-[calc(100vh-120px)]">
//       {/* Language toggle */}
//       <div className="w-full max-w-4xl mx-auto flex justify-end gap-2 text-[11px]">
//         <button
//           type="button"
//           onClick={() => setUiLang("hi")}
//           className={`px-3 py-1 rounded-full border text-xs ${
//             uiLang === "hi"
//               ? "bg-[#166534] text-white border-[#166534]"
//               : "bg-white text-gray-700 border-gray-300"
//           }`}
//         >
//           हिन्दी / Hinglish
//         </button>
//         <button
//           type="button"
//           onClick={() => setUiLang("en")}
//           className={`px-3 py-1 rounded-full border text-xs ${
//             uiLang === "en"
//               ? "bg-[#166534] text-white border-[#166534]"
//               : "bg-white text-gray-700 border-gray-300"
//           }`}
//         >
//           English
//         </button>
//       </div>

//       {/* Chat area */}
//       <div className="flex-1 flex justify-center">
//         <div className="w-full max-w-4xl bg-white rounded-3xl shadow-md p-4 flex flex-col gap-3 overflow-y-auto">
//           {messages.map((msg, idx) => {
//             // User bubble
//             if (msg.from === "user") {
//               return (
//                 <div
//                   key={idx}
//                   className="self-end bg-[#166534] text-white text-xs rounded-2xl px-3 py-2 max-w-[60%]"
//                 >
//                   {msg.text}
//                 </div>
//               );
//             }

//             // Bot answer: plain text + cards (new shape)
//             if (msg.type === "answer+cards") {
//               return (
//                 <div
//                   key={idx}
//                   className="self-start max-w-[85%] flex flex-col gap-2"
//                 >
//                   <div className="bg-[#E6F4EA] text-[10px] text-gray-800 rounded-2xl px-3 py-1 inline-block">
//                     🤖 Panchayat Sahayika
//                   </div>

//                   <AnswerCard>
//                     {/* Header row: speaker + copy */}
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-[10px] text-gray-500">
//                         Panchayat Sahayika ka jawab
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <button
//                           type="button"
//                           onClick={() => handleSpeak(msg)}
//                           className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]"
//                           title="Jawab सुनें"
//                         >
//                           🔈
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => handleCopy(msg)}
//                           className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]"
//                           title="Copy karein"
//                         >
//                           📋
//                         </button>
//                       </div>
//                     </div>

//                     {/* actual answer HTML */}
//                     <div
//                       className="text-xs leading-relaxed whitespace-pre-line"
//                       dangerouslySetInnerHTML={{ __html: msg.text }}
//                     />
//                   </AnswerCard>

//                   {/* cards */}
//                   {msg.cards?.length > 0 && (
//                     <div className="mt-1 space-y-2">
//                       {msg.cards.map((c, i) => (
//                         <ServiceCard
//                           key={i}
//                           title={c.title}
//                           subtitle={c.subtitle}
//                           verified={c.verified}
//                           badges={c.badges}
//                           applyUrl={c.apply_url}
//                           readMoreUrl={c.read_more_url}
//                         />
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               );
//             }

//             // Bot answer: text + sources (old shape)
//             if (msg.type === "answer") {
//               return (
//                 <div
//                   key={idx}
//                   className="self-start max-w-[80%] flex flex-col gap-2"
//                 >
//                   <div className="bg-[#E6F4EA] text-[10px] text-gray-800 rounded-2xl px-3 py-1 inline-block">
//                     🤖 Panchayat Sahayika
//                   </div>
//                   <AnswerCard>
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-[10px] text-gray-500">
//                         Panchayat Sahayika ka jawab
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <button
//                           type="button"
//                           onClick={() => handleSpeak(msg)}
//                           className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]"
//                           title="Jawab सुनें"
//                         >
//                           🔈
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => handleCopy(msg)}
//                           className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]"
//                           title="Copy karein"
//                         >
//                           📋
//                         </button>
//                       </div>
//                     </div>

//                     <div
//                       className="text-xs leading-relaxed whitespace-pre-line"
//                       dangerouslySetInnerHTML={{ __html: msg.text }}
//                     />

//                     {msg.sources?.length > 0 && (
//                       <div className="mt-2 flex flex-wrap gap-1">
//                         {msg.sources.map((s, i) => (
//                           <span
//                             key={i}
//                             className="px-2 py-1 bg-[#ECFDF5] text-[10px] text-[#166534] rounded-full border border-[#BBF7D0]"
//                           >
//                             {s.name_hi || s.name_en}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </AnswerCard>
//                 </div>
//               );
//             }

//             // Simple bot bubble (initial greeting)
//             return (
//               <div
//                 key={idx}
//                 className="self-start bg-[#E6F4EA] text-xs text-gray-800 rounded-2xl px-3 py-2 max-w-[70%]"
//               >
//                 <div className="font-semibold mb-1">🤖 Panchayat Sahayika</div>
//                 <div>{msg.text}</div>
//               </div>
//             );
//           })}

//           {loading && (
//             <div className="self-start bg-[#E6F4EA] text-[10px] text-gray-600 rounded-2xl px-3 py-1 max-w-[40%]">
//               सोच रही हूँ...
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Input bar */}
//       <div className="w-full max-w-4xl mx-auto bg-white border-t border-gray-200 px-3 py-3 rounded-t-3xl flex items-center gap-3">
//         {/* 🎤 Mic button with listening state */}
//         <button
//           className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center text-sm"
//           type="button"
//           onClick={startListening}
//           title="Voice input"
//         >
//           {listening ? "🔴" : "🎙️"}
//         </button>

//         <input
//           className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-xs outline-none"
//           placeholder="Type your question... / अपना सवाल यहाँ लिखें..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//         />

//         <button
//           className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center text-sm disabled:opacity-60"
//           type="button"
//           onClick={sendMessage}
//           disabled={loading || !input.trim()}
//           title="Send"
//         >
//           ➤
//         </button>
//       </div>

//       {/* optional “listening…” text below bar */}
//       {listening && (
//         <div className="w-full max-w-4xl mx-auto text-[11px] text-green-700 pl-14 pb-2">
//           🎙️ मैं आपकी बात सुन रही हूँ... साफ़-साफ़ बोलिए।
//         </div>
//       )}
//     </section>
//   );
// }



// src/screens/ChatScreen.jsx
import { useEffect, useState } from "react";
import AnswerCard from "../components/ui/AnswerCard.jsx";
import ServiceCard from "../components/ui/ServiceCard.jsx";

// Configure API base once; override via .env: VITE_API_BASE=http://127.0.0.1:8000
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const API_URL = `${API_BASE}/ask`;

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

export default function ChatScreen() {
  const [chats, setChats] = useState([]); // {id,title,createdAt,messages[]}
  const [activeChatId, setActiveChatId] = useState(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔤 UI language (Hindi / English)
  const [uiLang, setUiLang] = useState("hi"); // "hi" or "en"

  // 🎤 Mic listening status
  const [listening, setListening] = useState(false);

  // 🔈 / 📋 per-message state
  const [speakingKey, setSpeakingKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // ---------- Load chats from localStorage on first mount ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ps_chats_v1");
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

    // If nothing in storage, create first chat
    const firstChat = createNewChat();
    setChats([firstChat]);
    setActiveChatId(firstChat.id);
  }, []);

  // ---------- Persist chats to localStorage whenever they change ----------
  useEffect(() => {
    if (!chats.length) return;
    try {
      localStorage.setItem(
        "ps_chats_v1",
        JSON.stringify({ chats, activeChatId })
      );
    } catch (err) {
      console.error("Failed to save chats:", err);
    }
  }, [chats, activeChatId]);

  const activeChat =
    chats.find((c) => c.id === activeChatId) || chats[0] || createNewChat();
  const messages = activeChat.messages || [];

  // ---------- Helper functions ----------

  // HTML -> plain text (copy + TTS ke liye)
  function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // 🔈 Text aloud padhne ke liye (Web Speech API)
  function handleSpeak(msgKey, msg) {
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        alert("Aapka browser voice output support nahi karta.");
        return;
      }

      // Agar yehi message already bol raha hai → stop
      if (speakingKey === msgKey) {
        window.speechSynthesis.cancel();
        setSpeakingKey(null);
        return;
      }

      const plainText = stripHtml(msg.text || "");
      if (!plainText.trim()) return;

      const utterance = new SpeechSynthesisUtterance(plainText);

      // Devanagari ho to Hindi, warna UI language ke hisaab se
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

  // 📋 Response clipboard pe copy
  async function handleCopy(msgKey, msg) {
    try {
      const plainText = stripHtml(msg.text || "");
      if (!plainText.trim()) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(plainText);
      } else {
        // fallback
        const textarea = document.createElement("textarea");
        textarea.value = plainText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedKey(msgKey);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === msgKey ? null : curr));
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Copy karne me dikkat aayi.");
    }
  }

  // 🎤 Start voice recognition using Web Speech API
  function startListening() {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert(
          "आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता। कृपया Google Chrome का इस्तेमाल करें।"
        );
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN"; // Hindi; use "hi-IN,en-US" for Hinglish
      recognition.interimResults = false;

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);

      recognition.onresult = (event) => {
        const speechText = event.results?.[0]?.[0]?.transcript ?? "";
        if (!speechText) return;

        // Mic se jo bola, use input box me daal do
        setInput((prev) =>
          prev ? `${prev.trimEnd()} ${speechText}` : speechText
        );
      };

      recognition.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setListening(false);
        alert("Mic error: " + (err?.error ?? "unknown"));
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
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;
    if (!activeChatId) return;

    // Backend ke liye last kuch history messages (sirf text)
    const prevMessages = messages || [];
    const historyForBackend = prevMessages.slice(-6).map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: stripHtml(m.text || ""),
    }));

    // 1) User message UI me daal do
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
        // Backend /ask expects { question, ui_lang, mode, history }
        body: JSON.stringify({
          question,
          ui_lang: uiLang,
          mode: "auto",
          history: historyForBackend,
        }),
      });

      if (!res.ok)
        throw new Error(`API error: ${res.status} ${res.statusText}`);

      const data = await res.json();

      let botMsg;
      if (data.message || data.cards) {
        botMsg = {
          from: "bot",
          type: "answer+cards",
          text: data.message || "",
          cards: Array.isArray(data.cards) ? data.cards : [],
          lang: uiLang,
        };
      } else {
        botMsg = {
          from: "bot",
          type: "answer",
          text: data.response || "",
          sources: Array.isArray(data.sources) ? data.sources : [],
          lang: uiLang,
        };
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, botMsg] }
            : chat
        )
      );
    } catch (e) {
      console.error(e);
      const errorMsg = {
        from: "bot",
        type: "text",
        text:
          "माफ़ कीजिए, सर्वर से कनेक्शन नहीं हो पाया। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
      };
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, errorMsg] }
            : chat
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
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  return (
    <section className="flex gap-4 h-[calc(100vh-120px)]">
      {/* Left: chat history sidebar */}
      <div className="w-60 bg-white rounded-3xl shadow-md p-3 flex flex-col">
        <button
          type="button"
          onClick={handleNewChat}
          className="mb-3 w-full text-xs py-2 rounded-full bg-[#166534] text-white hover:bg-[#14532d]"
        >
          + New chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 text-xs">
          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => handleSelectChat(chat.id)}
              className={`w-full text-left px-3 py-2 rounded-2xl border ${
                chat.id === activeChatId
                  ? "bg-[#E6F4EA] border-[#166534] text-gray-900"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="truncate font-medium">{chat.title}</div>
              <div className="text-[10px] text-gray-400">
                {new Date(chat.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: language toggle + chat UI */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Language toggle */}
        <div className="w-full flex justify-end gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setUiLang("hi")}
            className={`px-3 py-1 rounded-full border text-xs ${
              uiLang === "hi"
                ? "bg-[#166534] text-white border-[#166534]"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            हिन्दी / Hinglish
          </button>
          <button
            type="button"
            onClick={() => setUiLang("en")}
            className={`px-3 py-1 rounded-full border text-xs ${
              uiLang === "en"
                ? "bg-[#166534] text-white border-[#166534]"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            English
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-md p-4 flex flex-col gap-3 overflow-y-auto">
            {messages.map((msg, idx) => {
              const msgKey = `${activeChatId}-${idx}`;

              // User bubble
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

              // Bot answer: plain text + cards (new shape)
              if (msg.type === "answer+cards") {
                return (
                  <div
                    key={msgKey}
                    className="self-start max-w-[85%] flex flex-col gap-2"
                  >
                    <div className="bg-[#E6F4EA] text-[10px] text-gray-800 rounded-2xl px-3 py-1 inline-block">
                      🤖 Panchayat Sahayika
                    </div>

                    <AnswerCard>
                      {/* Header row: speaker + copy */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500">
                          Panchayat Sahayika ka jawab
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSpeak(msgKey, msg)}
                            className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]"
                            title={
                              speakingKey === msgKey
                                ? "Bolna band karein"
                                : "Jawab सुनें"
                            }
                          >
                            {speakingKey === msgKey ? "⏹" : "🔈"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(msgKey, msg)}
                            className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]"
                            title="Copy karein"
                          >
                            📋
                          </button>
                          {copiedKey === msgKey && (
                            <span className="text-[10px] text-gray-500">
                              Copied
                            </span>
                          )}
                        </div>
                      </div>

                      {/* actual answer HTML */}
                      <div
                        className="text-xs leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                      />
                    </AnswerCard>

                    {/* cards */}
                    {msg.cards?.length > 0 && (
                      <div className="mt-1 space-y-2">
                        {msg.cards.map((c, i) => (
                          <ServiceCard
                            key={i}
                            title={c.title}
                            subtitle={c.subtitle}
                            verified={c.verified}
                            badges={c.badges}
                            applyUrl={c.apply_url}
                            readMoreUrl={c.read_more_url}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Bot answer: text + sources (old shape)
              if (msg.type === "answer") {
                return (
                  <div
                    key={msgKey}
                    className="self-start max-w-[80%] flex flex-col gap-2"
                  >
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
                            title={
                              speakingKey === msgKey
                                ? "Bolna band karein"
                                : "Jawab सुनें"
                            }
                          >
                            {speakingKey === msgKey ? "⏹" : "🔈"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(msgKey, msg)}
                            className="text-xs px-2 py-1 rounded-full bg-[#E6F4EA] hover:bg-[#D1F1DE]"
                            title="Copy karein"
                          >
                            📋
                          </button>
                          {copiedKey === msgKey && (
                            <span className="text-[10px] text-gray-500">
                              Copied
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="text-xs leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                      />

                      {msg.sources?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {msg.sources.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-[#ECFDF5] text-[10px] text-[#166534] rounded-full border border-[#BBF7D0]"
                            >
                              {s.name_hi || s.name_en}
                            </span>
                          ))}
                        </div>
                      )}
                    </AnswerCard>
                  </div>
                );
              }

              // Simple bot bubble (initial greeting)
              return (
                <div
                  key={msgKey}
                  className="self-start bg-[#E6F4EA] text-xs text-gray-800 rounded-2xl px-3 py-2 max-w-[70%]"
                >
                  <div className="font-semibold mb-1">🤖 Panchayat Sahayika</div>
                  <div>{msg.text}</div>
                </div>
              );
            })}

            {loading && (
              <div className="self-start bg-[#E6F4EA] text-[10px] text-gray-600 rounded-2xl px-3 py-1 max-w-[40%]">
                सोच रही हूँ...
              </div>
            )}
          </div>
        </div>

        {/* Input bar */}
        <div className="w-full max-w-4xl mx-auto bg-white border-t border-gray-200 px-3 py-3 rounded-t-3xl flex items-center gap-3">
          {/* 🎤 Mic button with listening state */}
          <button
            className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center text-sm"
            type="button"
            onClick={startListening}
            title="Voice input"
          >
            {listening ? "🔴" : "🎙️"}
          </button>

          <input
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-xs outline-none"
            placeholder="Type your question... / अपना सवाल यहाँ लिखें..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center text-sm disabled:opacity-60"
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            title="Send"
          >
            ➤
          </button>
        </div>

        {/* optional “listening…” text below bar */}
        {listening && (
          <div className="w-full max-w-4xl mx-auto text-[11px] text-green-700 pl-14 pb-2">
            🎙️ मैं आपकी बात सुन रही हूँ... साफ़-साफ़ बोलिए।
          </div>
        )}
      </div>
    </section>
  );
}
