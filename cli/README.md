# Modern Chat UI Component

A professional, reusable chat interface built with Next.js, TypeScript, and TailwindCSS. This component is designed to be easily integrated with any backend service.

## Features

- 🎨 **Modern Design**: Clean, professional interface inspired by Discord and Slack
- 📱 **Responsive**: Mobile-first design that works on all screen sizes
- 🌙 **Theme Support**: Compatible with light and dark modes
- ⚡ **Smooth Animations**: Typing indicators and message transitions
- 🔧 **Modular**: Easy to customize and extend
- 🎯 **TypeScript**: Full type safety and IntelliSense support
- ♿ **Accessible**: Screen reader friendly with proper ARIA labels

## Components

### `ChatWindow.tsx`
Main chat container that manages the overall chat interface:
- Message list with auto-scroll
- Chat header with online status
- Integration point for MessageInput and MessageBubble components

### `MessageBubble.tsx`
Individual message display component:
- User/current user message alignment
- Timestamp formatting
- Responsive bubble design
- Username display

### `MessageInput.tsx`
Message composition interface:
- Send button with icon
- Enter key support
- Input validation
- Disabled state handling

## Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

2. **Run Development Server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

3. **View the Component**
   Open [http://localhost:3000](http://localhost:3000) to see the chat UI in action.

## Usage

### Basic Implementation

\`\`\`tsx
import { ChatWindow } from "@/components/ChatWindow"

export default function MyPage() {
  return (
    <div className="container mx-auto p-4">
      <ChatWindow height="h-[500px]" />
    </div>
  )
}
\`\`\`

### Custom Message Handling

\`\`\`tsx
import { MessageBubble, type Message } from "@/components/MessageBubble"
import { MessageInput } from "@/components/MessageInput"

const [messages, setMessages] = useState<Message[]>([])

const handleSendMessage = (text: string) => {
  const newMessage: Message = {
    id: Date.now().toString(),
    user: "Current User",
    text,
    timestamp: new Date(),
    isCurrentUser: true
  }
  setMessages(prev => [...prev, newMessage])
}
\`\`\`

## Backend Integration

The component is designed for easy backend integration:

### WebSocket Integration
Replace the mock `handleSendMessage` function with WebSocket calls:

\`\`\`tsx
const handleSendMessage = (text: string) => {
  // Send to WebSocket
  websocket.send(JSON.stringify({
    type: 'message',
    text,
    user: currentUser.name
  }))
}

// Listen for incoming messages
websocket.onmessage = (event) => {
  const data = JSON.parse(event.data)
  setMessages(prev => [...prev, data])
}
\`\`\`

### REST API Integration
For REST-based chat systems:

\`\`\`tsx
const handleSendMessage = async (text: string) => {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, userId: currentUser.id })
    })
    
    if (response.ok) {
      const newMessage = await response.json()
      setMessages(prev => [...prev, newMessage])
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}
\`\`\`

## Customization

### Styling
The component uses semantic design tokens from `globals.css`. Customize colors by updating the CSS variables:

\`\`\`css
:root {
  --primary: /* Your brand color */
  --card: /* Message bubble background */
  --muted: /* Input background */
}
\`\`\`

### Message Types
Extend the `Message` interface to support additional features:

\`\`\`tsx
interface Message {
  id: string
  user: string
  text: string
  timestamp: Date
  isCurrentUser: boolean
  // Add custom fields
  avatar?: string
  messageType?: 'text' | 'image' | 'file'
  reactions?: Reaction[]
}
\`\`\`

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Shadcn/ui** - UI component library

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use in your projects!
