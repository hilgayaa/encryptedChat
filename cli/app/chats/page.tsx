"use client";

import { useEffect, useState } from "react";
import { ChatList } from "@/components/chat-list";
import { ChatWindow } from "@/components/chat-window";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/fetcher";
import { useSocket } from "@/hooks/useSocket";
import CreateChatDialog from "@/components/createChatDialogue";
import { useRouter } from "next/navigation";
export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export default function ChatPage() {
  const { token, user } = useAuth();
  const socket = useSocket();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const router = useRouter();
  // 🟢 Fetch chats
  const fetchChats = async () => {
    if (!user || !token) {
      router.replace("/login")
    };

    setLoading(true);
    try {
      const res = await api.get("/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(user);
      console.log(token)
      const mapped = res.data.map((chat: any) => ({
        id: chat.id,
        name: chat.participants
          .filter((p: any) => p.id !== user.id)
          .map((p: any) => p.name)
          .join(", "),
        lastMessage: chat.messages[0]?.content || "No messages yet",
        timestamp: chat.messages[0]?.createdAt
          ? new Date(chat.messages[0].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        avatar: chat.participants.find((p: any) => p.id !== user.id)?.photoUrl || "/default-avatar.png",
      }));

      setChats(mapped);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle chat creation
  const handleChatCreated = async (chatId: string) => {
    try {
      // Refresh the chat list to include the new chat
      await fetchChats();
      
      // Find the newly created chat in the updated list
      const newChat = chats.find(chat => chat.id === chatId);
      if (newChat) {
        setSelectedChat(newChat);
      } else {
        // If not found immediately, fetch chats again and then select
        const res = await api.get("/api/chats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const mapped = res.data.map((chat: any) => ({
          id: chat.id,
          name: chat.participants
            .filter((p: any) => p.id !== user.id)
            .map((p: any) => p.name)
            .join(", "),
          lastMessage: chat.messages[0]?.content || "No messages yet",
          timestamp: chat.messages[0]?.createdAt
            ? new Date(chat.messages[0].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
          avatar: chat.participants.find((p: any) => p.id !== user.id)?.photoUrl || "/default-avatar.png",
        }));

        setChats(mapped);
        const foundChat = mapped.find((chat: Chat) => chat.id === chatId);
        if (foundChat) {
          setSelectedChat(foundChat);
        }
      }
    } catch (err) {
      console.error("Error handling chat creation:", err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user, token]);

  // 🟢 Socket events
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (msg: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          content: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwn: msg.sender.id === user.id,
        },
      ]);
    };

    const handleUserTyping = (data: any) => setTypingUser(data.username);
    const handleUserStopTyping = () => setTypingUser(null);

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [socket, user]);

  // 🟢 Fetch messages for selected chat
  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    if (!chat || !token) return;

    try {
      const res = await api.get(`/api/chats/${chat.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedMessages: Message[] = res.data
        .reverse()
        .map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwn: msg.sender.id === user.id,
        }));

      setMessages(mappedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Desktop */}
      <div className="hidden md:flex w-full">
        <div className="w-1/3 border-r border-border">
          {loading ? (
            <p className="p-4">Loading chats...</p>
          ) : (
            <>
              <CreateChatDialog onChatCreated={handleChatCreated} />
              <ChatList chats={chats} selectedChat={selectedChat} onSelectChat={handleSelectChat} />
            </>
          )}
        </div>
        <div className="w-2/3">
          <ChatWindow 
            chat={selectedChat} 
            messages={messages} 
            onBack={() => setSelectedChat(null)} 
            showBackButton={false} 
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden w-full">
        {selectedChat ? (
          <ChatWindow 
            chat={selectedChat} 
            messages={messages} 
            onBack={() => setSelectedChat(null)} 
            showBackButton={true} 
          />
        ) : loading ? (
          <p className="p-4">Loading chats...</p>
        ) : (
          <>
            <CreateChatDialog onChatCreated={handleChatCreated} />
            <ChatList chats={chats} selectedChat={selectedChat} onSelectChat={handleSelectChat} />
          </>
        )}
      </div>
    </div>
  );
}