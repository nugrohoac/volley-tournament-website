
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Trophy,
  MapPin,
  Volleyball,
  LoaderCircle,
} from "lucide-react";

import {
  getActiveTournament,
  getMatches,
} from "@/services/tournament";

import type {
  Tournament,
  Match,
} from "@/types/tournament";

// Convert ISO date to YYYY-MM-DD in Jakarta timezone.
function toDateKey(value: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00+07:00`));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];

  const current = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);

  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

function getWinner(match: Match) {
  const first = match.first_team_sets_won ?? 0;
  const second = match.second_team_sets_won ?? 0;

  if (first === second) return null;

  return first > second ? "first" : "second";
}

export default function Home() {
  const [tournament, setTournament] =
      useState<Tournament | null>(null);

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [loadingTournament, setLoadingTournament] =
      useState(true);

  const [loadingMatches, setLoadingMatches] =
      useState(false);

  const [error, setError] = useState("");

  // Fetch active tournament.
  useEffect(() => {
    async function loadTournament() {
      try {
        setLoadingTournament(true);
        setError("");

        const data = await getActiveTournament();

        setTournament(data);
        setSelectedDate(toDateKey(data.start_date));
      } catch (err) {
        console.error(err);
        setError("Gagal memuat informasi turnamen.");
      } finally {
        setLoadingTournament(false);
      }
    }

    loadTournament();
  }, []);

  // Fetch matches whenever selected date changes.
  useEffect(() => {
    if (!tournament || !selectedDate) return;

    let cancelled = false;

    async function loadMatches() {
      try {
        setLoadingMatches(true);
        setError("");

        const result = await getMatches(
            tournament!.id,
            selectedDate
        );

        if (!cancelled) {
          setMatches(result.matches ?? []);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setMatches([]);
          setError("Gagal memuat jadwal pertandingan.");
        }
      } finally {
        if (!cancelled) {
          setLoadingMatches(false);
        }
      }
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, [tournament, selectedDate]);

  if (loadingTournament) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F3F0E8] text-[#17251F]">
          <LoaderCircle
              className="animate-spin text-[#D96B3B]"
              size={32}
          />
        </main>
    );
  }

  if (!tournament) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F3F0E8] p-6 text-[#17251F]">
          <p>{error || "Turnamen tidak tersedia."}</p>
        </main>
    );
  }

  const dates = getDateRange(
      toDateKey(tournament.start_date),
      toDateKey(tournament.end_date)
  );

  return (
      <main className="min-h-screen bg-[#F3F0E8] text-[#17251F]">

        {/* Header */}
        <header className="bg-[#17251F] text-[#F3F0E8]">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-5 sm:px-6">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#F3F0E8]/30 bg-white/5">
              <Volleyball className="text-[#D6A84B]" size={28} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black uppercase tracking-wide sm:text-2xl">
                {tournament.name}
              </h1>

              <p className="text-xs tracking-[0.2em] text-[#C5C9BD] sm:text-sm">
                VOLLEYBALL TOURNAMENT
              </p>
            </div>

          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

          {/* Tournament Information */}
          <section className="relative mb-10 overflow-hidden rounded-2xl bg-[#17251F] p-6 text-[#F3F0E8] sm:p-9">

            <div className="absolute -right-8 -top-8 opacity-[0.06]">
              <Volleyball size={220} />
            </div>

            <div className="relative">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#E99A70]">
                Turnamen Voli
              </p>

              <h2 className="mb-6 max-w-2xl text-3xl font-black uppercase leading-tight sm:text-5xl">
                {tournament.name}
              </h2>

              {tournament.description && (
                  <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[#D5D8CE] sm:text-base">
                    {tournament.description}
                  </p>
              )}

              <div className="flex flex-col gap-4 text-sm text-[#E5E7DF] sm:flex-row sm:gap-8">

                <div className="flex items-center gap-2">
                  <CalendarDays
                      size={18}
                      className="shrink-0 text-[#E99A70]"
                  />

                  <span>
                  {formatDate(toDateKey(tournament.start_date))}
                    {" - "}
                    {formatDate(toDateKey(tournament.end_date))}
                </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin
                      size={18}
                      className="shrink-0 text-[#E99A70]"
                  />

                  <span>{tournament.location}</span>
                </div>

              </div>
            </div>
          </section>

          {/* Match Schedule */}
          <section>

            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-[#D96B3B]" />

              <h2 className="text-2xl font-black uppercase tracking-wide">
                Jadwal <span className="text-[#D96B3B]">Pertandingan</span>
              </h2>
            </div>

            {/* Date Selector */}
            <div className="mb-6 flex gap-3 overflow-x-auto pb-3">
              {dates.map((date) => {
                const active = date === selectedDate;
                const parsed = new Date(`${date}T12:00:00+07:00`);

                const day = new Intl.DateTimeFormat("id-ID", {
                  weekday: "short",
                  timeZone: "Asia/Jakarta",
                }).format(parsed);

                const number = new Intl.DateTimeFormat("id-ID", {
                  day: "2-digit",
                  month: "short",
                  timeZone: "Asia/Jakarta",
                }).format(parsed);

                return (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`min-w-24 rounded-xl border px-5 py-3 transition ${
                            active
                                ? "border-[#D96B3B] bg-[#D96B3B] text-white shadow-sm"
                                : "border-[#E5E1D7] bg-white text-[#555B4E] hover:border-[#D96B3B]"
                        }`}
                    >
                  <span className="block text-lg font-bold">
                    {number}
                  </span>

                      <span className="text-xs uppercase">
                    {day}
                  </span>
                    </button>
                );
              })}
            </div>

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#777B70]">
              {formatDate(selectedDate)}
            </h3>

            {/* Loading */}
            {loadingMatches && (
                <div className="flex justify-center py-16">
                  <LoaderCircle
                      className="animate-spin text-[#D96B3B]"
                      size={32}
                  />
                </div>
            )}

            {/* Error */}
            {!loadingMatches && error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                  {error}
                </div>
            )}

            {/* Empty State */}
            {!loadingMatches && !error && matches.length === 0 && (
                <div className="rounded-xl border border-[#E5E1D7] bg-white py-16 text-center">
                  <CalendarDays
                      className="mx-auto mb-3 text-[#D96B3B]"
                      size={36}
                  />

                  <p className="font-bold text-[#17251F]">
                    Belum ada pertandingan
                  </p>

                  <p className="mt-1 text-sm text-[#777B70]">
                    Tidak ada jadwal pertandingan pada tanggal ini.
                  </p>
                </div>
            )}

            {/* Match Cards */}
            {!loadingMatches && !error && (
                <div className="space-y-4">
                  {matches.map((match) => {
                    const winner = getWinner(match);
                    const done = match.status === "DONE";

                    return (
                        <article
                            key={match.id}
                            className="overflow-hidden rounded-xl border border-[#E5E1D7] bg-white transition hover:border-[#D6A84B]"
                        >

                          {/* Match Info */}
                          <div className="flex items-center justify-between border-b border-[#E5E1D7] px-4 py-3 sm:px-6">

                            <div className="flex flex-wrap items-center gap-2 text-sm text-[#555B4E]">
                              <Clock size={16} className="text-[#777B70]" />

                              <span className="font-bold">
                          {formatTime(match.schedule_at)}
                        </span>

                              <span className="inline-flex items-center rounded-md border border-[#E5E1D7] bg-[#F3F0E8] px-3 py-1 text-xs font-bold tracking-wider text-[#555B4E]">
                          {match.round_name.replace("_", " ")}
                        </span>
                            </div>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    done
                                        ? "bg-[#E5EFE7] text-[#28613D]"
                                        : "bg-[#FBE9DE] text-[#B9572E]"
                                }`}
                            >
                        {done ? "FINISHED" : match.status}
                      </span>

                          </div>

                          {/* Match Score */}
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-7 sm:gap-6 sm:px-6">

                            {/* First Team */}
                            <div className="min-w-0 text-center">
                              <p
                                  className={`truncate text-sm font-bold sm:text-lg ${
                                      winner === "first"
                                          ? "text-[#D96B3B]"
                                          : "text-[#17251F]"
                                  }`}
                              >
                                {match.first_team.name}
                              </p>

                              <p className="mt-1 text-xs text-[#777B70]">
                                {match.first_team.neighborhood}
                              </p>

                              {winner === "first" && (
                                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#D96B3B]">
                            <Trophy size={12} />
                            WINNER
                          </span>
                              )}
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-3 border-x border-[#E5E1D7] px-3 text-[#17251F] sm:gap-5 sm:px-6">

                        <span className="text-3xl font-black sm:text-5xl">
                          {done
                              ? match.first_team_sets_won ?? 0
                              : "-"}
                        </span>

                              <span className="text-xl text-[#D96B3B]">
                          :
                        </span>

                              <span className="text-3xl font-black sm:text-5xl">
                          {done
                              ? match.second_team_sets_won ?? 0
                              : "-"}
                        </span>

                            </div>

                            {/* Second Team */}
                            <div className="min-w-0 text-center">
                              <p
                                  className={`truncate text-sm font-bold sm:text-lg ${
                                      winner === "second"
                                          ? "text-[#D96B3B]"
                                          : "text-[#17251F]"
                                  }`}
                              >
                                {match.second_team.name}
                              </p>

                              <p className="mt-1 text-xs text-[#777B70]">
                                {match.second_team.neighborhood}
                              </p>

                              {winner === "second" && (
                                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#D96B3B]">
                            <Trophy size={12} />
                            WINNER
                          </span>
                              )}
                            </div>

                          </div>

                          {/* Match Footer */}
                          <div className="flex flex-wrap justify-between gap-2 border-t border-[#E5E1D7] bg-[#FAF9F5] px-4 py-3 text-xs text-[#777B70] sm:px-6">

                      <span>
                        {match.best_of_sets} SETS
                      </span>

                            <span>
                        Wasit: {match.referee_name || "-"}
                      </span>

                          </div>

                        </article>
                    );
                  })}
                </div>
            )}

          </section>

          {/* Footer */}
          <footer className="mt-12 border-t border-[#E5E1D7] py-6 text-center text-xs tracking-wider text-[#777B70]">
            {tournament.name} · VOLLEYBALL TOURNAMENT
            <p className="mt-2 text-[#D96B3B]">
              Bersatu dalam olahraga, meraih kemenangan bersama.
            </p>
          </footer>

        </div>
      </main>
  );
}
