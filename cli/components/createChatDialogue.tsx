"use client"
import React, { useState, useCallback, useEffect } from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Users, MessageCircle } from "lucide-react"
import api from "@/lib/fetcher"
import { useAuth } from "@/hooks/useAuth"

type User = {
    id: string
    name: string
    username: string
    photoUrl?: string
    isActive: boolean
    lastSeen: string
}

interface CreateChatDialogProps {
    onChatCreated?: (chatId: string) => void
    onClose?: () => void
}

function CreateChatDialog({ onChatCreated, onClose }: CreateChatDialogProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { token, user } = useAuth();

    // Debounced search function
    const debounceTimeout = React.useRef<NodeJS.Timeout>()

    const handleSearchUser = useCallback(async (value: string) => {
        setSearchTerm(value)
        setError(null)

        // Clear previous timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        if (!value.trim()) {
            setSearchResults([])
            return
        }

        // Debounce the search
        debounceTimeout.current = setTimeout(async () => {
            try {
                setLoading(true)
                const res = await api.get(`/api/users/search?query=${encodeURIComponent(value.trim())}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setSearchResults(res.data?.users || res.data || [])
            } catch (err: any) {
                console.error("User search failed", err)
                setError(err.response?.data?.message || "Failed to search users")
                setSearchResults([])
            } finally {
                setLoading(false)
            }
        }, 300) // 300ms debounce
    }, [])

    // Start chat with user
    const handleStartChat = async (userId: string, userName: string) => {
        if (creating) return

        try {
            setCreating(true)
            setError(null)

            const res = await api.post(
                "/api/chats",
                {
                    participantIds: [user.id, userId],
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            const chatId = res.data?.chatId || res.data?.id

            // Success feedback
            if (onChatCreated && chatId) {
                onChatCreated(chatId)
            }

            // Close dialog and reset state
            setIsOpen(false)
            resetDialog()

            // Optional: Show success message

        } catch (err: any) {
            console.error("Error creating chat", err)
            setError(err.response?.data?.message || "Failed to create chat")
        } finally {
            setCreating(false)
        }
    }

    // Handle new group creation (placeholder)
    const handleNewGroup = () => {
        // TODO: Implement group creation functionality
        console.log("Group creation not implemented yet")
        setError("Group creation feature coming soon!")
    }

    // Reset dialog state
    const resetDialog = () => {
        setSearchTerm("")
        setSearchResults([])
        setError(null)
        setLoading(false)
        setCreating(false)
    }

    // Handle dialog close
    const handleDialogClose = () => {
        setIsOpen(false)
        resetDialog()
        onClose?.()
    }

    // Format last seen time
    const formatLastSeen = (lastSeen: string) => {
        const date = new Date(lastSeen)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / (1000 * 60))

        if (minutes < 1) return "Just now"
        if (minutes < 60) return `${minutes}m ago`
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
        return `${Math.floor(minutes / 1440)}d ago`
    }

    // Get user initials for avatar fallback
    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
            }
        }
    }, [])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Create Chat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        New Chat
                    </DialogTitle>
                </DialogHeader>

                {/* Error message */}
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                {/* Search box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search users by name or username..."
                        value={searchTerm}
                        onChange={(e) => handleSearchUser(e.target.value)}
                        className="pl-10"
                        disabled={creating}
                    />
                </div>

                {/* New Group button */}
                <Button
                    variant="secondary"
                    className="mt-2 w-full gap-2"
                    onClick={handleNewGroup}
                    disabled={creating}
                >
                    <Users className="h-4 w-4" />
                    New Group
                </Button>

                {/* Search results */}
                <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                    {loading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Searching...</span>
                        </div>
                    )}

                    {!loading && searchResults.length === 0 && searchTerm && !error && (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500">No users found</p>
                            <p className="text-xs text-gray-400 mt-1">Try searching with a different term</p>
                        </div>
                    )}

                    {!loading && searchTerm && searchResults.length > 0 && (
                        <div className="text-xs text-gray-500 mb-2">
                            Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                        </div>
                    )}

                    {searchResults.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => !creating && handleStartChat(user.id, user.name)}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.photoUrl} alt={user.name} />
                                        <AvatarFallback className="text-xs">
                                            {getUserInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.isActive && (
                                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                    {!user.isActive && (
                                        <p className="text-xs text-gray-400">
                                            Last seen {formatLastSeen(user.lastSeen)}
                                        </p>
                                    )}
                                </div>
                                {user.isActive && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                        Online
                                    </Badge>
                                )}
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={creating}
                                className="ml-2 shrink-0"
                            >
                                {creating ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    "Chat"
                                )}
                            </Button>
                        </div>
                    ))}
                </div>

                <DialogFooter className="sm:justify-start mt-4">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleDialogClose}
                            disabled={creating}
                        >
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateChatDialog