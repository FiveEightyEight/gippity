import { atom } from 'nanostores';

export const accessToken = atom<string | null>(null);

export function setAccessToken(token: string) {
    accessToken.set(token);
}

export function clearAccessToken() {
    accessToken.set(null);
}

export function getAccessToken(): string | null {
    return accessToken.get();
}
