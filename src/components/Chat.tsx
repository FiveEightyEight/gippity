import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { chatId, setChatId, $selectedModel } from '../stores/chat';
import { apiFetch, apiStreamFetch } from '../utils/api';
const apiUrl = import.meta.env.PUBLIC_API_URL;
const apiVersion = import.meta.env.PUBLIC_API_VERSION;

interface Message {
    chat_id: string;
    user_id: string;
    role: string;
    content: string;
    created_at: string;
    is_edited: boolean;
    ai_model_version?: string;
}

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

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const currentChatId = useStore(chatId);
    const selectedModel = useStore($selectedModel);
    // const currentChatId = '1';

    useEffect(() => {
        if (currentChatId) {
            fetchConversation(currentChatId);
        } else {
            setMessages([]);
        }
    }, [currentChatId]);

    const fetchConversation = async (id: string) => {
        try {
            const url = new URL(`${apiUrl}${apiVersion}/conversation/${id}`)
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
                setChatId(chatId);
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
                setMessages(prevMessages => {
                    const updatedMessages = [...prevMessages];
                    const lastMessage = updatedMessages[updatedMessages.length - 1];
                    lastMessage.content = fullContent;
                    return updatedMessages;
                });
            }
            // Set the final state with the complete content
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                lastMessage.content = fullContent;
                return updatedMessages;
            });
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
            setMessages(prevMessages => [...prevMessages, newMessage, {
                chat_id: currentChatId || '',
                user_id: '',
                role: 'assistant',
                content: '',
                created_at: new Date().toISOString(),
                is_edited: false,
                ai_model_version: selectedModel
            }]);
            inputRef.current.value = '';
            sendMessage(newMessage);
        }
    };


    return (

        <div className="flex flex-col justify-between w-full">
            <article className="flex-grow overflow-y-auto px-4 py-2">
                {
                    messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                            <p className={`${msg.role === 'user'
                                ? 'bg-slate-200 border-1 border-solid border-slate-300'
                                : 'bg-green-200 border-1 border-solid border-green-300'
                                } rounded-full py-2 px-4 max-w-[70%]`}
                            >
                                {msg.content}
                            </p>
                        </div>
                    ))
                }
                {messages.length === 0 && (
                    <div className="flex justify-center items-center h-full animate-bounce">
                        <p className="text-gray-500">Ask me anything</p>
                    </div>
                )}
            </article>
            <div className="p-4 border-t border-gray-200">
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
