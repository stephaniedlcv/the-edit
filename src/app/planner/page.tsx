const monthDays = [
  { day: 27, muted: true },
  { day: 28, muted: true },
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 31, muted: true },
  { day: 1, dots: ["Office"] },
  { day: 2 },
  { day: 3 },
  { day: 4, dots: ["Gym"] },
  { day: 5 },
  { day: 6, dots: ["Office", "Beauty"] },
  { day: 7 },
  { day: 8, dots: ["Wishlist"] },
  { day: 9 },
  { day: 10 },
  { day: 11, dots: ["Office"] },
  { day: 12 },
  { day: 13, dots: ["Gym"] },
  { day: 14, selected: true, dots: ["Office", "Outfit", "Gym"] },
  { day: 15 },
  { day: 16, dots: ["Dinner"] },
  { day: 17 },
  { day: 18, dots: ["Office"] },
  { day: 19 },
  { day: 20, highlighted: true, dots: ["Hair"] },
  { day: 21 },
  { day: 22, highlighted: true, dots: ["Wishlist"] },
  { day: 23 },
  { day: 24 },
  { day: 25, dots: ["Office"] },
  { day: 26 },
  { day: 27, dots: ["Gym"] },
  { day: 28 },
  { day: 29, highlighted: true, dots: ["Nails"] },
  { day: 30 },
  { day: 31 },
  { day: 1, muted: true },
  { day: 2, muted: true },
  { day: 3, muted: true },
  { day: 4, muted: true },
  { day: 5, muted: true },
  { day: 6, muted: true },
];

const agenda = [
  {
    time: "9:00 AM",
    title: "Office",
    label: "Workwear edit",
    accent: "bg-[var(--burgundy)]",
  },
  {
    time: "10:00 AM",
    title: "Outfit Planning",
    label: "Pick polished PR-friendly look",
    accent: "bg-[var(--dusty-rose)]",
  },
  {
    time: "12:30 PM",
    title: "Gym",
    label: "Upper B + quick refresh",
    accent: "bg-[var(--olive)]",
  },
  {
    time: "7:00 PM",
    title: "Wishlist Review",
    label: "Check color + duplicate risk",
    accent: "bg-[var(--plum)]",
  },
];

const quickEvents = ["Office", "Gym", "Wash Hair", "Nails", "Dinner", "Wishlist"];

