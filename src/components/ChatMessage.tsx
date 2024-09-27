import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { cn } from "../utils/";

import type { Message } from "./types";

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    if (message.role === 'user') {
        return (
            <div className={cn('flex mb-2', 'justify-end')}>
                <p className={cn('bg-slate-200 border-1 border-solid border-slate-300',
                    'rounded-full py-2 px-4 max-w-[70%]'
                )}>
                    {message.content}
                </p>
            </div>
        )
    }
    return (
        <div className={cn('flex flex-col mb-2 justify-start')}>
            <MarkdownRenderer markdown={message.content} />
        </div>

    )
};

export default ChatMessage;
