const stats = [
  { label: "Total XP", value: "8,420", tone: "text-[#8FFE09]" },
  { label: "Streak", value: "14 Days", tone: "text-white" },
  { label: "PRs merged", value: "36", tone: "text-[#8FFE09]" },
  { label: "Rank", value: "#07", tone: "text-white" },
] as const;

const missions = [
  { title: "Branch & Merge", detail: "Complete 3 clean merges", progress: 82 },
  { title: "Commit Tactics", detail: "Land 6 well-scoped commits", progress: 64 },
  { title: "Challenge Sprint", detail: "Win 2 timed Git duels", progress: 46 },
] as const;

const activity = [
  { label: "Merged PR #841", time: "08:42" },
  { label: "Updated branch strategy", time: "Yesterday" },
  { label: "Unlocked leaderboard bonus", time: "2d ago" },
] as const;

const leaderboardPreview = [
  { rank: 1, name: "Astra", points: 2450 },
  { rank: 2, name: "Nova", points: 2310 },
  { rank: 3, name: "you", points: 1980 },
] as const;

export default function DashboardPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030305] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 border border-[#8FFE09]/50 bg-[#0a0b10]/80 px-4 py-4 shadow-[0_0_24px_rgba(143,254,9,0.12)] sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.38em] text-[#8FFE09]">forkthis // dashboard</p>
              <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-white sm:text-3xl">
                Mission Control
              </h1>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#8FFE09]/60 bg-[#10140d] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#8FFE09]">
              <span className="h-2 w-2 rounded-full bg-[#8FFE09] shadow-[0_0_10px_#8FFE09]" />
              live
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/70 sm:gap-6">
            <a href="#" className="transition hover:text-[#8FFE09]">Overview</a>
            <a href="#" className="transition hover:text-[#8FFE09]">Challenges</a>
            <a href="#" className="transition hover:text-[#8FFE09]">Leaderboard</a>
            <a href="#" className="transition hover:text-[#8FFE09]">Resources</a>
          </nav>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border border-[#8FFE09]/40 bg-[#0d0d12]/90 p-4 shadow-[inset_0_0_0_1px_rgba(143,254,9,0.08)]"
                >
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">{stat.label}</p>
                  <p className={`mt-3 text-2xl font-black tracking-[0.12em] ${stat.tone}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="border border-[#8FFE09]/40 bg-[#0d0d12]/90 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#8FFE09]">current objective</p>
                  <h2 className="mt-2 text-xl font-black uppercase tracking-[0.1em] text-white">
                    Git mastery loop
                  </h2>
                </div>
                <span className="rounded-full border border-[#8FFE09]/60 bg-[#1a260d] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#8FFE09]">
                  82% complete
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-none border border-[#8FFE09]/30 bg-[#07090d] p-4">
                    <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-white/65">
                      <span>branch health</span>
                      <span className="text-[#8FFE09]">stable</span>
                    </div>
                    <div className="flex h-2 overflow-hidden bg-[#141821]">
                      <div className="h-full w-[78%] bg-[#8FFE09] shadow-[0_0_18px_rgba(143,254,9,0.75)]" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="border border-[#8FFE09]/25 bg-[#0b0d14] p-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/55">commits</p>
                      <p className="mt-3 text-2xl font-black text-[#8FFE09]">128</p>
                    </div>
                    <div className="border border-[#8FFE09]/25 bg-[#0b0d14] p-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/55">rebases</p>
                      <p className="mt-3 text-2xl font-black text-white">24</p>
                    </div>
                    <div className="border border-[#8FFE09]/25 bg-[#0b0d14] p-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/55">reviews</p>
                      <p className="mt-3 text-2xl font-black text-white">17</p>
                    </div>
                  </div>
                </div>

                <div className="border border-[#8FFE09]/25 bg-[#0b0d14] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#8FFE09]">next unlock</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-white">merge mastery</p>
                      <p className="mt-1 text-xs text-white/60">Resolve 3 conflict-free pull requests</p>
                    </div>
                    <div className="h-2 overflow-hidden bg-[#141821]">
                      <div className="h-full w-[68%] bg-[#8FFE09]" />
                    </div>
                    <button className="mt-2 w-full border border-[#8FFE09] bg-[#8FFE09] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#030305] transition hover:bg-[#aafc55]">
                      continue run
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#8FFE09]/40 bg-[#0d0d12]/90 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#8FFE09]">missions</p>
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">3 active</span>
              </div>

              <div className="space-y-4">
                {missions.map((mission) => (
                  <div key={mission.title} className="border border-[#8FFE09]/20 bg-[#0a0c11] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">{mission.title}</h3>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-[#8FFE09]">{mission.progress}%</span>
                    </div>
                    <p className="mb-3 text-xs text-white/65">{mission.detail}</p>
                    <div className="h-2 overflow-hidden bg-[#141821]">
                      <div
                        className="h-full bg-[#8FFE09] shadow-[0_0_18px_rgba(143,254,9,0.6)]"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="border border-[#8FFE09]/40 bg-[#0d0d12]/90 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#8FFE09]">operator</p>
                  <h3 className="mt-2 text-xl font-black uppercase tracking-[0.12em] text-white">you</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center border border-[#8FFE09]/60 bg-[#10140d] text-sm font-black uppercase tracking-[0.14em] text-[#8FFE09]">
                  Y
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-white/75">
                <div className="flex items-center justify-between border-b border-[#8FFE09]/20 pb-2">
                  <span className="uppercase tracking-[0.18em] text-white/55">focus</span>
                  <span className="text-white">Frontend</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#8FFE09]/20 pb-2">
                  <span className="uppercase tracking-[0.18em] text-white/55">team</span>
                  <span className="text-white">Core Loop</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-[0.18em] text-white/55">level</span>
                  <span className="text-[#8FFE09]">Advanced</span>
                </div>
              </div>
            </div>

            <div className="border border-[#8FFE09]/40 bg-[#0d0d12]/90 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#8FFE09]">live feed</p>
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">today</span>
              </div>

              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.label} className="flex items-center justify-between border border-[#8FFE09]/15 bg-[#090b10] p-3">
                    <span className="text-xs uppercase tracking-[0.12em] text-white">{item.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-white/55">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#8FFE09]/40 bg-[#0d0d12]/90 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#8FFE09]">leaderboard</p>
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">top 3</span>
              </div>

              <div className="space-y-3">
                {leaderboardPreview.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center justify-between border border-[#8FFE09]/15 bg-[#090b10] px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#8FFE09]">#{entry.rank}</span>
                      <span className="text-xs uppercase tracking-[0.16em] text-white">{entry.name}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{entry.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