export default function PlannerPage() {
  return (
    <section className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto max-w-[1120px]">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3">Calendar / Planner</p>
            <h1 className="font-display text-[3.4rem] leading-[0.88] text-[var(--espresso)] md:text-[5.6rem]">
              Plan the edit.
            </h1>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-7 text-[var(--ink-soft)]">
              A softer luxury planner for outfits, office days, gym blocks, beauty routines,
              wishlist reviews, and every style decision that shapes the week.
            </p>
          </div>

          <div className="edit-card-glass flex items-center gap-4 px-5 py-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--burgundy)] text-sm font-semibold text-white">
              14
            </div>
            <div>
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[var(--caramel)]">
                Today
              </p>
              <p className="font-display text-2xl leading-none text-[var(--espresso)]">
                Wednesday
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="edit-card-glass p-5 md:p-7 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-2">Month view</p>
                <h2 className="font-display text-4xl leading-none text-[var(--espresso)]">
                  August 2026
                </h2>
              </div>
              <div className="flex gap-2">
                <button className="grid h-10 w-10 place-items-center rounded-full bg-white/55 text-[var(--coffee)] shadow-sm">
                  ‹
                </button>
                <button className="grid h-10 w-10 place-items-center rounded-full bg-white/55 text-[var(--coffee)] shadow-sm">
                  ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <p
                  key={day}
                  className="pb-2 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-[var(--caramel)]"
                >
                  {day}
                </p>
              ))}

              {monthDays.map((item, index) => (
                <div
                  key={`${item.day}-${index}`}
                  className={[
                    "relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition",
                    item.selected
                      ? "bg-[var(--burgundy)] text-white shadow-[0_14px_28px_rgba(122,46,53,0.24)]"
                      : item.highlighted
                        ? "bg-[rgba(216,175,163,0.38)] text-[var(--espresso)]"
                        : "bg-white/35 text-[var(--coffee)]",
                    item.muted ? "opacity-35" : "",
                  ].join(" ")}
                >
                  <span className="font-semibold">{item.day}</span>
                  {item.dots ? (
                    <span className="absolute bottom-2 flex gap-0.5">
                      {item.dots.slice(0, 3).map((dot) => (
                        <span
                          key={dot}
                          className={[
                            "h-1 w-1 rounded-full",
                            item.selected ? "bg-white" : "bg-[var(--burgundy)]",
                          ].join(" ")}
                        />
                      ))}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-[1.35rem] bg-white/46 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="eyebrow">Up next</p>
                <span className="rounded-full bg-[var(--burgundy)] px-3 py-1 text-[0.52rem] font-bold uppercase tracking-[0.16em] text-white">
                  + Add
                </span>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/55 p-3">
                  <div className="h-14 w-14 rounded-2xl bg-[linear-gradient(135deg,var(--blush),var(--dusty-rose))]" />
                  <div className="min-w-0">
                    <p className="font-display text-2xl leading-none text-[var(--espresso)]">
                      Outfit Planning
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      10:00 AM · Office polished, tropical-safe
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/40 p-3">
                  <div className="h-14 w-14 rounded-2xl bg-[linear-gradient(135deg,#F4E8DF,var(--olive))]" />
                  <div className="min-w-0">
                    <p className="font-display text-2xl leading-none text-[var(--espresso)]">
                      Gym
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      12:30 PM · Upper B
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="edit-card p-5 md:p-7">
            <div className="mb-6 overflow-x-auto">
              <div className="flex min-w-max gap-2">
                {[
                  ["Sun", "11"],
                  ["Mon", "12"],
                  ["Tue", "13"],
                  ["Wed", "14"],
                  ["Thu", "15"],
                  ["Fri", "16"],
                  ["Sat", "17"],
                ].map(([day, date]) => (
                  <div
                    key={date}
                    className={[
                      "grid min-w-16 place-items-center rounded-full px-4 py-3",
                      date === "14"
                        ? "bg-[var(--burgundy)] text-white"
                        : "bg-[rgba(244,232,223,0.74)] text-[var(--coffee)]",
                    ].join(" ")}
                  >
                    <span className="text-[0.52rem] font-bold uppercase tracking-[0.18em]">
                      {day}
                    </span>
                    <span className="font-display text-2xl leading-none">{date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,var(--blush),rgba(255,253,252,0.68))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              <p className="eyebrow mb-3">Wednesday, August 14</p>
              <h2 className="font-display text-4xl leading-none text-[var(--espresso)]">
                Focus. Plan. Elevate.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">
                A well-planned day creates a well-styled life.
              </p>
            </div>

            <div className="mt-7">
              <div className="mb-4 flex items-center justify-between">
                <p className="eyebrow">Today’s plan</p>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
                  4 items
                </span>
              </div>

              <div className="grid gap-3">
                {agenda.map((event) => (
                  <article
                    key={event.title}
                    className="flex items-center gap-4 rounded-[1.25rem] bg-[rgba(255,253,252,0.72)] p-4 shadow-[inset_0_0_0_1px_rgba(48,35,31,0.05)]"
                  >
                    <span className={`h-11 w-1.5 rounded-full ${event.accent}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--caramel)]">
                          {event.time}
                        </p>
                        <span className="h-8 w-8 rounded-full bg-[var(--paper-3)]" />
                      </div>
                      <h3 className="mt-1 font-display text-2xl leading-none text-[var(--espresso)]">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">{event.label}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="edit-card-glass p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-2">New event</p>
                <h2 className="font-display text-4xl leading-none text-[var(--espresso)]">
                  Add to plan
                </h2>
              </div>
              <button className="edit-button-primary h-11 w-11 text-lg">✓</button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-white/36 p-1">
              <button className="rounded-full bg-[var(--burgundy)] px-4 py-3 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white">
                Event
              </button>
              <button className="rounded-full px-4 py-3 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[var(--coffee)]">
                Task
              </button>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.15rem] bg-white/55 px-4 py-4">
                <p className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-[var(--caramel)]">
                  Title
                </p>
                <p className="mt-2 font-display text-2xl leading-none text-[var(--espresso)]">
                  Outfit Planning
                </p>
              </div>

              <div className="rounded-[1.15rem] bg-white/45 px-4 py-4">
                <p className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-[var(--caramel)]">
                  Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  Build a comfortable office look with color, structure, and PR heat in mind.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.15rem] bg-white/45 px-4 py-4">
                  <p className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-[var(--caramel)]">
                    Date
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--espresso)]">
                    Aug 14
                  </p>
                </div>
                <div className="rounded-[1.15rem] bg-white/45 px-4 py-4">
                  <p className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-[var(--caramel)]">
                    Time
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--espresso)]">
                    10:00 AM
                  </p>
                </div>
              </div>

              <div>
                <p className="eyebrow mb-3 mt-4">Category</p>
                <div className="flex flex-wrap gap-2">
                  {quickEvents.map((event) => (
                    <span
                      key={event}
                      className={event === "Office" ? "edit-chip edit-chip-active" : "edit-chip"}
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-3 mt-4">Outfit preview</p>
                <div className="grid grid-cols-4 gap-2">
                  {["Blazer", "Top", "Pants", "+"].map((piece) => (
                    <div
                      key={piece}
                      className="grid aspect-square place-items-center rounded-[1rem] bg-white/45 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-[var(--caramel)]"
                    >
                      {piece}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}
