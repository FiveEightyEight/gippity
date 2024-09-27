import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import ChatMessage from './ChatMessage';
import ModelSelector from './ModelSelector';
import { chatId, setChatId, $selectedModel, $messages, setMessages, addMessage, updateLastMessage } from '../stores/chat';
import { apiFetch, apiStreamFetch } from '../utils/api';
import type { Message, Model } from './types';
const apiUrl = import.meta.env.PUBLIC_API_URL;
const apiVersion = import.meta.env.PUBLIC_API_VERSION;

const mockMessages: Message[] = [
    {
        chat_id: '1',
        user_id: 'user1',
        role: 'user',
        content: "Hello, how are you?",
        created_at: '2023-04-20T10:00:00Z',
        is_edited: false
    },
    {
        chat_id: '1',
        user_id: 'assistant',
        role: 'assistant',
        content: "Hello! I'm doing well, thank you for asking. How can I assist you today?",
        created_at: '2023-04-20T10:01:00Z',
        is_edited: false
    },
    {
        chat_id: '1',
        user_id: 'user1',
        role: 'user',
        content: "I have a question about React hooks.",
        created_at: '2023-04-20T10:02:00Z',
        is_edited: false
    },
    {
        chat_id: '1',
        user_id: 'assistant',
        role: 'assistant',
        content: "Certainly! I'd be happy to help you with any questions you have about React hooks. What specifically would you like to know?",
        created_at: '2023-04-20T10:03:00Z',
        is_edited: false
    }
]

type ChatProps = {
    models: Model[];
}

const Chat: React.FC<ChatProps> = ({ models }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const currentChatId = useStore(chatId);
    const selectedModel = useStore($selectedModel);
    const messages: Message[] = useStore($messages);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const paramsProxy = new Proxy(params, {
            get: (searchParams, prop: string) => searchParams.get(prop),
        });
        const chatId = paramsProxy && paramsProxy['chat'];
        if (chatId) {
            setChatId(chatId);
        } else {
            setChatId('');
        }
    }, [location.search])

    useEffect(() => {
        if (currentChatId) {
            fetchConversation(currentChatId);
        } else {
            setMessages([]);
        }
    }, [currentChatId]);

    const fetchConversation = async (id: string) => {
        try {
            const url = new URL(`${apiUrl}${apiVersion}/chat?id=${id}`)
            const response = await apiFetch(url.href);
            if (!response || response.status !== 200) {
                throw new Error('Failed to fetch conversation');
            }
            const data = await response.json();
            const filteredMessages = data.filter((msg: Message) => msg.role !== 'system');
            setMessages(filteredMessages);
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const getChatIdFromHeaders = (headers: Headers) => {
        try {
            const chatId = headers.get('x-chat-id');
            if (chatId && chatId !== currentChatId) {
                // window.history.pushState({}, '', `/home?chat=${chatId}`);
                // using history.pushState would be better to not reload the page.
                // but reloading calls the chat-history endpoint
                navigate(`/home?chat=${chatId}`);
            }
        } catch (error) {
            console.error('Error getting chat ID from headers:', error);
        }
    }

    const sendMessage = async (message: Message) => {
        try {
            const url = new URL(`${apiUrl}${apiVersion}/conversation`)
            const response = await apiStreamFetch(url.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message)
            })
            if (!response) {
                throw new Error('Failed to send message');
            }
            const stream = response.body as ReadableStream;
            const reader = stream.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;
            let fullContent = '';
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                fullContent += chunkValue;
                updateLastMessage(fullContent);
            }
            // Set the final state with the complete content
            updateLastMessage(fullContent);
            // Update the chat ID after processing the stream
            getChatIdFromHeaders(response.headers);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (inputRef.current && inputRef.current.value.trim() !== '') {
            const sanitizedMessage = inputRef.current.value.trim();
            const newMessage: Message = {
                chat_id: currentChatId || '',
                user_id: '',
                role: 'user',
                content: sanitizedMessage,
                created_at: new Date().toISOString(),
                is_edited: false,
                ai_model_version: selectedModel
            };
            addMessage(newMessage, {
                chat_id: currentChatId || '',
                user_id: '',
                role: 'assistant',
                content: '',
                created_at: new Date().toISOString(),
                is_edited: false,
                ai_model_version: selectedModel
            });
            inputRef.current.value = '';
            sendMessage(newMessage);
        }
    };

    // <div className="h-full flex flex-col justify-between">
    return (



        <div className="flex flex-col justify-between w-full h-screen">
            {/* header */}
            <div
                className="row-span-1 grid grid-rows-2  w-full p-2 border-b-2 border-solid border-black bg-slate-700 shadow-lg"
            >
                <div className="flex justify-center">
                    <h1 className="text-2xl font-bold text-cyan-200">Gippity</h1>
                </div>
                <div className="flex justify-center">
                    <ModelSelector models={models} />
                </div>
            </div>

            {/* chat */}
            <article className="flex-grow overflow-y-auto">
                <div className=" px-4 py-2 md:max-w-3xl md:mx-auto">
                    {
                        messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} />
                        ))
                    }
                </div>

                {messages.length === 0 && (
                    <div className="flex justify-center items-center h-full animate-bounce">
                        <p className="text-gray-500">Ask me anything</p>
                    </div>
                )}
            </article>
            {/* bottom input */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSubmit} className="flex items-center">
                    <input
                        type="text"
                        ref={inputRef}
                        placeholder="Type your message..."
                        className="flex-grow p-2 border rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded-r-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>

        </div>
    );
};

export default Chat;
