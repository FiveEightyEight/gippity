import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { chatId, setChatId } from '../stores/chat';
import { apiFetch } from "../utils/api";

import Modal from './Modal';
import type { ModalProps } from './types'
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
    const [modalContent, setModalContent] = useState<ModalProps | null>(null);
    const currentChatId = useStore(chatId);

    useEffect(() => {
        fetchChatHistory();
    }, []);

    useEffect(() => {
        if (currentChatId && !chats?.find(chat => chat.id === currentChatId)) {
            fetchChatHistory();
        }
    }, [currentChatId]);

    const fetchChatHistory = async () => {
        try {
            const url = new URL(`${apiUrl}${apiVersion}/chat-history`)
            const response = await apiFetch(url.href)
            if (!response || response.status !== 200) {
                throw new Error('Failed to fetch chat history');
            }
            const data = await response.json();
            if (data && data.length > 0) {
                setChats(data);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const handleChatSelect = (selectedChatId: string) => {
        chatId.set(selectedChatId);
    };

    const deleteChat = async (chatId: string) => {
        try {
            const url = new URL(`${apiUrl}${apiVersion}/chat/${chatId}`)
            const response = await apiFetch(url.href, { method: 'DELETE' })
            if (!response || response.status !== 200) {
                throw new Error('Failed to delete chat');
            }
            setChats(chats.filter(chat => chat.id !== chatId));
            setModalContent(null);
            setChatId('');
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    }

    return (
        <>
            <div className="h-full max-w-1/3 border-r-2 border-solid border-black min-h-full shadow-inner shadow-slate-300 flex flex-col overflow-hidden">
                <div className="w-full p-4 flex justify-between items-center border-b border-gray-200">
                    <h2 className="text-sm md:text-xl font-extrabold md:font-semibold">Chat History</h2>
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
                <ul className="space-y-2 overflow-scroll flex-grow p-2">
                    {chats.map((chat) => (
                        <li
                            key={chat.id}
                            onClick={() => handleChatSelect(chat.id)}
                            className={['cursor-pointer', 'p-2', 'rounded-sm', 'flex', 'justify-between', 'items-center',
                                currentChatId === chat.id ? 'bg-gray-200' : 'hover:bg-gray-100'
                            ].join(' ')}
                        >
                            <div className="truncate overflow-hidden">
                                <span className="text-sm font-medium">{chat.title}</span>
                            </div>
                            {currentChatId === chat.id && (
                                <button
                                    onClick={(e) => setModalContent({
                                        open: true,
                                        setOpen: () => setModalContent(null),
                                        onCancel: () => setModalContent(null),
                                        onConfirm: () => deleteChat(chat.id),
                                        title: 'Delete Chat',
                                        message: 'Are you sure you want to delete this chat?',
                                        confirmText: 'Delete',
                                        cancelText: 'Cancel',
                                        variant: 'delete',
                                    })}
                                    className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded"
                                    aria-label="Delete chat"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {modalContent && <Modal {...modalContent} />}
        </>
    );
};

export default ChatHistory;
