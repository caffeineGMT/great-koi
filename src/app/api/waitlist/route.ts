import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WAITLIST_FILE = path.join(process.cwd(), "waitlist.json");

async function getWaitlist(): Promise<string[]> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const waitlist = await getWaitlist();

  if (waitlist.includes(email)) {
    return NextResponse.json({ message: "Already on waitlist" });
  }

  waitlist.push(email);
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(waitlist, null, 2));

  return NextResponse.json({ message: "Added to waitlist", count: waitlist.length });
}
