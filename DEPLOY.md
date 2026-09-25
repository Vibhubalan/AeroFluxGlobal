# Deploy AeroFlux on Hostinger

The public site is a static export. Enquiries, the product desk, and new product pages run as PHP on the same Hostinger account. There is no Vercel step.

## Access the desk

The desk is not linked anywhere on the website.

1. Open `https://aerofluxglobal.com/globaladmin` directly.
2. Sign in with the temporary name `admin` and password `aeroflux`. Replace this before go-live with the name and password hash in `config.php`.
3. Bookmark that URL. Share it only with the people who manage products and enquiries.

`robots.txt` asks crawlers not to index `/globaladmin/` or `/desk-a7k9/`. The old `/desk-a7k9/` address redirects to `/globaladmin/`.

## One-time Hostinger setup

1. In hPanel, download a backup of the current `public_html`.
2. Databases: create a MySQL database and user. Grant all privileges on that database.
3. phpMyAdmin: import `sql/schema.sql`.
4. Emails: create `sales@aerofluxglobal.com`. In DNS, keep Hostinger MX and SPF.
5. Copy `public/config.example.php` to `public/config.php` (or to `private/aeroflux.php` one level above `public_html`).
6. Fill database name, user, password, `resend_api_key`, and the R2 image keys. Quotes are stored in MySQL (`rfq_submissions`) and mailed to `mail_to` through Resend. Product images upload to R2 when those keys are set.
7. Create the desk password hash and paste it into `admin_password_hash`:

```
php -r "echo password_hash('your-password', PASSWORD_DEFAULT), PHP_EOL;"
```

## Publish the site

```
npm install
npm run build
```

Upload the **contents** of `dist/` into `public_html` (so `index.html`, `rfq.php`, `item.php`, and `globaladmin/` sit at the web root). On later uploads, overwrite the static files and do not delete `uploads/rfq/` or `images/products/`.

## After the first upload

1. Desk → Products → **Import current catalog**. This loads the existing items into MySQL.
2. Submit a test enquiry on `/contact`. Confirm the row in phpMyAdmin and the mail in `sales@`.
3. Add a product in the desk (image, pack sizes, description, applications, specification bullets). Open `/category-slug/item-id` and confirm it shows without another build.

## What needs a rebuild

Homepage, about, and layout changes: `npm run build`, then upload `dist/` again.

New or edited products and new enquiries do not need a rebuild. Category grids and featured products read `/api/items.php` after the page loads. Product URLs are served by `item.php`.
