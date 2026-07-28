# PROJECT MANIFEST — FifeArt

## STATUS
- **Current Goal:** Site is functional at https://fifeart.com with gallery, admin, about page, contact/enquiry forms
- **Last Session:** 28 Jul 2026

## SYSTEM STATE
- **Root:** `F:\Mike d drive\Mike Webs\mAIstermind.com\projects\FifeArt website 26jul26\fifeart-github`
- **Production:** https://fifeart.com (Vercel — dynamicmikes-projects/fifeart)
- **GitHub:** https://github.com/dynamicmike-dashboard/fifeart.git
- **CMS:** Teable — `bseGuvyJAPGIYGv0WMy` (tables: paintings, about)
- **Active Modules:** Gallery, Admin (Artworks + About tabs), Enquiry/Commission modals, About page, PWA, Email API

## RECENT WORK (last session)
- Fixed image upload flow: two-step (create record → upload to record-level endpoint), WebP conversion via sharp, `{ id }` reference format
- Fixed reorder: batch PATCH via `updateOrder()`, error propagation, `cache: "no-store"` on GET
- Made homepage dynamic (force-dynamic) — no more stale presigned URLs
- Removed Renumber button
- Added About page + Admin About editor with Teable storage
- Fixed header button visibility on mobile, added About link
- Added PWA support: manifest.json, icons (192/512), service worker, theme meta

## PENDING / NEXT
- [ ] Fix image upload not displaying (check `{ id }` reference vs what Teable returns on GET)
- [ ] Fix reorder persistence (batch PATCH succeeds but order may not change)
- [ ] Configure Gmail SMTP — set `SMTP_PASS` (App Password) + `EMAIL_ENABLED=true` in Vercel env
- [ ] Add `www.fifeart.com` domain in Vercel Dashboard → Domains
- [ ] Add proper metadata/titles for all 60 paintings via /admin
- [ ] Consider replacing about table (`tblG1JCrNBFlRslVa4J`) with properly named table

## IMPORTANT FILES
| File | Purpose |
|------|---------|
| `lib/teable.ts` | All Teable API functions |
| `app/api/paintings/route.ts` | CRUD for paintings |
| `app/api/paintings/reorder/route.ts` | Batch order update |
| `app/api/upload/route.ts` | Image upload with WebP conversion |
| `app/api/enquire/route.ts` | Contact form email |
| `app/api/about/route.ts` | About content API |
| `components/Gallery.tsx` | Main gallery page |
| `components/AdminPanel.tsx` | Full admin panel (artworks + about tabs) |
| `components/EnquiryModal.tsx` | Contact form modal |
| `components/CommissionModal.tsx` | Commission request modal |
| `app/page.tsx` | Homepage (dynamic) |
| `app/about/page.tsx` | About the Artist page |
| `app/globals.css` | All styles |
| `.env.local` | Local env vars (not committed) |
| `public/manifest.json` | PWA manifest |
| `public/sw.js` | Service worker |
