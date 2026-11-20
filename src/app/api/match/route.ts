import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const apiUrl = process.env.API_URL_PUBLIC;
        if (!apiUrl){
            throw new Error("api url is not configured");
        }

        const tournamentId = request.nextUrl.searchParams.get("tournament_id");
        const date = request.nextUrl.searchParams.get("date");

        if (!tournamentId || !date){
            return NextResponse.json(
                {message: "tournament_id and date are required"},
                {status: 400}
            )
        }

        const params = new URLSearchParams({
            tournament_id: tournamentId,
            date
        });

        const response = await fetch(
            `${apiUrl}/public/match?${params.toString()}`,
            {cache: "no-store"}
        );

        if (!response.ok){
            return NextResponse.json(
                {message: "Failed to fetch match"},
                {status: response.status}
            );
        }

        const data = await response.json()
        return NextResponse.json(data);
    } catch (error) {
        console.log("ERROR FETCH API MATCH", error);

        return NextResponse.json(
            {message: "Internal server error"},
            {status: 500}
        );
    }
}