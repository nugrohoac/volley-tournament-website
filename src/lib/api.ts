const API_URL_PUBLIC = process.env.API_URL_PUBLIC

export async function apiFetch<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL_PUBLIC}${path}`)

    if (!response.ok) {
        throw new Error(
            `API Error: ${response.status}`

        )
    }

    return await response.json() as Promise<T>;
}
