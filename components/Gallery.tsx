"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { PaintingRecord } from "@/lib/types";
import { getThumbUrl, getFullImageUrl, getStatusDisplay, sortByOrder } from "@/lib/utils";
import CommissionModal from "./CommissionModal";
import EnquiryModal from "./EnquiryModal";

export default function Gallery({ paintings: all }: { paintings: PaintingRecord[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<PaintingRecord | null>(null);
  const [showCommission, setShowCommission] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);

  const subjects = useMemo(() => {
    const s = new Set<string>();
    all.forEach((p) => (p.fields.subjects || []).forEach((x) => s.add(x)));
    return Array.from(s).sort();
  }, [all]);

  const filtered = useMemo(() => {
    let list = all;
    if (filter !== "all") {
      list = list.filter((a) => (a.fields.subjects || []).includes(filter));
    }
    if (search) {
      const t = search.toLowerCase();
      list = list.filter((a) => {
        const title = (a.fields.title || "").toLowerCase();
        const tags = (a.fields.tags || "").toLowerCase();
        return title.includes(t) || tags.includes(t);
      });
    }
    return sortByOrder(list);
  }, [all, filter, search]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <h1>FifeArt</h1>
          <p>Original paintings by Nancy Berry — available in the UK</p>
          <div className="header-links">
            <a href="/about" className="header-link">About</a>
            <button className="header-link" onClick={() => setShowCommission(true)}>Commission</button>
            <button className="header-link" onClick={() => setShowEnquiry(true)}>Enquiries</button>
          </div>
        </div>
      </header>

      <div id="filter-bar">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
        {subjects.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <input
          id="search-input" type="search" placeholder="Search title or tag…"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div id="gallery-container">
        {filtered.length === 0 ? (
          <div id="gallery-empty">No artworks match your filter.</div>
        ) : (
          filtered.map((art) => {
            const status = getStatusDisplay(art.fields.status);
            return (
              <div
                key={art.id}
                className={`art-card card-${art.fields.orientation || "landscape"}`}
                onClick={() => setLightbox(art)}
              >
                <div className="thumb-wrapper">
                  <Image
                    src={getThumbUrl(art)}
                    alt={art.fields.title}
                    fill
                    sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="gallery-img"
                  />
                </div>
                <h3>{art.fields.title}</h3>
                <p className="meta">
                  {art.fields.medium}
                  {art.fields.dimensions ? ` · ${art.fields.dimensions}` : ""}
                </p>
                {status.label && <span className={`status-badge ${status.className}`}>{status.label}</span>}
              </div>
            );
          })
        )}
      </div>

      {lightbox && (
        <div id="lightbox" className="open">
          <div id="lightbox-overlay" onClick={() => setLightbox(null)} />
          <div id="lightbox-content">
            <div className="lightbox-inner">
              <Image
                src={getFullImageUrl(lightbox)}
                alt={lightbox.fields.title}
                width={lightbox.fields.image?.[0]?.width || 1200}
                height={lightbox.fields.image?.[0]?.height || 900}
                className="art-large"
                priority
              />
              <h2>{lightbox.fields.title}</h2>
              <p className="lb-detail">
                {lightbox.fields.medium}
                {lightbox.fields.dimensions ? ` · ${lightbox.fields.dimensions}` : ""}
              </p>
              {lightbox.fields.status === "available" ? (
                <p className="lb-price">£{lightbox.fields.priceGBP}</p>
              ) : lightbox.fields.status === "sold" ? (
                <p className="lb-price">This artwork has been sold.</p>
              ) : (
                <p className="lb-price">This artwork is not for sale.</p>
              )}
              <p className="lb-note">
                Available in the UK only.
              </p>
              <button className="lb-enquire" onClick={() => setShowEnquiry(true)}>Enquire About This Painting</button>
              <button className="lb-close" onClick={() => setLightbox(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showCommission && <CommissionModal onClose={() => setShowCommission(false)} />}
      {showEnquiry && <EnquiryModal onClose={() => setShowEnquiry(false)} />}
    </>
  );
}
