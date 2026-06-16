export interface LuckyDrawEntry {
  name: string;
  email: string;
  phone: string;
  specialisation: string;
  city: string;
  clinic: string;
  luckyNumber: number;
}

export interface StoredEntry extends LuckyDrawEntry {
  id: string;
  submittedAt: string;
}

export const SPECIALISATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "ENT Specialist",
  "Gastroenterologist",
  "Gynaecologist",
  "Neurologist",
  "Oncologist",
  "Orthopaedic Surgeon",
  "Paediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Radiologist",
  "Urologist",
  "Other",
] as const;
