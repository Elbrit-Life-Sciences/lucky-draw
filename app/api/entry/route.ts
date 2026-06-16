import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { LuckyDrawEntry, StoredEntry } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "entries.json");

function isValid(b: Partial<LuckyDrawEntry>): b is LuckyDrawEntry {
  return (
    typeof b.name === "string" && b.name.trim().length > 1 &&
    typeof b.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
    typeof b.phone === "string" && b.phone.replace(/\D/g, "").length >= 10 &&
    typeof b.specialisation === "string" && b.specialisation.length > 0 &&
    typeof b.city === "string" && b.city.trim().length > 1 &&
    typeof b.clinic === "string" && b.clinic.trim().length > 1 &&
    typeof b.luckyNumber === "number" && b.luckyNumber >= 1 && b.luckyNumber <= 100
  );
}

async function readEntries(): Promise<StoredEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as StoredEntry[];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  let body: Partial<LuckyDrawEntry>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 422 });
  }

  const stored: StoredEntry = {
    ...body,
    id: `LD-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    submittedAt: new Date().toISOString(),
  };

  // Local fallback store — keeps every entry in data/entries.json.
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const entries = await readEntries();
    entries.push(stored);
    await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist entry:", e);
    return NextResponse.json({ ok: false, error: "Storage error" }, { status: 500 });
  }

  // ───────────────────────────────────────────────────────────────
  // ERP HOOK — wire this up when ready. Example for ERPNext (Lead):
  //
  //   await fetch(`${process.env.ERP_URL}/api/resource/Lead`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
  //     },
  //     body: JSON.stringify({
  //       lead_name: stored.name,
  //       email_id: stored.email,
  //       mobile_no: stored.phone,
  //       company_name: stored.clinic,
  //       city: stored.city,
  //       custom_specialisation: stored.specialisation,
  //       custom_lucky_number: stored.luckyNumber,
  //       source: "Lucky Draw",
  //     }),
  //   });
  // ───────────────────────────────────────────────────────────────

  return NextResponse.json({ ok: true, id: stored.id });
}

export async function GET() {
  const entries = await readEntries();
  return NextResponse.json({ count: entries.length });
}
