import { StoredEntry } from "./types";

/**
 * Pushes a lucky-draw entry into ERPNext via the Forms Pro public submission
 * API — the same endpoint the published "Lucky Draw" form uses
 * (route forms_pro_B4sebvHN, Form id 7upn0fs2f5). This is a guest method, so
 * no API key/secret is required; the record shows up under the form's
 * responses just like a normal submission.
 *
 *   POST {ERP_URL}/api/method/forms_pro.api.submission.submit_form_response
 *   body: { form_id, form_data: [{ fieldname, value }, ...] }
 *
 * Env (optional — sensible defaults baked in):
 *   ERP_URL             base URL (default https://erp.elbrit.org)
 *   FORMS_PRO_FORM_ID   Form id to submit to (default 7upn0fs2f5)
 */

const SUBMIT_METHOD = "forms_pro.api.submission.submit_form_response";

/**
 * Forms Pro's mobile_number is a Frappe "Phone" field and requires a country
 * code. Normalise the user's input to an E.164-ish "+91 …" form (India) when
 * no explicit "+<code>" prefix is present.
 */
function formatPhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91 ${digits.slice(1)}`;
  return `+91 ${digits}`;
}

export async function sendToErpnext(
  entry: StoredEntry
): Promise<{ ok: boolean; skipped?: boolean; detail?: string }> {
  const base = (process.env.ERP_URL || "https://erp.elbrit.org").replace(/\/+$/, "");
  const formId = process.env.FORMS_PRO_FORM_ID || "7upn0fs2f5";

  // list of { fieldname, value } — fieldnames match the Forms Pro form fields.
  const form_data: { fieldname: string; value: string | number }[] = [
    { fieldname: "full_name", value: entry.name },
    { fieldname: "specialisation", value: entry.specialisation },
    { fieldname: "mobile_number", value: formatPhone(entry.phone) },
    { fieldname: "city", value: entry.city },
    { fieldname: "clinic_hospital_name", value: entry.clinic },
    { fieldname: "lucky_number", value: entry.luckyNumber },
  ];
  // email is optional on the form — only send it when provided
  if (entry.email && entry.email.trim()) {
    form_data.push({ fieldname: "email_address", value: entry.email.trim() });
  }

  try {
    const res = await fetch(`${base}/api/method/${SUBMIT_METHOD}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form_id: formId, form_data }),
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
