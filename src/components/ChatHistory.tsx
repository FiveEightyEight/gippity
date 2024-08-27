import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { chatId } from '../stores/chat';
const apiUrl = import.meta.env.PUBLIC_API_URL;

interface Chat {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    last_updated: string;
    is_archived: boolean;
}

const ChatHistory: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([
        {
            id: '1',
            user_id: 'user1',
            title: 'React Hooks Discussion',
            created_at: '2023-04-20T10:00:00Z',
            last_updated: '2023-04-20T11:30:00Z',
            is_archived: false
        },
        {
            id: '2',
            user_id: 'user1',
            title: 'TypeScript Best Practices',
            created_at: '2023-04-21T14:00:00Z',
            last_updated: '2023-04-21T15:45:00Z',
            is_archived: false
        },
        {
            id: '3',
            user_id: 'user1',
            title: 'Astro Framework Introduction',
            created_at: '2023-04-22T09:00:00Z',
            last_updated: '2023-04-22T10:30:00Z',
            is_archived: false
        }
    ]);
    const currentChatId = useStore(chatId);

    useEffect(() => {
        // fetchChatHistory();
    }, []);

    const fetchChatHistory = async () => {
        try {
            const response = await fetch(`${apiUrl}/chat-history`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch chat history');
            }
            const data = await response.json();
            setChats(data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const handleChatSelect = (selectedChatId: string) => {
        chatId.set(selectedChatId);
    };

    return (
        <div className="max-w-1/3 overflow-y-auto border-r-2 border-solid border-black min-h-full shadow-inner shadow-slate-300">
            <ul className="space-y-2">
                {chats.map((chat) => (
                    <li 
                        key={chat.id}
                        onClick={() => handleChatSelect(chat.id)}
                        className={`cursor-pointer p-2 rounded-sm ${
                            currentChatId === chat.id ? 'bg-gray-200' : 'hover:bg-gray-100'
                        }`}
                    >
                        <div className="truncate overflow-hidden">
                            <span className="text-sm font-medium">{chat.title}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChatHistory;
