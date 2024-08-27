import { getAccessToken, refreshToken } from "../stores/token";

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response | null> {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${getAccessToken()}`,
        },
    });

    if (response.status === 401) {
        const success = await refreshToken();
        if (success) {
            const retryResponse = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            });
            return retryResponse;
        } else {
            return null;
        }
    }

    return response;
}