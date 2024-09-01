import { atom } from 'nanostores';
const apiUrl = import.meta.env.PUBLIC_API_URL;

export const $accessToken = atom<string | null>(null);

export function setAccessToken(token: string) {
    $accessToken.set(token);
}

export function clearAccessToken() {
    $accessToken.set(null);
}

export function getAccessToken(): string | null {
    return $accessToken.get();
}

let refreshTokenPromise = null;
export async function refreshToken(): Promise<boolean> {
    if (!refreshTokenPromise) {
        refreshTokenPromise = (async () => {
            try {
                const response = await fetch(`${apiUrl}/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Failed to refresh token');
                }
                const data = await response.json();
                if (data.t) {
                    setAccessToken(data.t);
                    return true;
                } else {
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Error refreshing token:', error);
                throw error;
            } finally {
                refreshTokenPromise = null; // Reset the promise after it's resolved
            }
        })();
    }

    return refreshTokenPromise;
}
