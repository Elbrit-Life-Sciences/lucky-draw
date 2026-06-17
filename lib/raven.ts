import { StoredEntry } from "./types";

/**
 * Posts a formatted notification to the Raven "pmt" channel
 * (Elbrit Life Sciences-pmt) whenever a lucky-draw entry is submitted.
 *
 * Raven's send_message is NOT a guest endpoint, so this needs an API key/secret
 * of a user (ideally a dedicated bot user) that is a MEMBER of the channel:
 *   POST {ERP_URL}/api/method/raven.api.raven_message.send_message
 *   headers: Authorization: token <key>:<secret>
 *   body:    { channel_id, text }   // text is HTML
 *
 * Env:
 *   ERP_URL            base URL (default https://erp.elbrit.org)
 *   RAVEN_API_KEY      API key of a channel member / bot user
 *   RAVEN_API_SECRET   API secret
 *   RAVEN_CHANNEL_ID   Raven Channel name (default "Elbrit Life Sciences-pmt")
 *
 * Non-blocking by design: if creds aren't set it simply skips, and any failure
 * is reported to the caller (which logs it) without breaking the user's entry.
 */

const SEND_METHOD = "raven.api.raven_message.send_message";

function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildMessage(entry: StoredEntry): string {
  const rows: [string, string][] = [
    ["🎟️ Lucky Number", String(entry.luckyNumber)],
    ["👤 Name", entry.name],
    ["🩺 Specialisation", entry.specialisation],
    ["📱 Mobile", entry.phone],
    ["📧 Email", entry.email?.trim() || "—"],
    ["🏙️ City", entry.city],
    ["🏥 Clinic", entry.clinic],
  ];
  const lines = rows
    .map(([k, v]) => `<b>${k}:</b> ${esc(v)}`)
    .join("<br>");
  return (
    `<p>🎉 <b>New Lucky Draw Entry</b></p>` +
    `<p>${lines}</p>` +
    `<p style="color:#888"><i>Entry ${esc(entry.id)} · ${esc(entry.submittedAt)}</i></p>`
  );
}

export async function sendRavenNotification(
  entry: StoredEntry
): Promise<{ ok: boolean; skipped?: boolean; detail?: string }> {
  const base = (process.env.ERP_URL || "https://erp.elbrit.org").replace(/\/+$/, "");
  const key = process.env.RAVEN_API_KEY;
  const secret = process.env.RAVEN_API_SECRET;
  const channelId = process.env.RAVEN_CHANNEL_ID || "Elbrit Life Sciences-pmt";

  if (!key || !secret) {
    return { ok: false, skipped: true, detail: "Raven API key/secret not configured" };
  }

  try {
    const res = await fetch(`${base}/api/method/${SEND_METHOD}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${key}:${secret}`,
      },
      body: JSON.stringify({ channel_id: channelId, text: buildMessage(entry) }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 400)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "fetch failed" };
  }
}
