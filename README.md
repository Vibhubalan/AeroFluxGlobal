# AeroFlux Global

Static Astro site for Hostinger shared hosting. Product wording, brand logos, emails, and phone numbers match the current aerofluxglobal.com site.

## Build

```bash
npm install
npm run build
```

Upload the contents of `dist/` into Hostinger `public_html` (include `rfq.php`, `.htaccess`, and `.user.ini`).

The RFQ form posts to `/rfq.php`, which emails `sales@aerofluxglobal.com`. If an upload fails, set `upload_max_filesize` and `post_max_size` in hPanel to at least 8M. `.user.ini` already requests that.

`npm run dev` previews the pages. The PHP mailer only runs on Hostinger.
