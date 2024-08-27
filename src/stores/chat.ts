import { atom } from 'nanostores';

export type ChatID = string;

export const chatId = atom<ChatID | null>(null);

export function setChatId(id: ChatID | null) {
    chatId.set(id);
}

export function getChatId(): ChatID | null {
    return chatId.get();
}
