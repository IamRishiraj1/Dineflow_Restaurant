import Link from "next/link";
import { ChefHat, Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { defaultRestaurantSettings } from "@/data/restaurant";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// "14:00" -> "2:00 PM"
function formatTime12h(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Collapses the 7 per-day entries into display rows, merging consecutive
// days that share identical hours — e.g. four separate Mon/Tue/Wed/Thu
// entries with the same open/close become a single "Mon – Thu" row,
// matching how a restaurant's hours normally read on a menu or footer.
function groupOpeningHours(hours: { day: string; isOpen: boolean; open: string; close: string }[]) {
  const ordered = [...hours].sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day));

  const groups: { label: string; text: string }[] = [];

  for (const entry of ordered) {
    const text = entry.isOpen ? `${formatTime12h(entry.open)} – ${formatTime12h(entry.close)}` : "Closed";
    const abbrev = entry.day.slice(0, 3);
    const last = groups[groups.length - 1];

    if (last && last.text === text) {
      const startDay = last.label.split(" – ")[0];
      last.label = `${startDay} – ${abbrev}`;
    } else {
      groups.push({ label: abbrev, text });
    }
  }

  return groups;
}

// Server Component — reads the live RestaurantSettings row so the footer
// (contact info AND opening hours) always reflects whatever's actually
// saved in the admin Settings page, rather than static placeholder values.
// Falls back to data/restaurant.ts defaults only if the settings row
// doesn't exist yet (e.g. the seed script hasn't run), same as
// GET /api/settings does.
export async function Footer() {
  const settings =
    (await prisma.restaurantSettings.findUnique({ where: { id: "singleton" } })) ??
    defaultRestaurantSettings;

  const hoursGroups = groupOpeningHours(settings.openingHours as {
    day: string;
    isOpen: boolean;
    open: string;
    close: string;
  }[]);

  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-cream-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ember-500 text-ink-950">
                <ChefHat className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-semibold text-cream-50">DineFlow</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
              Modern ordering for a restaurant that cares about every plate. Fresh food,
              simple checkout, real-time tracking.
            </p>
            <div className="mt-5 flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social media link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition-colors hover:border-ember-500 hover:text-ember-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cream-50">
              Navigate
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-300">
              <li><Link href="/" className="hover:text-ember-400">Home</Link></li>
              <li><Link href="/menu" className="hover:text-ember-400">Menu</Link></li>
              <li><Link href="/about" className="hover:text-ember-400">About</Link></li>
              <li><Link href="/contact" className="hover:text-ember-400">Contact</Link></li>
              <li><Link href="/my-orders" className="hover:text-ember-400">My Orders</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cream-50">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-300">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember-400" />
                {settings.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-ember-400" />
                {settings.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-ember-400" />
                {settings.email}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cream-50">
              Opening Hours
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-300">
              {hoursGroups.map((group, i) => (
                <li key={group.label} className={i === 0 ? "flex items-center gap-2" : "pl-6"}>
                  {i === 0 && <Clock className="h-4 w-4 shrink-0 text-ember-400" />}
                  {group.label}: {group.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-800 pt-6 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} DineFlow. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">
           A full-stack restaurant ordering and management platform built with Next.js, PostgreSQL, Prisma,
           and modern web technologies. It features customer ordering, authentication, admin operations,
           payments, email notifications, and database-backed order management.
          </p>
        </div>
      </div>
    </footer>
  );
}
