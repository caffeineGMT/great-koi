import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ANALYTICS_FILE = path.join(process.cwd(), "analytics.json");

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  data?: Record<string, string | number>;
}

async function getEvents(): Promise<AnalyticsEvent[]> {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const { event, data } = await request.json();

  if (!event || typeof event !== "string") {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const events = await getEvents();
  events.push({ event, timestamp: Date.now(), data });

  // Keep last 10000 events
  const trimmed = events.slice(-10000);
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(trimmed));

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const events = await getEvents();

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const last24h = events.filter((e) => now - e.timestamp < day);
  const last7d = events.filter((e) => now - e.timestamp < 7 * day);

  const countBy = (evts: AnalyticsEvent[]) => {
    const counts: Record<string, number> = {};
    for (const e of evts) {
      counts[e.event] = (counts[e.event] || 0) + 1;
    }
    return counts;
  };

  return NextResponse.json({
    total: events.length,
    last24h: { total: last24h.length, events: countBy(last24h) },
    last7d: { total: last7d.length, events: countBy(last7d) },
  });
}
