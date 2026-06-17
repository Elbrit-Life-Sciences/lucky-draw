import { StoredEntry } from "./types";

/**
 * Pushes a lucky-draw entry into ERPNext by creating a record in the DocType
 * that backs the Forms Pro "Lucky Draw" form (route forms_pro_B4sebvHN). Forms
 * Pro auto-generates a submission DocType per form; for this form it is
 * "formspro_ragbwi000001", so records created here show up under the form's
 * responses in ERPNext.
 *
 * Connection is env-driven (set these in Netlify → Site settings → Environment
 * variables, or a local .env.local — never commit them):
 *   ERP_URL          https://erp.elbrit.org   (base URL, no trailing /api)
 *   ERP_API_KEY      ERPNext API key  (of a user allowed to create the DocType)
 *   ERP_API_SECRET   ERPNext API secret
 *   ERP_DOCTYPE      submission DocType the form writes to
 *                    (defaults to "formspro_ragbwi000001")
 *
 * FIELD MAPPING below matches the fieldnames defined on the Forms Pro form.
 */
export async function sendToErpnext(
  entry: StoredEntry
): Promise<{ ok: boolean; skipped?: boolean; detail?: string }> {
  const url = process.env.ERP_URL || "https://erp.elbrit.org";
  const key = process.env.ERP_API_KEY;
  const secret = process.env.ERP_API_SECRET;
  const doctype = process.env.ERP_DOCTYPE || "formspro_ragbwi000001";

  if (!key || !secret) {
    return { ok: false, skipped: true, detail: "ERP API key/secret not configured" };
  }

  const payload: Record<string, unknown> = {
    full_name: entry.name,
    email_address: entry.email,
    mobile_number: entry.phone,
    specialisation: entry.specialisation,
    city: entry.city,
    clinic_hospital_name: entry.clinic,
    lucky_number: entry.luckyNumber,
  };

  try {
    const res = await fetch(
      `${url.replace(/\/+$/, "")}/api/resource/${encodeURIComponent(doctype)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${key}:${secret}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 400)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "fetch failed" };
  }
}
