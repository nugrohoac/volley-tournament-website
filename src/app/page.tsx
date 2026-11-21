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
        <main className="flex min-h-screen items-center justify-center bg-[#050d20] text-white">
          <LoaderCircle className="animate-spin text-orange-500" size={32} />
        </main>
    );
  }

  if (!tournament) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#050d20] p-6 text-white">
          <p>{error || "Turnamen tidak tersedia."}</p>
        </main>
    );
  }

  const dates = getDateRange(
      toDateKey(tournament.start_date),
      toDateKey(tournament.end_date)
  );

  return (
      <main className="min-h-screen bg-[#050d20] text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

          {/* Tournament Header */}
          <header className="mb-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10">
              <Volleyball className="text-orange-400" size={34} />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-black uppercase tracking-wider sm:text-2xl">
                {tournament.name}
              </h1>

              <p className="text-xs tracking-widest text-blue-300 sm:text-sm">
                VOLLEYBALL TOURNAMENT
              </p>
            </div>
          </header>

          {/* Tournament Information */}
          <section className="relative mb-10 overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950 to-[#071225] p-6 sm:p-8">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
              Tournament
            </p>

            <h2 className="relative mb-5 max-w-2xl text-3xl font-black uppercase sm:text-5xl">
              {tournament.name}
            </h2>

            <div className="flex flex-col gap-3 text-sm text-blue-200 sm:flex-row sm:gap-6">
              <div className="flex items-center gap-2">
                <CalendarDays size={17} className="text-orange-400" />
                {formatDate(toDateKey(tournament.start_date))}
                {" - "}
                {formatDate(toDateKey(tournament.end_date))}
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={17} className="text-orange-400" />
                {tournament.location}
              </div>
            </div>
          </section>

          {/* Match Schedule */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-orange-500" />

              <h2 className="text-2xl font-black uppercase italic tracking-wide">
                Match <span className="text-orange-500">Schedule</span>
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
                                ? "border-orange-400 bg-orange-500/15 text-orange-400 shadow-[0_0_18px_rgba(249,115,22,0.2)]"
                                : "border-blue-900 bg-[#0a1730] text-blue-200 hover:border-blue-500"
                        }`}
                    >
                  <span className="block text-lg font-bold">
                    {number}
                  </span>
                      <span className="text-xs uppercase">{day}</span>
                    </button>
                );
              })}
            </div>

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-300">
              {formatDate(selectedDate)}
            </h3>

            {/* Loading */}
            {loadingMatches && (
                <div className="flex justify-center py-16">
                  <LoaderCircle
                      className="animate-spin text-orange-500"
                      size={32}
                  />
                </div>
            )}

            {/* Error */}
            {!loadingMatches && error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
                  {error}
                </div>
            )}

            {/* Empty State */}
            {!loadingMatches && !error && matches.length === 0 && (
                <div className="rounded-xl border border-blue-900 bg-[#0a1730] py-16 text-center">
                  <CalendarDays
                      className="mx-auto mb-3 text-blue-400"
                      size={36}
                  />
                  <p className="font-bold">Belum ada pertandingan</p>
                  <p className="mt-1 text-sm text-slate-400">
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
                            className="overflow-hidden rounded-xl border border-blue-900/80 bg-gradient-to-r from-[#0b1931] to-[#081326] transition hover:border-blue-500/70"
                        >
                          {/* Match Info */}
                          <div className="flex items-center justify-between border-b border-blue-900/70 px-4 py-3 sm:px-6">
                            <div className="flex items-center gap-2 text-sm text-blue-200">
                              <Clock size={17} />
                              <span className="font-bold">
                          {formatTime(match.schedule_at)}
                        </span>
                              <span className="inline-flex items-center rounded-md px-3 py-1 text-xs font-bold tracking-wider bg-slate-400/10 text-slate-200 border border-slate-400/20">
                          {match.round_name}
                        </span>
                            </div>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    done
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-blue-500/10 text-blue-300"
                                }`}
                            >
                        {done ? "FINISHED" : match.status}
                      </span>
                          </div>

                          {/* Match Score */}
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-6 sm:gap-6 sm:px-6">
                            {/* First Team */}
                            <div className="min-w-0 text-center">
                              <p className={`truncate text-sm font-bold sm:text-lg ${
                                  winner === "first" ? "text-orange-400" : "text-white"
                              }`}>
                                {match.first_team.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {match.first_team.neighborhood}
                              </p>
                              {winner === "first" && (
                                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-orange-400">
                            <Trophy size={12} /> WINNER
                          </span>
                              )}
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-3 border-x border-blue-900 px-3 sm:gap-5 sm:px-6">
                        <span className="text-3xl font-black sm:text-5xl">
                          {done
                              ? match.first_team_sets_won ?? 0
                              : "-"}
                        </span>
                              <span className="text-xl text-blue-500">:</span>
                              <span className="text-3xl font-black sm:text-5xl">
                          {done
                              ? match.second_team_sets_won ?? 0
                              : "-"}
                        </span>
                            </div>

                            {/* Second Team */}
                            <div className="min-w-0 text-center">
                              <p className={`truncate text-sm font-bold sm:text-lg ${
                                  winner === "second" ? "text-orange-400" : "text-white"
                              }`}>
                                {match.second_team.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {match.second_team.neighborhood}
                              </p>
                              {winner === "second" && (
                                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-orange-400">
                            <Trophy size={12} /> WINNER
                          </span>
                              )}
                            </div>
                          </div>

                          {/* Match Footer */}
                          <div className="flex flex-wrap justify-between gap-2 border-t border-blue-900/50 px-4 py-3 text-xs text-slate-400 sm:px-6">
                      <span>
                        {match.best_of_sets} SETS
                      </span>
                            <span>
                        Referee: {match.referee_name || "-"}
                      </span>
                          </div>
                        </article>
                    );
                  })}
                </div>
            )}
          </section>

          <footer className="mt-12 border-t border-blue-900/50 py-6 text-center text-xs tracking-wider text-slate-500">
            {tournament.name} · VOLLEYBALL TOURNAMENT
          </footer>
        </div>
      </main>
  );
}
