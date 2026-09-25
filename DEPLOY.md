# Deploy AeroFlux on Hostinger

The public site is a static export. Enquiries, the product desk, and new product pages run as PHP on the same Hostinger account. There is no Vercel step.

## Access the desk

The desk is not linked anywhere on the website.

1. Open `https://aerofluxglobal.com/globaladmin` directly.
2. Sign in with the temporary name `admin` and password `aeroflux`. Replace this before go-live with the name and password hash in `config.php`.
3. Bookmark that URL. Share it only with the people who manage products and enquiries.

`robots.txt` asks crawlers not to index `/globaladmin/` or `/desk-a7k9/`. The old `/desk-a7k9/` address redirects to `/globaladmin/`.

## What runs where

Hostinger only hosts the site and the PHP scripts. Three outside services do the rest:

- **Neon** stores products (`catalog_items`) and enquiries (`rfq_submissions`).
- **Cloudflare R2** stores product images.
- **Resend** sends each quote email to `mail_to`.

Leave `smtp_pass` empty. Resend is used when `resend_api_key` is set. Images go to R2 when the five `r2_` keys are set. Hostinger sometimes blocks PHP from reaching Neon. If the desk says the database is not connected after the keys are filled in, the host is blocking that connection.

## One-time setup

1. In hPanel, download a backup of the current `public_html`.
2. **Git:** hPanel → **Advanced → GIT**. Pull `https://github.com/Vibhubalan/AeroFluxGlobal.git`, branch `main`, into the site folder. On the computer, `npm install` then `npm run build`, and upload the **contents** of `dist/` into `public_html` (`index.html`, `rfq.php`, `item.php`, and `globaladmin/` at the web root). On later uploads, do not delete `uploads/rfq/`.
3. **Neon:** create a project, open the SQL editor, and run `sql/schema.sql`. From the connection string, copy the host (hostname only), database, user, and password. Use port `5432`.
4. **Resend:** create an account, verify `aerofluxglobal.com`, and create an API key. The sending address must be on that domain, for example `sales@aerofluxglobal.com`. The temporary `hostingersite.com` address cannot send mail.
5. **Cloudflare R2:** create a bucket, turn on public access, and create an API token with Object Read & Write. Note the account id, access key, secret, bucket name, and the public URL (the `r2.dev` URL or your custom domain).
6. Copy `public/config.example.php` to `private/aeroflux.php` one level above `public_html`.
7. Fill `db_host`, `db_port`, `db_name`, `db_user`, `db_pass`, `mail_from`, `mail_to`, `resend_api_key`, and the five `r2_` fields.
8. Create the desk password hash and paste it into `admin_password_hash`:

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

1. Desk → Products → **Import current catalog**. This loads the existing items into Neon.
2. Submit a test enquiry on `/contact`. Confirm the row in the Neon SQL editor and the mail in `sales@`.
3. Add a product in the desk (image, pack sizes, description, applications, specification bullets). Open `/category-slug/item-id` and confirm it shows without another build.

## What needs a rebuild

Homepage, about, and layout changes: `npm run build`, then upload `dist/` again.

New or edited products and new enquiries do not need a rebuild. Category grids and featured products read `/api/items.php` after the page loads. Product URLs are served by `item.php`.
