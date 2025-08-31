// src/components/PrivateChat.tsx
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Image } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useMessages } from "../hooks/useMessages";
import { usePrivateChats } from "../hooks/usePrivateChats";
import { useFileUpload } from "../hooks/useFileUpload";
import { formatTime } from "../utils/helpers";
import type { Message, PrivateChat, User } from "../types";

export default function PrivateChat() {
  const {
    state: { user, privateChatId },
    dispatch,
  } = useAppContext();

  // Get all messages for this private chat
  const { messages, sendMessage } = useMessages(undefined, privateChatId);

  // All private chats for current user
  const { privateChats } = usePrivateChats(user?.id);

  // For uploading files
  const { handleFileUpload } = useFileUpload();

  // Local UI state
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Current chat object
  const privateChat: PrivateChat | undefined = privateChats.find(
    (c) => c.id === privateChatId
  );

  // Figure out the other participant
  const otherUserId = privateChat?.participants.find((id) => id !== user?.id);

  // Check if blocked
  const isBlocked = privateChat?.blockedUsers?.includes(user?.id || "");

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a text message
  const handleSend = async () => {
    if (!input.trim() || !privateChatId) return;
    await sendMessage({
      chatRoomId: null,
      privateChatId,
      content: input.trim(),
    });
    setInput("");
  };

  // Send an image/file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !privateChatId) return;

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
        <p className="font-semibold">
          Chat with {otherUserId ?? "Unknown user"}
        </p>
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
                  isMine ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
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
