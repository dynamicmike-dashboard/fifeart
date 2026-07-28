# TASK: IMAGE UPLOAD
"Read SYSTEM_PROTOCOL.md. Read PROJECT_MANIFEST.md. Debug why images uploaded via the admin panel show as saved (record created, 201 from upload) but `getThumbUrl()` returns empty when the record is fetched. Check the format returned by `POST /api/table/{tableId}/record/{recordId}/{fieldId}/uploadAttachment` vs what `getThumbUrl` expects from `painting.fields.image[0]`. Fix the `{ id }` reference or upload flow so images display."

# TASK: REORDER
"Read SYSTEM_PROTOCOL.md. Read PROJECT_MANIFEST.md. Debug why `updateOrder()` batch PATCH returns 200 but the `order` field values don't actually change in Teable. Check the actual Teable response, verify the `order` field ID (`fldj9A8Ssz4vCU2vXy1`), and add console.error or alert to surface the real error."

# TASK: SMTP SETUP
"Read SYSTEM_PROTOCOL.md. Read PROJECT_MANIFEST.md. Guide the user to create a Gmail App Password at https://myaccount.google.com/apppasswords, then set `SMTP_PASS` and `EMAIL_ENABLED=true` in Vercel Dashboard → dynamicmikes-projects/fifeart → Environment Variables. Test by submitting the Enquiry form."

# TASK: ADD METADATA
"Read SYSTEM_PROTOCOL.md. Read PROJECT_MANIFEST.md. Open the admin panel at /admin. For each painting in the list that has a raw filename as title, fill in: title, medium, dimensions, priceGBP, status, orientation, subjects, tags. Use reasonable defaults based on the image content."

# TASK: CUSTOM DOMAIN
"Read SYSTEM_PROTOCOL.md. Read PROJECT_MANIFEST.md. Guide the user to add `www.fifeart.com` as a custom domain in Vercel Dashboard → dynamicmikes-projects/fifeart → Domains. DNS already points to Vercel nameservers, so it should just need to be added in the dashboard."

# TASK: NEW FEATURE
"Read SYSTEM_PROTOCOL.md. Read PROJECT_MANIFEST.md. Read `lib/teable.ts`, relevant API routes under `app/api/`, and related components. Implement [feature description]. Use the same patterns: fieldKeyType=name, cache=no-store, force-dynamic, cookie auth for admin routes."
