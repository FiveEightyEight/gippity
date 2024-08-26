import { atom } from 'nanostores';

export type ChatID = string;

export const chatId = atom<ChatID | null>(null);
