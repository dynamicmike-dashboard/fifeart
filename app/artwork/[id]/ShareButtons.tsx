"use client";

import { useState, useEffect } from "react";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    setFullUrl(`${window.location.origin}/artwork/${url}`);
  }, [url]);

  async function copyLink() {
    if (!fullUrl) return;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function share() {
    if (!fullUrl) return;
    if (typeof navigator.share === "function") {
      navigator.share({ title, url: fullUrl });
    } else {
      copyLink();
    }
  }

  return (
    <div className="share-row">
      <button onClick={share}>Share</button>
      <button onClick={copyLink}>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
