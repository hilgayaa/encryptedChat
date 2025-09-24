"use client"

import { useState, useEffect, useRef } from "react"
import { MessageBubble, type Message } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { cn } from "@/lib/utils"

// Mock data for demonstration
const mockMessages: Message[] = [
  {
    id: "1",
    user: "Alice Johnson",
    text: "Hey everyone! How's the project coming along?",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    isCurrentUser: false,
  },
  {
    id: "2",
    user: "You",
    text: "Going well! Just finished the authentication module. Working on the chat UI now.",
    timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
    isCurrentUser: true,
  },
  {
    id: "3",
    user: "Bob Smith",
    text: "That's awesome! The new design looks really clean. Can't wait to see it in action.",
    timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
    isCurrentUser: false,
  },
  {
    id: "4",
    user: "You",
    text: "Thanks! I'm focusing on making it responsive and accessible. Should be ready for testing soon.",
    timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
    isCurrentUser: true,
  },
]

interface ChatWindowProps {
  className?: string
  height?: string
}

export function ChatWindow({ className, height = "h-[600px]" }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false)
        setTypingUser("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isTyping])

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      user: "You",
      text,
      timestamp: new Date(),
      isCurrentUser: true,
    }

    setMessages((prev) => [...prev, newMessage])

    // Simulate someone else typing after we send a message
    setTimeout(() => {
      setIsTyping(true)
      setTypingUser("Alice Johnson")
    }, 1000)
  }

  return (
    <div className={cn("flex flex-col bg-background border rounded-lg shadow-lg overflow-hidden", height, className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div>
          <h2 className="font-semibold text-card-foreground">Team Chat</h2>
          <p className="text-sm text-muted-foreground">3 members online</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages Container */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm">{typingUser} is typing...</span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}
