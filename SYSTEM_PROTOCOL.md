# SYSTEM PROTOCOL — FifeArt

## ROLE
- Senior full-stack engineer for Nancy Berry's FifeArt portfolio site
- Max efficiency: no fluff, no preambles, output only code changes or concise answers

## TECH STACK
- **Framework:** Next.js 16 (App Router), TypeScript
- **CMS:** Teable (Airtable-compatible REST API) — headless
- **Hosting:** Vercel (production at https://fifeart.com)
- **Image:** next/image with WebP format, sharp for upload conversion
- **Email:** nodemailer + Gmail SMTP (configured — App Password for `nancyberrykdy@gmail.com`)
- **Auth:** Cookie-based admin session (`admin_session`)

## KEY ENV VARS (Vercel project: dynamicmikes-projects/fifeart)
- `TEABLE_API_URL` = https://app.teable.ai
- `TEABLE_BASE_ID` = bseGuvyJAPGIYGv0WMy
- `TEABLE_TABLE_ID` = tblJgmGGI5mWgwRds65 (paintings)
- `TEABLE_ABOUT_TABLE_ID` = tblG1JCrNBFlRslVa4J (about content)
- `TEABLE_API_TOKEN` = teable_accJXOAbpIeZybn7W1C_uwuwV5X02+qBkxPJ//3XPwbq2Yev2lYaKXY12nyc7oE=
- `ADMIN_PASSWORD` = Tiffany201800
- `SITE_URL` = https://www.fifeart.com
- `SMTP_HOST/PORT/USER/PASS` — Gmail SMTP (PASS needs App Password)

## DATABASE — Teable Tables
### paintings (tblJgmGGI5mWgwRds65)
Fields: title, image (attachment), medium, dimensions, priceGBP, status (available/sold/not_for_sale), orientation (landscape/portrait/square), subjects (multi-select), tags, order, createdAt, updatedAt, id (autonumber)
~72 records, ~60 active paintings

### about (tblG1JCrNBFlRslVa4J — repurposed "FifeArt app users")
Fields: title, story (longText), image (attachment)
Single record for About the Artist page

## KEY FIELD IDs
- `image` on paintings: `fld3Qxe2JyFvjD5x42U`
- `image` on about: `fldezzdRONvqtLpbFE5`
- `order` on paintings: `fldj9A8Ssz4vCU2vXy1`

## RESOLVED
- Gmail SMTP — App Password configured, `SMTP_USER=nancyberrykdy@gmail.com`, emails to both nancyberrykdy + dynamicmike+fifeart

## PENDING 2026-09-06
- Upload `500 libvips` fixed via bypass sharp, `201` + alert works — commit `fda9753`/`3711118`
- Gallery still labels-only: S3 `AccessDenied` on presigned URLs, proxy added `app/api/image` via `POST /api/base/{baseId}/sign-attachment-urls` with `302` redirect (commit `e0f8841`), manual fetch `table/Sz1t3IuLesBa` via proxy returns `200` but live uploads still not appearing — needs Vercel logs for `/api/image` and recent record token/path verification

## DEPLOYMENT COMMANDS
- `npx next build` — local build
- `npx vercel --prod --yes` — deploy to production
- Vercel project: `dynamicmikes-projects/fifeart`
- GitHub: `https://github.com/dynamicmike-dashboard/fifeart.git`

## CONVENTIONS
- Field names use `fieldKeyType=name` in all Teable API calls
- **SCOPE RESTRICTION**: Only operate within `F:\Mike d drive\Mike Webs\mAIstermind.com\projects\FifeArt website 26jul26\fifeart-github`. Do NOT create repos, write outside this folder, or use browser automation without explicit approval.
- Upload uses record-level endpoint: `POST /api/table/{tableId}/record/{recordId}/{fieldId}/uploadAttachment` — now bypasses sharp (Vercel libvips missing), uploads original
- Gallery uses `GET /api/image?token=&path=` → `POST /api/base/{baseId}/sign-attachment-urls` → `302` to fresh S3 URL (6d expiry, cache 1h), `unoptimized` on `next/image` to avoid optimizer stripping query
- Image reference: `{ id: uploadResponse.id }` (not token, not full object)
- All pages dynamic (`force-dynamic` or `cache: "no-store"`) to avoid stale presigned URLs
- Admin auth: cookie-based, checked in each API route — requires `credentials: include` + `sameSite: none`
