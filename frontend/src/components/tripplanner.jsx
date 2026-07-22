import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Image as ImageIcon, Send, User, Compass, AlertTriangle, LogOut } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ------------------------------------------------------------------ */
/*  Backend contract (same as before):                                 */
/*  POST /chat  { message, history, current_itinerary }                */
/*  -> returns itinerary JSON, optionally with a short "chat_reply"     */
/*  NOTE: your current endpoint only reads `message` — see earlier      */
/*  note about updating generate_trip() to use history for edits.       */
/* ------------------------------------------------------------------ */

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

const TIME_LABELS = [
  ["morning", "Morning"],
  ["afternoon", "Afternoon"],
  ["evening", "Evening"],
  ["night", "Night"],
];

export default function TripPlanner({ initialPrompt = "" }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [initialChatId] = useState(() => `local-${nextId()}`);
  const [chats, setChats] = useState([{ id: initialChatId, title: "New chat", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(initialChatId);
  const [remoteChats, setRemoteChats] = useState([]); // chat summaries from the backend, not yet opened
  const [loadingSidebar, setLoadingSidebar] = useState(false);
  const [input, setInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const messages = activeChat?.messages || [];
  const itinerary = [...messages].reverse().find((m) => m.itinerary)?.itinerary || null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt) send(initialPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load this user's chat history whenever they're logged in.
  useEffect(() => {
    if (!isAuthenticated) {
      setRemoteChats([]);
      return;
    }
    setLoadingSidebar(true);
    api
      .get("/chats")
      .then((res) => setRemoteChats(res.data))
      .catch((err) => console.error("Failed to load chat history", err))
      .finally(() => setLoadingSidebar(false));
  }, [isAuthenticated]);

  const updateActiveChat = (updater) => {
    setChats((prev) => prev.map((c) => (c.id === activeChatId ? updater(c) : c)));
  };

  const newChat = () => {
    const id = `local-${nextId()}`;
    setChats((prev) => [{ id, title: "New chat", messages: [] }, ...prev]);
    setActiveChatId(id);
    setInput("");
  };

  // Open a chat from the sidebar. If it's only a summary (not yet loaded
  // this session), fetch the full message list from the backend first.
  const openChat = async (chatSummary) => {
    if (chats.some((c) => c.id === chatSummary.id)) {
      setActiveChatId(chatSummary.id);
      return;
    }
    try {
      const res = await api.get(`/chats/${chatSummary.id}`);
      const full = res.data;
      const withLocalIds = {
        id: full.id,
        title: full.title,
        messages: full.messages.map((m) => ({ id: nextId(), ...m })),
      };
      setChats((prev) => [withLocalIds, ...prev]);
      setActiveChatId(full.id);
    } catch (err) {
      console.error("Failed to load chat", err);
    }
  };

  // Save the given chat snapshot to the backend. Creates it on first save
  // (local- id) and swaps in the real id, or updates it on later saves.
  // Silently no-ops for guests — chat only lives in memory for them.
  const persistChat = async (chatSnapshot) => {
    if (!isAuthenticated) return;
    const payloadMessages = chatSnapshot.messages.map(({ role, text, itinerary, isError }) => ({
      role,
      text,
      itinerary,
      isError,
    }));
    try {
      if (chatSnapshot.id.startsWith("local-")) {
        const res = await api.post("/chats", { title: chatSnapshot.title, messages: payloadMessages });
        const saved = res.data;
        setChats((prev) => prev.map((c) => (c.id === chatSnapshot.id ? { ...c, id: saved.id, title: saved.title } : c)));
        setActiveChatId((cur) => (cur === chatSnapshot.id ? saved.id : cur));
        setRemoteChats((prev) => [{ id: saved.id, title: saved.title, updated_at: saved.updated_at }, ...prev]);
      } else {
        const res = await api.put(`/chats/${chatSnapshot.id}`, { title: chatSnapshot.title, messages: payloadMessages });
        setRemoteChats((prev) =>
          prev.map((rc) => (rc.id === res.data.id ? { ...rc, title: res.data.title, updated_at: res.data.updated_at } : rc))
        );
      }
    } catch (err) {
      // Non-fatal — don't interrupt the conversation if saving fails.
      console.error("Failed to save chat history", err);
    }
  };

  const send = async (text) => {
    const outgoing = (text ?? input).trim();
    if (!outgoing || loading) return;

    const chatBefore = chats.find((c) => c.id === activeChatId);
    const userMsg = { id: nextId(), role: "user", text: outgoing };
    const title =
      chatBefore.messages.length === 0
        ? outgoing.slice(0, 42) + (outgoing.length > 42 ? "…" : "")
        : chatBefore.title;
    const messagesAfterUser = [...chatBefore.messages, userMsg];

    updateActiveChat((c) => ({ ...c, title, messages: messagesAfterUser }));
    setInput("");
    setLoading(true);

    let assistantMsg;
    try {
      const res = await api.post("/chat", {
        message: outgoing,
        history: chatBefore.messages.map((m) => ({ role: m.role, content: m.text })),
        current_itinerary: itinerary,
      });
      const data = res.data;
      assistantMsg = { id: nextId(), role: "assistant", text: data.chat_reply || null, itinerary: data };
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Something went wrong reaching the planner. Please try again.";
      assistantMsg = { id: nextId(), role: "assistant", text: msg, isError: true };
    }

    const messagesAfterAssistant = [...messagesAfterUser, assistantMsg];
    updateActiveChat((c) => ({ ...c, title, messages: messagesAfterAssistant }));
    setLoading(false);

    persistChat({ id: activeChatId, title, messages: messagesAfterAssistant });
  };

  return (
    <div className="h-screen w-full flex bg-white text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeUp { animation: fadeUp 0.3s ease forwards; }
        @keyframes dotPulse { 0%,80%,100% { opacity: 0.3; transform: scale(0.85);} 40% { opacity: 1; transform: scale(1);} }
        .dot { animation: dotPulse 1.1s infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col">
        <div className="p-4">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-2.5 text-[13.5px] font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Plus size={15} /> New Chat
          </button>
        </div>

        <div className="px-4 pt-2">
          <span className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">Recent chats</span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {(() => {
            const openWithContent = chats.filter((c) => c.messages.length > 0);
            const openIds = new Set(openWithContent.map((c) => c.id));
            const remoteOnly = remoteChats.filter((rc) => !openIds.has(rc.id));
            const sidebarItems = [...openWithContent, ...remoteOnly];

            if (loadingSidebar && sidebarItems.length === 0) {
              return <p className="text-[12.5px] text-gray-400 text-center mt-6 px-3">Loading your chats…</p>;
            }

            if (sidebarItems.length === 0) {
              return (
                <div className="text-center mt-6 px-3">
                  <p className="text-[12.5px] text-gray-400 leading-relaxed">
                    No chat history yet. Start a conversation to see it here!
                  </p>
                  {!isAuthenticated && (
                    <p className="text-[11.5px] text-gray-400 mt-2 leading-relaxed">
                      <button onClick={() => navigate("/login")} className="text-blue-600 hover:text-blue-700 font-medium">
                        Log in
                      </button>{" "}
                      to save your chats across sessions.
                    </p>
                  )}
                </div>
              );
            }

            return (
              <div className="space-y-1">
                {sidebarItems.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openChat(c)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] truncate transition-colors ${c.id === activeChatId ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="p-3 border-t border-gray-100">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[12px] font-semibold">
                {user.name?.[0]?.toUpperCase() || <User size={13} />}
              </span>
              <span className="flex-1 text-[13px] font-medium text-gray-700 truncate">{user.name}</span>
              <button
                onClick={logout}
                aria-label="Log out"
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-full flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-3.5 text-[13.5px] font-medium transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <User size={13} />
              </span>
              Log in
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-gray-100 shrink-0">
          <span className="text-[16px] font-bold tracking-tight">TripGen<span className="font-normal">AI</span></span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.length === 0 && !loading && (
              <div className="text-center pt-20">
                <Compass size={26} className="text-gray-300 mx-auto mb-3" />
                <p className="text-[14px] text-gray-400">Tell me about your trip to get started.</p>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {loading && (
              <div className="flex justify-start animate-fadeUp">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="dot w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: "0s" }} />
                  <span className="dot w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: "0.2s" }} />
                  <span className="dot w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input dock */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.05)] p-3.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Type your travel needs here…"
              rows={1}
              className="w-full resize-none outline-none text-[14px] text-gray-800 placeholder:text-gray-400 leading-relaxed max-h-32"
            />
            <div className="flex items-center justify-between mt-1">
              <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Attach image">
                <ImageIcon size={18} />
              </button>
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="text-gray-400 disabled:text-gray-300 hover:text-blue-600 transition-colors"
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end animate-fadeUp">
        <div className="max-w-[80%] bg-blue-600 text-white text-[14px] leading-relaxed rounded-2xl rounded-tr-sm px-4 py-2.5">
          {message.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start animate-fadeUp">
      <div
        className={`max-w-[85%] text-[14px] leading-relaxed rounded-2xl rounded-tl-sm px-4 py-3.5 ${message.isError ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-100 text-gray-800"
          }`}
      >
        {message.isError && <AlertTriangle size={13} className="inline mr-1.5 -mt-0.5" />}
        {message.itinerary ? <ItineraryText itinerary={message.itinerary} note={message.text} /> : message.text}
      </div>
    </div>
  );
}

function ItineraryText({ itinerary, note }) {
  const s = itinerary.trip_summary || {};
  const budget = itinerary.estimated_budget || {};
  const days = itinerary.daily_itinerary || [];

  return (
    <div className="space-y-4">
      {note && <p>{note}</p>}

      {s.destination && (
        <p>
          <span className="font-semibold">{s.duration || "Trip"} to {s.destination}</span>
          {s.budget ? ` — ${s.budget}` : ""}{s.travel_style ? `, ${s.travel_style}` : ""}.
        </p>
      )}

      {days.map((d, i) => (
        <div key={d.day ?? i}>
          <p className="font-semibold text-gray-900">Day {d.day ?? i + 1}: {d.title}</p>
          {TIME_LABELS.map(([key, label]) => {
            const items = d[key];
            if (!items || items.length === 0) return null;
            return (
              <p key={key} className="mt-1">
                <span className="font-semibold">{label}:</span> {items.join(". ")}.
              </p>
            );
          })}
          {d.estimated_cost && <p className="text-gray-500 text-[13px] mt-1">Estimated cost: {d.estimated_cost}</p>}
        </div>
      ))}

      {budget.total_estimated && (
        <p>
          <span className="font-semibold">Total estimated budget:</span> {budget.total_estimated}
        </p>
      )}

      {itinerary.hotel_recommendations?.length > 0 && (
        <p>
          <span className="font-semibold">Hotels:</span>{" "}
          {itinerary.hotel_recommendations.map((h) => `${h.name} (${h.price_range})`).join(", ")}
        </p>
      )}

      {itinerary.travel_tips?.length > 0 && (
        <p>
          <span className="font-semibold">Tips:</span> {itinerary.travel_tips.join(" ")}
        </p>
      )}
    </div>
  );
}