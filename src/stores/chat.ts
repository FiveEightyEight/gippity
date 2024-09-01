import { atom } from 'nanostores';
import type { Message } from '../components/types';

export type ChatID = string;

export const chatId = atom<ChatID | null>(null);

export function setChatId(id: ChatID | null) {
    chatId.set(id);
}

export function getChatId(): ChatID | null {
    return chatId.get();
}

export type SelectedModel = string;

export const $selectedModel = atom<SelectedModel | null>(null);

export function setSelectedModel(model: SelectedModel | null) {
    $selectedModel.set(model);
}

export const $messages = atom<Message[]>([]);

export function setMessages(newMessages: Message[]) {
  $messages.set(newMessages);
}

export function addMessage(...messages: Message[]) {
  $messages.set([...$messages.get(), ...messages]);
}

export function updateLastMessage(content: string) {
  const currentMessages = $messages.get();
  if (currentMessages.length > 0) {
    const updatedMessages = [...currentMessages];
    const lastMessage = updatedMessages[updatedMessages.length - 1];
    lastMessage.content = content;
    $messages.set(updatedMessages);
  }
}