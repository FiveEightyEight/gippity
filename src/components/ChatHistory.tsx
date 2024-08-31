import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { chatId, setChatId } from '../stores/chat';
import { apiFetch } from "../utils/api";
const apiUrl = import.meta.env.PUBLIC_API_URL;
const apiVersion = import.meta.env.PUBLIC_API_VERSION;

interface Chat {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    last_updated: string;
    is_archived: boolean;
}

const mockChatHistory: Chat[] = [
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
]

const ChatHistory: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const currentChatId = useStore(chatId);

    useEffect(() => {
        fetchChatHistory();
    }, []);

    const fetchChatHistory = async () => {
        try {
            const url = new URL(`${apiUrl}${apiVersion}/chat-history`)
            const response = await apiFetch(url.href)
            if (!response || response.status !== 200) {
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
            <div className="w-full p-4 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-xl font-semibold">Chat History</h2>
                <button
                    onClick={() => setChatId('')}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    aria-label="New Chat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            </div>
            <ul className="space-y-2">
                {chats.map((chat) => (
                    <li
                        key={chat.id}
                        onClick={() => handleChatSelect(chat.id)}
                        className={`cursor-pointer p-2 rounded-sm ${currentChatId === chat.id ? 'bg-gray-200' : 'hover:bg-gray-100'
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
