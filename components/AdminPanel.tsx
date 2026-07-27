"use client";

import { useState, useEffect, useCallback } from "react";
import { PaintingRecord, SUBJECT_OPTIONS, STATUS_OPTIONS, ORIENTATION_OPTIONS } from "@/lib/types";
import { getThumbUrl, getStatusDisplay } from "@/lib/utils";

export default function AdminPanel() {
  const [paintings, setPaintings] = useState<PaintingRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Record<string, any>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newFields, setNewFields] = useState<Record<string, any>>({
    title: "", medium: "", dimensions: "", priceGBP: 0,
    status: "available", orientation: "landscape", subjects: [], tags: "", order: 1,
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/paintings");
    const data = await res.json();
    setPaintings(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveNew() {
    await fetch("/api/paintings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: newFields }),
    });
    setShowAdd(false);
    setNewFields({ title: "", medium: "", dimensions: "", priceGBP: 0, status: "available", orientation: "landscape", subjects: [], tags: "", order: paintings.length + 1 });
    load();
  }

  async function saveEdit(id: string) {
    await fetch("/api/paintings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, fields: editFields }),
    });
    setEditingId(null);
    load();
  }

  async function deleteArt(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch("/api/paintings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const arr = [...paintings].sort((a, b) => (a.fields.order ?? 999) - (b.fields.order ?? 999));
    const temp = arr[index].fields.order;
    arr[index].fields.order = arr[index - 1].fields.order;
    arr[index - 1].fields.order = temp;
    await fetch("/api/paintings/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: arr.map((a) => ({ id: a.id, order: a.fields.order })) }),
    });
    load();
  }

  async function moveDown(index: number) {
    const arr = [...paintings].sort((a, b) => (a.fields.order ?? 999) - (b.fields.order ?? 999));
    if (index >= arr.length - 1) return;
    const temp = arr[index].fields.order;
    arr[index].fields.order = arr[index + 1].fields.order;
    arr[index + 1].fields.order = temp;
    await fetch("/api/paintings/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: arr.map((a) => ({ id: a.id, order: a.fields.order })) }),
    });
    load();
  }

  const sorted = [...paintings].sort((a, b) => (a.fields.order ?? 999) - (b.fields.order ?? 999));

  function EditForm({ art }: { art: PaintingRecord }) {
    const ef = editingId === art.id ? editFields : art.fields;
    return (
      <div className="form-section">
        <h3>Edit "{art.fields.title}"</h3>
        <div className="form-grid">
          <div className="full">
            <label>Title</label>
            <input value={ef.title || ""} onChange={(e) => setEditFields({ ...ef, title: e.target.value })} />
          </div>
          <div>
            <label>Medium</label>
            <input value={ef.medium || ""} onChange={(e) => setEditFields({ ...ef, medium: e.target.value })} />
          </div>
          <div>
            <label>Dimensions</label>
            <input value={ef.dimensions || ""} onChange={(e) => setEditFields({ ...ef, dimensions: e.target.value })} />
          </div>
          <div>
            <label>Price (£)</label>
            <input type="number" value={ef.priceGBP ?? 0} onChange={(e) => setEditFields({ ...ef, priceGBP: Number(e.target.value) })} />
          </div>
          <div>
            <label>Status</label>
            <select value={ef.status || "available"} onChange={(e) => setEditFields({ ...ef, status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label>Orientation</label>
            <select value={ef.orientation || "landscape"} onChange={(e) => setEditFields({ ...ef, orientation: e.target.value })}>
              {ORIENTATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label>Order</label>
            <input type="number" value={ef.order ?? 1} onChange={(e) => setEditFields({ ...ef, order: Number(e.target.value) })} />
          </div>
          <div className="full">
            <label>Tags</label>
            <input value={ef.tags || ""} onChange={(e) => setEditFields({ ...ef, tags: e.target.value })} />
          </div>
        </div>
        <div className="form-actions">
          <button className="primary" onClick={() => saveEdit(art.id)}>Save</button>
          <button className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>FifeArt — Manage Artworks</h1>
        <a href="/" style={{ fontSize: "0.85rem", color: "#78716c" }}>&larr; Back to Gallery</a>
      </div>

      <div className="toolbar">
        <button className="primary" onClick={() => setShowAdd(!showAdd)}>+ Add Artwork</button>
        <button onClick={async () => {
          const arr = [...paintings].sort((a, b) => (a.fields.order ?? 999) - (b.fields.order ?? 999));
          const updates = arr.map((a, i) => ({ id: a.id, order: i + 1 }));
          await fetch("/api/paintings/reorder", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates }),
          });
          load();
        }}>Renumber Order</button>
      </div>

      {showAdd && (
        <div className="form-section">
          <h3>New Artwork</h3>
          <div className="form-grid">
            <div className="full">
              <label>Title</label>
              <input value={newFields.title} onChange={(e) => setNewFields({ ...newFields, title: e.target.value })} placeholder="e.g. Blue Harbour" />
            </div>
            <div>
              <label>Medium</label>
              <input value={newFields.medium} onChange={(e) => setNewFields({ ...newFields, medium: e.target.value })} placeholder="Oil on canvas" />
            </div>
            <div>
              <label>Dimensions</label>
              <input value={newFields.dimensions} onChange={(e) => setNewFields({ ...newFields, dimensions: e.target.value })} placeholder="40 x 50 cm" />
            </div>
            <div>
              <label>Price (£)</label>
              <input type="number" value={newFields.priceGBP} onChange={(e) => setNewFields({ ...newFields, priceGBP: Number(e.target.value) })} />
            </div>
            <div>
              <label>Status</label>
              <select value={newFields.status} onChange={(e) => setNewFields({ ...newFields, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label>Orientation</label>
              <select value={newFields.orientation} onChange={(e) => setNewFields({ ...newFields, orientation: e.target.value })}>
                {ORIENTATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label>Order</label>
              <input type="number" value={newFields.order} onChange={(e) => setNewFields({ ...newFields, order: Number(e.target.value) })} />
            </div>
            <div className="full">
              <label>Tags (comma separated)</label>
              <input value={newFields.tags} onChange={(e) => setNewFields({ ...newFields, tags: e.target.value })} placeholder="sea, evening, boats" />
            </div>
            <div className="full">
              <label>Subjects</label>
              <div className="subjects-grid">
                {SUBJECT_OPTIONS.map((sub) => (
                  <label key={sub}>
                    <input
                      type="checkbox" value={sub}
                      checked={(newFields.subjects || []).includes(sub)}
                      onChange={(e) => {
                        const current = newFields.subjects || [];
                        setNewFields({
                          ...newFields,
                          subjects: e.target.checked ? [...current, sub] : current.filter((s: string) => s !== sub),
                        });
                      }}
                    />
                    {" "}{sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="primary" onClick={saveNew}>Save</button>
            <button className="secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <h2>Current Artworks ({paintings.length})</h2>
      <div id="art-list">
        {sorted.map((art, i) => {
          const status = getStatusDisplay(art.fields.status);
          return (
            <div key={art.id}>
              {editingId === art.id ? (
                <EditForm art={art} />
              ) : (
                <div className="art-row">
                  <img src={getThumbUrl(art)} alt="" className="thumb" />
                  <div className="info">
                    <strong>{art.fields.title}</strong>
                    <span>
                      {art.fields.medium}
                      {art.fields.dimensions ? ` · ${art.fields.dimensions}` : ""}
                      {art.fields.status === "available" ? ` · £${art.fields.priceGBP}` : ""}
                    </span>
                    <div style={{ marginTop: "0.25rem" }}>
                      {status.label && (
                        <span className={`status-badge ${status.className}`}>{status.label}</span>
                      )}
                      <span style={{ fontSize: "0.75rem", color: "#a8a29e", marginLeft: "0.5rem" }}>
                        {(art.fields.subjects || []).join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="actions">
                    <button onClick={() => moveUp(i)} title="Move up">&uarr;</button>
                    <button onClick={() => moveDown(i)} title="Move down">&darr;</button>
                    <button onClick={() => { setEditingId(art.id); setEditFields({ ...art.fields }); }}>Edit</button>
                    <button onClick={() => deleteArt(art.id, art.fields.title)} style={{ color: "#dc2626" }}>Del</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
