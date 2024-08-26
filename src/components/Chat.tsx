import React, { useState, useEffect } from 'react';
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
    const [messages, setMessages] = useState<Message[]>([]);
    const currentChatId = useStore(chatId);

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

    return (
        <div className="flex justify-center">
            <article className="flex flex-col gap-2 w-1/2">
                {currentChatId ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <p className={`${
                                msg.role === 'user' 
                                    ? 'bg-slate-200 border-1 border-solid border-slate-300' 
                                    : 'bg-green-200 border-1 border-solid border-green-300'
                                } rounded-full py-2 px-4`}
                            >
                                {msg.content}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Select or start a new chat to begin.</p>
                )}
            </article>
        </div>
    );
};

export default Chat;
