// src/components/PrivateChat.tsx
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Image } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useMessages } from "../hooks/useMessages";
import { usePrivateChats } from "../hooks/usePrivateChats";
import { useFileUpload } from "../hooks/useFileUpload";
import { usePresence } from "../hooks/usePresence";
import { useReports } from "../hooks/useReports";
import { formatTime, playNotificationSound } from "../utils/helpers";
import type { Message, PrivateChat, User } from "../types";
import { supabase } from "../lib/supabase";

export default function PrivateChat() {
  const {
    state: { user, privateChatId, chatPartners },
    dispatch,
  } = useAppContext();

  const { messages, sendMessage } = useMessages(undefined, privateChatId);
  const { privateChats } = usePrivateChats(user?.id);
  const { handleFileUpload } = useFileUpload();
  const { presence } = usePresence(user);
  const { reports } = useReports(user?.id);

  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const privateChat = privateChats.find((c) => c.id === privateChatId);
  const otherUserId = privateChat?.participants.find((id) => id !== user?.id);
  const otherUser: User | undefined =
    presence[otherUserId ?? ""] ||
    chatPartners[otherUserId ?? ""] ||
    undefined;

  const isBlocked = privateChat?.blockedUsers?.includes(user?.id || "");

  useEffect(() => {
    if (messages.length > 0) {
      playNotificationSound();
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !privateChatId) return;
    await sendMessage({
      chatRoomId: null,
      privateChatId,
      content: input.trim(),
    });
    setInput("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !privateChatId) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    const url = await handleFileUpload(file);
    if (url) {
      await sendMessage({
        chatRoomId: null,
        privateChatId,
        content: "",
        file_url: url,
      });
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        <button
          onClick={() => dispatch({ type: "SET_PRIVATE_CHAT", payload: null })}
        >
          <ArrowLeft />
        </button>
        {otherUser ? (
          <div>
            <p className="font-semibold">{otherUser.name}</p>
            <p className="text-xs text-gray-500">
              {presence[otherUser.id] ? "Online" : "Offline"}
            </p>
          </div>
        ) : (
          <p className="font-semibold">Unknown user</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m: Message) => {
          const isMine = m.sender_id === user?.id;
          return (
            <div
              key={m.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-2 rounded-lg ${
                  isMine
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {m.content && <p>{m.content}</p>}
                {m.file_url && (
                  <img
                    src={m.file_url}
                    alt="uploaded"
                    className="mt-1 max-h-48 rounded"
                  />
                )}
                <p className="text-[10px] text-gray-500 mt-1 text-right">
                  {formatTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isBlocked ? (
        <div className="p-3 text-center text-sm text-red-500 border-t">
          You are blocked in this chat.
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 border-t">
          <input
            type="text"
            className="flex-1 border rounded p-2"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <button onClick={() => fileInputRef.current?.click()}>
            <Image />
          </button>
          <button onClick={handleSend} disabled={uploading}>
            <Send />
          </button>
        </div>
      )}
    </div>
  );
}
