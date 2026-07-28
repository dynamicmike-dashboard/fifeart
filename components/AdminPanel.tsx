"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PaintingRecord, SUBJECT_OPTIONS, STATUS_OPTIONS, ORIENTATION_OPTIONS } from "@/lib/types";
import { getThumbUrl, getStatusDisplay } from "@/lib/utils";

function fieldsFromRecord(art: PaintingRecord): Record<string, any> {
  return {
    title: art.fields.title || "",
    medium: art.fields.medium || "",
    dimensions: art.fields.dimensions || "",
    priceGBP: art.fields.priceGBP ?? 0,
    status: art.fields.status || "available",
    orientation: art.fields.orientation || "landscape",
    subjects: [...(art.fields.subjects || [])],
    tags: art.fields.tags || "",
    order: art.fields.order ?? 1,
  };
}

function emptyFields(): Record<string, any> {
  return {
    title: "", medium: "", dimensions: "", priceGBP: 0,
    status: "available", orientation: "landscape", subjects: [], tags: "", order: 1,
  };
}

const emptyImage = { id: "", name: "", path: "", token: "", size: 0, mimetype: "", presignedUrl: "" };

export default function AdminPanel() {
  const [paintings, setPaintings] = useState<PaintingRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Record<string, any>>(emptyFields());
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [showAdd, setShowAdd] = useState(false);
  const [addFields, setAddFields] = useState<Record<string, any>>(emptyFields());
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/paintings");
    if (res.ok) setPaintings(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleFileSelect(file: File | null, setImage: (f: File | null) => void, setPreview: (s: string) => void) {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  }

  async function uploadImage(file: File): Promise<any> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return null;
    return res.json();
  }

  async function saveNew() {
    if (saving) return;
    setSaving(true);
    try {
      let image = null;
      if (addImage) {
        image = await uploadImage(addImage);
      }
      const fields = { ...addFields };
      if (image) fields.image = [image];
      const res = await fetch("/api/paintings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      if (!res.ok) { const e = await res.json(); alert("Save failed: " + (e.error || "unknown")); return; }
      setShowAdd(false);
      setAddFields(emptyFields());
      setAddImage(null);
      setAddImagePreview("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(id: string) {
    if (saving) return;
    setSaving(true);
    try {
      let imageField = undefined;
      if (editImage) {
        const uploaded = await uploadImage(editImage);
        if (uploaded) imageField = [uploaded];
      }
      const fields = { ...editFields };
      delete fields.image;
      if (imageField) fields.image = imageField;
      const res = await fetch("/api/paintings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fields }),
      });
      if (!res.ok) { const e = await res.json(); alert("Save failed: " + (e.error || "unknown")); return; }
      setEditingId(null);
      setEditFields(emptyFields());
      setEditImage(null);
      setEditImagePreview("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function deleteArt(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch("/api/paintings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const arr = [...paintings].sort((a, b) => (a.fields.order ?? 999) - (b.fields.order ?? 999));
    const temp = arr[index].fields.order;
    arr[index].fields.order = arr[index - 1].fields.order;
    arr[index - 1].fields.order = temp;
    const res = await fetch("/api/paintings/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: arr.map((a) => ({ id: a.id, order: a.fields.order })) }),
    });
    if (!res.ok) { const e = await res.json(); alert("Reorder: " + (e.error || "failed")); return; }
    await load();
  }

  async function moveDown(index: number) {
    const arr = [...paintings].sort((a, b) => (a.fields.order ?? 999) - (b.fields.order ?? 999));
    if (index >= arr.length - 1) return;
    const temp = arr[index].fields.order;
    arr[index].fields.order = arr[index + 1].fields.order;
    arr[index + 1].fields.order = temp;
    const res = await fetch("/api/paintings/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: arr.map((a) => ({ id: a.id, order: a.fields.order })) }),
    });
    if (!res.ok) { const e = await res.json(); alert("Reorder: " + (e.error || "failed")); return; }
    await load();
  }

  const sorted = [...paintings].sort((a, b) => (a.fields.order ?? 999) - (b.fields.order ?? 999));

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function photoField(
    preview: string,
    currentUrl: string | undefined,
    setFile: (f: File | null) => void,
    setPreview: (s: string) => void,
    prefix: string
  ) {
    const trigger = (key: string) => fileInputRefs.current[`${prefix}_${key}`]?.click();
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
      handleFileSelect(e.target.files?.[0] || null, setFile, setPreview);

    return (
      <div className="full">
        <label>Photo</label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="photo-btn" onClick={() => trigger("camera")}>
            Take Photo
          </button>
          <button type="button" className="photo-btn" onClick={() => trigger("gallery")}>
            Choose from Gallery
          </button>
          <button type="button" className="photo-btn" onClick={() => trigger("files")}>
            Browse Files
          </button>
        </div>
        <input type="file" accept="image/*" capture="environment"
          ref={(el) => { fileInputRefs.current[`${prefix}_camera`] = el; }}
          onChange={onChange} style={{ display: "none" }} />
        <input type="file" accept="image/*"
          ref={(el) => { fileInputRefs.current[`${prefix}_gallery`] = el; }}
          onChange={onChange} style={{ display: "none" }} />
        <input type="file" accept="image/*,.heic,.heif,.png,.jpg,.jpeg,.webp"
          ref={(el) => { fileInputRefs.current[`${prefix}_files`] = el; }}
          onChange={onChange} style={{ display: "none" }} />
        <div style={{ marginTop: "0.5rem" }}>
          {preview ? (
            <img src={preview} alt="" style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "0.35rem", border: "1px solid #e7e5e4" }} />
          ) : currentUrl ? (
            <img src={currentUrl} alt="" style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "0.35rem", border: "1px solid #e7e5e4" }} />
          ) : (
            <span style={{ fontSize: "0.8rem", color: "#a8a29e" }}>No image</span>
          )}
        </div>
      </div>
    );
  }

  function fieldRow(
    label: string,
    value: string | number,
    onChange: (v: any) => void,
    opts?: { type?: string; placeholder?: string; full?: boolean }
  ) {
    const el = (
      <div className={opts?.full ? "full" : ""}>
        <label>{label}</label>
        <input
          type={opts?.type || "text"}
          value={value ?? ""}
          onChange={(e) => onChange(opts?.type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={opts?.placeholder}
        />
      </div>
    );
    return el;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>FifeArt — Manage Artworks</h1>
        <a href="/" style={{ fontSize: "0.85rem", color: "#78716c" }}>&larr; Back to Gallery</a>
      </div>

      <div className="toolbar">
        <button className="primary" onClick={() => setShowAdd(!showAdd)}>+ Add Artwork</button>

      </div>

      {showAdd && (
        <div className="form-section">
          <h3>New Artwork</h3>
          <div className="form-grid">
            {fieldRow("Title", addFields.title, (v) => setAddFields({ ...addFields, title: v }), { placeholder: "e.g. Blue Harbour", full: true })}
            {fieldRow("Medium", addFields.medium, (v) => setAddFields({ ...addFields, medium: v }), { placeholder: "Oil on canvas" })}
            {fieldRow("Dimensions", addFields.dimensions, (v) => setAddFields({ ...addFields, dimensions: v }), { placeholder: "40 x 50 cm" })}
            {fieldRow("Price (£)", addFields.priceGBP, (v) => setAddFields({ ...addFields, priceGBP: v }), { type: "number" })}
            <div>
              <label>Status</label>
              <select value={addFields.status} onChange={(e) => setAddFields({ ...addFields, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label>Orientation</label>
              <select value={addFields.orientation} onChange={(e) => setAddFields({ ...addFields, orientation: e.target.value })}>
                {ORIENTATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {fieldRow("Order", addFields.order, (v) => setAddFields({ ...addFields, order: v }), { type: "number" })}
            <div className="full">
              <label>Tags</label>
              <input value={addFields.tags} onChange={(e) => setAddFields({ ...addFields, tags: e.target.value })} placeholder="sea, evening, boats" />
            </div>
            <div className="full">
              <label>Subjects</label>
              <div className="subjects-grid">
                {SUBJECT_OPTIONS.map((sub) => (
                  <label key={sub}>
                    <input
                      type="checkbox" value={sub}
                      checked={(addFields.subjects || []).includes(sub)}
                      onChange={(e) => {
                        const current = addFields.subjects || [];
                        setAddFields({
                          ...addFields,
                          subjects: e.target.checked ? [...current, sub] : current.filter((s: string) => s !== sub),
                        });
                      }}
                    />
                    {" "}{sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            {photoField(addImagePreview, undefined, setAddImage, setAddImagePreview, "add")}
          </div>
          <div className="form-actions">
            <button className="primary" onClick={saveNew} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button className="secondary" onClick={() => { setShowAdd(false); setAddImage(null); setAddImagePreview(""); }}>Cancel</button>
          </div>
        </div>
      )}

      <h2>Current Artworks ({paintings.length})</h2>
      <div id="art-list">
        {sorted.map((art, i) => {
          const status = getStatusDisplay(art.fields.status);
          const isEditing = editingId === art.id;

          if (isEditing) {
            return (
              <div key={art.id} className="form-section">
                <h3>Edit "{art.fields.title}"</h3>
                <div className="form-grid">
                  {fieldRow("Title", editFields.title, (v) => setEditFields({ ...editFields, title: v }), { full: true })}
                  {fieldRow("Medium", editFields.medium, (v) => setEditFields({ ...editFields, medium: v }))}
                  {fieldRow("Dimensions", editFields.dimensions, (v) => setEditFields({ ...editFields, dimensions: v }))}
                  {fieldRow("Price (£)", editFields.priceGBP, (v) => setEditFields({ ...editFields, priceGBP: v }), { type: "number" })}
                  <div>
                    <label>Status</label>
                    <select value={editFields.status || "available"} onChange={(e) => setEditFields({ ...editFields, status: e.target.value })}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Orientation</label>
                    <select value={editFields.orientation || "landscape"} onChange={(e) => setEditFields({ ...editFields, orientation: e.target.value })}>
                      {ORIENTATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  {fieldRow("Order", editFields.order, (v) => setEditFields({ ...editFields, order: v }), { type: "number" })}
                  <div className="full">
                    <label>Tags</label>
                    <input value={editFields.tags || ""} onChange={(e) => setEditFields({ ...editFields, tags: e.target.value })} placeholder="sea, evening, boats" />
                  </div>
                  <div className="full">
                    <label>Subjects</label>
                    <div className="subjects-grid">
                      {SUBJECT_OPTIONS.map((sub) => (
                        <label key={sub}>
                          <input
                            type="checkbox" value={sub}
                            checked={(editFields.subjects || []).includes(sub)}
                            onChange={(e) => {
                              const current = editFields.subjects || [];
                              setEditFields({
                                ...editFields,
                                subjects: e.target.checked ? [...current, sub] : current.filter((s: string) => s !== sub),
                              });
                            }}
                          />
                          {" "}{sub.charAt(0).toUpperCase() + sub.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                  {photoField(editImagePreview, getThumbUrl(art), setEditImage, setEditImagePreview, "edit")}
                </div>
                <div className="form-actions">
                  <button className="primary" onClick={() => saveEdit(art.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                  <button className="secondary" onClick={() => { setEditingId(null); setEditFields(emptyFields()); setEditImage(null); setEditImagePreview(""); }}>Cancel</button>
                </div>
              </div>
            );
          }

          return (
            <div key={art.id}>
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
                  <button onClick={() => { setEditingId(art.id); setEditFields(fieldsFromRecord(art)); }}>Edit</button>
                  <button onClick={() => deleteArt(art.id, art.fields.title)} style={{ color: "#dc2626" }}>Del</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}