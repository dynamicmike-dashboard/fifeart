import { PaintingRecord } from "./types";

const BASE_URL = process.env.TEABLE_API_URL;
const TABLE_ID = process.env.TEABLE_TABLE_ID;
const ABOUT_TABLE_ID = process.env.TEABLE_ABOUT_TABLE_ID;
const TOKEN = process.env.TEABLE_API_TOKEN;

function authHeaders() {
  return { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
}

function isConfigured(): boolean {
  return !!(BASE_URL && TABLE_ID && TOKEN);
}

export async function getPaintings(): Promise<PaintingRecord[]> {
  if (!isConfigured()) return [];
  try {
    const res = await fetch(
      `${BASE_URL}/api/table/${TABLE_ID}/record?fieldKeyType=name&limit=200`,
      { headers: authHeaders(), cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.records || []) as PaintingRecord[];
  } catch {
    return [];
  }
}

export async function getPaintingById(recordId: string): Promise<PaintingRecord | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(
      `${BASE_URL}/api/table/${TABLE_ID}/record/${recordId}?fieldKeyType=name`,
      { headers: authHeaders(), cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data as PaintingRecord;
  } catch {
    return null;
  }
}

export async function createPainting(fields: Record<string, unknown>): Promise<PaintingRecord | null> {
  if (!isConfigured()) return null;
  const res = await fetch(
    `${BASE_URL}/api/table/${TABLE_ID}/record?fieldKeyType=name`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ records: [{ fields }] }),
    }
  );
  const data = await res.json();
  return data.records?.[0] as PaintingRecord;
}

export async function updatePainting(recordId: string, fields: Record<string, unknown>): Promise<any> {
  if (!isConfigured()) return null;
  const res = await fetch(
    `${BASE_URL}/api/table/${TABLE_ID}/record?fieldKeyType=name`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ records: [{ id: recordId, fields }] }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Teable PATCH ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deletePainting(recordId: string): Promise<void> {
  if (!isConfigured()) return;
  await fetch(
    `${BASE_URL}/api/table/${TABLE_ID}/record/${recordId}`,
    { method: "DELETE", headers: authHeaders() }
  );
}

export async function getAboutContent(): Promise<any> {
  if (!BASE_URL || !ABOUT_TABLE_ID || !TOKEN) return null;
  try {
    const res = await fetch(
      `${BASE_URL}/api/table/${ABOUT_TABLE_ID}/record?fieldKeyType=name&limit=1`,
      { headers: authHeaders(), cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.records?.[0] || null;
  } catch { return null; }
}

export async function upsertAboutContent(recordId: string | null, fields: Record<string, unknown>): Promise<any> {
  if (!BASE_URL || !ABOUT_TABLE_ID || !TOKEN) return null;
  if (recordId) {
    const res = await fetch(
      `${BASE_URL}/api/table/${ABOUT_TABLE_ID}/record?fieldKeyType=name`,
      {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ records: [{ id: recordId, fields }] }),
      }
    );
    if (!res.ok) { const t = await res.text(); throw new Error(`Teable PATCH ${res.status}: ${t}`); }
    return res.json();
  }
  const res = await fetch(
    `${BASE_URL}/api/table/${ABOUT_TABLE_ID}/record?fieldKeyType=name`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ records: [{ fields }] }),
    }
  );
  const data = await res.json();
  return data.records?.[0] || null;
}

export async function updateOrder(updates: { id: string; order: number }[]): Promise<void> {
  if (!isConfigured()) return;
  const records = updates.map((u) => ({
    id: u.id,
    fields: { order: u.order },
  }));
  const res = await fetch(
    `${BASE_URL}/api/table/${TABLE_ID}/record?fieldKeyType=name`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ records }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Teable reorder PATCH ${res.status}: ${text}`);
  }
}
