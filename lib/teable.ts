import { PaintingRecord } from "./types";

const BASE_URL = process.env.TEABLE_API_URL;
const TABLE_ID = process.env.TEABLE_TABLE_ID;
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
      { headers: authHeaders(), next: { revalidate: 60 } }
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
      { headers: authHeaders(), next: { revalidate: 60 } }
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

export async function updatePainting(recordId: string, fields: Record<string, unknown>): Promise<void> {
  if (!isConfigured()) return;
  await fetch(
    `${BASE_URL}/api/table/${TABLE_ID}/record/${recordId}?fieldKeyType=name`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ fields }),
    }
  );
}

export async function deletePainting(recordId: string): Promise<void> {
  if (!isConfigured()) return;
  await fetch(
    `${BASE_URL}/api/table/${TABLE_ID}/record/${recordId}`,
    { method: "DELETE", headers: authHeaders() }
  );
}

export async function updateOrder(updates: { id: string; order: number }[]): Promise<void> {
  if (!isConfigured()) return;
  const records = updates.map((u) => ({
    id: u.id,
    fields: { order: u.order },
  }));
  await fetch(
    `${BASE_URL}/api/table/${TABLE_ID}/record?fieldKeyType=name`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ records }),
    }
  );
}
