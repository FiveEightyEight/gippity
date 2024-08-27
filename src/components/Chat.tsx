import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { chatId } from '../stores/chat';

interface Message {
    chat_id: string;
    user_id: string;
    role: string;
    content: string;
    created_at: string;
    is_edited: boolean;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
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
    ]);
    const inputRef = useRef<HTMLInputElement>(null);
    // const currentChatId = useStore(chatId || '1');
    const currentChatId = '1';

    useEffect(() => {
        if (currentChatId) {
            fetchConversation(currentChatId);
        } else {
            setMessages([]);
        }
    }, [currentChatId]);

    const fetchConversation = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:8080/conversation/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch conversation');
            }
            const data = await response.json();
            const filteredMessages = data.filter((msg: Message) => msg.role !== 'system');
            setMessages(filteredMessages);
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (inputRef.current && inputRef.current.value.trim() !== '') {
            const newMessage: Message = {
                chat_id: currentChatId,
                user_id: 'user1',
                role: 'user',
                content: inputRef.current.value,
                created_at: new Date().toISOString(),
                is_edited: false
            };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            inputRef.current.value = '';
            // sendMessage(newMessage);
        }
    };
    

    return (
        <div className="h-full grid grid-rows-12">
            <div
                className="row-span-1 flex justify-center items-center w-full p-2 border-b-2 border-solid border-black bg-slate-700 shadow-lg"
            >
                <h1 className="text-2xl font-bold text-cyan-200">Gippity</h1>
            </div>

            <div className="row-span-11 flex flex-col justify-between w-full">
                <article className="flex-grow overflow-y-auto px-4 py-2">
                    {currentChatId ? (
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
                    ) : (
                        <p>Select or start a new chat to begin.</p>
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
        </div>

    );
};

export default Chat;
