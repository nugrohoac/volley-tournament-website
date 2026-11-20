import type {
    Tournament,
    MatchResponse
} from "@/types/tournament";

async function request<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok){
        throw new Error(`Request failed ${response.status}`);
    }

    return await response.json() as Promise<T>;
}

export function getActiveTournament() {
    return request<Tournament>(`http://localhost:8080/public/tournament/active`);
}

export function getMatches(
    tournamentId: number,
    date: string
){
    const params = new URLSearchParams({
        tournament_id: String(tournamentId),
        date
    });

    return request<MatchResponse>(`http://localhost:8080/public/match?${params.toString()}`);
}