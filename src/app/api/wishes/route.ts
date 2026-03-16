import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WISHES_FILE = path.join(process.cwd(), "community-wishes.json");

interface CommunityWish {
  id: string;
  text: string;
  timestamp: number;
}

async function getWishes(): Promise<CommunityWish[]> {
  try {
    const data = await fs.readFile(WISHES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET - fetch recent community wishes (anonymized, last 50)
export async function GET() {
  const wishes = await getWishes();
  const recent = wishes.slice(-50).map((w) => ({
    id: w.id,
    text: w.text.length > 60 ? w.text.slice(0, 57) + "..." : w.text,
    timestamp: w.timestamp,
  }));
  return NextResponse.json({ wishes: recent });
}

// POST - add a wish to the community pond
export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text || typeof text !== "string" || text.length > 200) {
    return NextResponse.json({ error: "Invalid wish" }, { status: 400 });
  }

  const wishes = await getWishes();
  const wish: CommunityWish = {
    id: crypto.randomUUID(),
    text: text.trim(),
    timestamp: Date.now(),
  };

  wishes.push(wish);

  // Keep only last 1000 wishes
  const trimmed = wishes.slice(-1000);
  await fs.writeFile(WISHES_FILE, JSON.stringify(trimmed, null, 2));

  return NextResponse.json({ wish });
}
