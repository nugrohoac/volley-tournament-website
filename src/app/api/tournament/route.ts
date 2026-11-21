import {NextResponse} from "next/server";

export async function GET() {
    try {
      const apiUrl= process.env.API_URL_PUBLIC;
      if (!apiUrl) {
          throw new Error("API URL PUBLIC is not configured");
      }

      const response = await fetch(
          `${apiUrl}/public/tournament/active`,
          {cache: "no-store"}
      );

      if (!response.ok) {
          return NextResponse.json(
              {message: "Failed to fetch tournament"},
              {status: response.status}
          );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error){
        console.error("Tournament API error:", error);

        return NextResponse.json(
            {message: "Internal server error"},
            {status: 500}
        );
    }
}