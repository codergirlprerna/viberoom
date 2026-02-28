// src/components/Chat.jsx
import { useEffect, useRef, useState } from "react";

const globalStyles = `
  .custom-scroll::-webkit-scrollbar { width:4px; }
  .custom-scroll::-webkit-scrollbar-track { background:transparent; }
  .custom-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .msg-enter { animation:fadeIn 0.25s ease both; }
`;

function ChatMsg({ msg }) {
  return (
    <div className="msg-enter flex items-start gap-2.5 px-4 py-2 hover:bg-white/[.02] transition-colors">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black text-[#080a08] mt-0.5"
        style={{background: msg.color}}>{msg.avatar}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-[12px] font-bold" style={{color: msg.color}}>{msg.name}</span>
          <span className="text-[10px] text-[#5a6b5a]">{msg.time}</span>
        </div>
        <p className="text-[13px] text-[#f0f4f0] leading-[1.5] break-words m-0">{msg.text}</p>
      </div>
    </div>
  );
}

export default function Chat({ messages = [], onSend, currentUser }) {
  const [input,      setInput]      = useState("");
  const chatBottomRef               = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend?.(input.trim());
    setInput("");
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div className="flex flex-col h-full">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scroll py-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
              <div className="text-3xl mb-3">💬</div>
              <div className="text-sm text-[#c8d8c8]">No messages yet. Say something!</div>
            </div>
          )}
          {messages.map(msg => <ChatMsg key={msg.id} msg={msg} />)}
          <div ref={chatBottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-3 border-t border-white/[.07]">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-[#141814] border border-white/[.07] rounded-[10px] px-3 py-2 text-sm text-[#f0f4f0] outline-none placeholder:text-[#5a6b5a] focus:border-[#b8f724] focus:shadow-[0_0_0_2px_rgba(184,247,36,0.08)] transition-all"
              placeholder="Say something..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              maxLength={200}
            />
            <button onClick={handleSend} disabled={!input.trim()}
              className="px-3 py-2 bg-[#b8f724] text-[#080a08] rounded-[10px] font-cab font-black text-sm cursor-pointer hover:bg-[#d4ff4d] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
              →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
