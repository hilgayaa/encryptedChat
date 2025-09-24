import { cn } from "@/lib/utils"

export interface Message {
  id: string
  user: string
  text: string
  timestamp: Date
  isCurrentUser: boolean
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-[80%] sm:max-w-[70%]",
        message.isCurrentUser ? "items-end ml-auto" : "items-start mr-auto",
      )}
    >
      {/* Username */}
      <div
        className={cn(
          "text-xs font-medium text-muted-foreground px-3",
          message.isCurrentUser ? "text-right" : "text-left",
        )}
      >
        {message.user}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md",
          message.isCurrentUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card text-card-foreground border rounded-bl-md",
        )}
      >
        <p className="text-sm leading-relaxed break-words">{message.text}</p>
      </div>

      {/* Timestamp */}
      <div className={cn("text-xs text-muted-foreground px-3", message.isCurrentUser ? "text-right" : "text-left")}>
        {formatTime(message.timestamp)}
      </div>
    </div>
  )
}
