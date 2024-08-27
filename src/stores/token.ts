import { atom } from 'nanostores';
const apiUrl = import.meta.env.PUBLIC_API_URL;

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

export async function refreshToken(): Promise<boolean> {
    try {
        const response = await fetch(`${apiUrl}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            if (data.accessToken) {
                setAccessToken(data.accessToken);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
}
