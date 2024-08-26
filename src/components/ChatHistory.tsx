import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { chatId } from '../stores/chat';

interface Chat {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    last_updated: string;
    is_archived: boolean;
}

const ChatHistory: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const currentChatId = useStore(chatId);

    useEffect(() => {
        fetchChatHistory();
    }, []);

    const fetchChatHistory = async () => {
        try {
            const response = await fetch('http://localhost:8080/chat-history', {
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
        <div className="max-w-1/3 overflow-y-auto">
            <ul className="space-y-2">
                {chats.map((chat) => (
                    <li 
                        key={chat.id}
                        onClick={() => handleChatSelect(chat.id)}
                        className={`cursor-pointer p-2 rounded-lg ${
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
