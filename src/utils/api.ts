import { getAccessToken, refreshToken } from "../stores/token";

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response | null> {
    const token = getAccessToken();
    if (!token) {
        await refreshToken();
    }
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

export async function apiStreamFetch(url: string, options: RequestInit = {}): Promise<ReadableStream | null> {
    const token = getAccessToken();
    if (!token) {
        await refreshToken();
    }
    
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
            return retryResponse.body;
        } else {
            return null;
        }
    }

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.body;
}

