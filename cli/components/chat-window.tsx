"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import { useSocket } from "@/hooks/useSocket"
import { Chat,Message } from "@/app/chats/page"

interface ChatWindowProps {
  chat: Chat | null
  messages: Message[]
  onBack: () => void
  showBackButton: boolean
}

export function ChatWindow({ chat, messages, onBack, showBackButton }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const socket = useSocket();
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, you'd send the message here
                const messageData = {
                chatId: chat?.id,
                content: newMessage,
                type: 'TEXT'
            };
      socket?.emit('send_message',messageData);
      setNewMessage("")
    }
  }



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!chat) {
    return (
      <div className="h-full bg-card flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-card-foreground mb-2">Select a chat to start messaging</h2>
          <p className="text-muted-foreground">Choose a conversation from the sidebar to begin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}

        <Avatar className="w-10 h-10">
          <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {chat.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="font-semibold text-card-foreground">{chat.name}</h2>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Message"
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm" className="px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
