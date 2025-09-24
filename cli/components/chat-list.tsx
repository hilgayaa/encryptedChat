"use client"

import { Chat } from "@/app/chats/page"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import api from "@/lib/fetcher"
import { useState } from "react"

interface ChatListProps {
  chats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chat: Chat) => void
}

interface createChatProps{
  title?: string,
  participantIds:string[] 
  isGroup:boolean 
}



export function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  const [createChat,setcreateChat] = useState<createChatProps>();
  async function handleCreateChat(){
      const res = await api.post("api/chats",createChat);      
  }
  return (
    <div className="h-full bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-card-foreground">Messages</h1>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`w-full p-4 text-left hover:bg-muted/50 transition-colors border-b border-border/50 ${
              selectedChat?.id === chat.id ? "bg-muted" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {chat.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-card-foreground truncate">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{chat.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={handleCreateChat}>
        AddChat
      </button>
    </div>
  )
}
