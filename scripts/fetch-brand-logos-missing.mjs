import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const brandsPath = path.join(root, "src", "data", "brands.json");
const outDir = path.join(root, "public", "brands", "png");
const brands = JSON.parse(fs.readFileSync(brandsPath, "utf8"));

/** @type {Record<string, string>} */
const directUrls = {
  Chemours: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Chemours.svg/960px-Chemours.svg.png",
  Syensqo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Syensqo_Logo_2023.svg/960px-Syensqo_Logo_2023.svg.png",
  "ITW Devcon": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/ITW_logo.svg/512px-ITW_logo.svg.png",
  "Dykem (ITW)": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/ITW_logo.svg/512px-ITW_logo.svg.png",
  "Zip-Chem": "https://www.zip-chem.com/wp-content/uploads/2021/03/Zip-Chem-Logo-1.png",
  Ambersil: "https://www.ambersil.com/wp-content/uploads/2019/03/ambersil-logo.png",
  Callington: "https://www.callington.com/wp-content/themes/callington/images/logo.png",
  "ACF-50": "https://www.acf50.com/wp-content/uploads/2019/01/ACF-50-Logo.png",
  Airtech: "https://www.airtech.ltd.uk/wp-content/uploads/2019/06/Airtech-Logo.png",
  Armite: "https://www.armite.com/images/logo.png",
  Astroseal: "https://www.astroseal.com/wp-content/uploads/logo.png",
  "Cerex Advanced Fabrics": "https://www.cerexfabrics.com/wp-content/uploads/cerex-logo.png",
  "Microb-Monitor": "https://www.microbmonitor.com/images/logo.png",
  Permali: "https://www.permali.co.uk/wp-content/uploads/2018/06/permali-logo.png",
  "Polyken (Vybond)": "https://www.polyken.com/wp-content/uploads/2019/05/Polyken-Logo.png",
  Relink: "https://www.relinkonline.com/wp-content/uploads/logo.png",
  "RMP Plastics": "https://www.rmpplastics.com/wp-content/uploads/logo.png",
  SkyMark: "https://www.skymark.com/images/logo.png",
  Winton: "https://www.winton.uk.com/wp-content/uploads/logo.png",
};

/** @type {Record<string, string>} */
const ogDomains = {
  "ACF-50": "acf50.com",
  Airtech: "airtech.ltd.uk",
  Ambersil: "ambersil.com",
  Armite: "armite.com",
  Astroseal: "astroseal.com",
  Callington: "callington.com",
  "Cerex Advanced Fabrics": "cerexfabrics.com",
  "Microb-Monitor": "microbmonitor.com",
  Permali: "permali.co.uk",
  "Polyken (Vybond)": "polyken.com",
  Relink: "relinkonline.com",
  "RMP Plastics": "rmpplastics.com",
  SkyMark: "skymark.com",
  Winton: "winton.uk.com",
  "Zip-Chem": "zip-chem.com",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function saveFromBuffer(slug, buf) {
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.png`);
  const { data, info } = await sharp(buf).ensureAlpha().png().toBuffer({ resolveWithObject: true });
  if ((info.width ?? 0) < 40 || (info.height ?? 0) < 12) return null;
  fs.writeFileSync(outPath, data);
  return { outPath, width: info.width, height: info.height, src: `/brands/png/${slug}.png` };
}

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "AeroFluxSiteBot/1.0 (brand strip; contact@aeroflux.com)" },
    redirect: "follow",
  });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function ogImage(domain) {
  try {
    const res = await fetch(`https://${domain}/`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AeroFlux/1.0)" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match =
      html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ??
      html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
    if (!match?.[1]) return null;
    return fetchUrl(match[1].replace(/&amp;/g, "&"));
  } catch {
    return null;
  }
}

const updates = {};

for (const brand of brands) {
  if (!brand.label) continue;

  const slug = slugify(brand.name);
  const outPath = path.join(outDir, `${slug}.png`);
  if (fs.existsSync(outPath)) {
    const meta = await sharp(outPath).metadata();
    updates[brand.name] = {
      src: `/brands/png/${slug}.png`,
      width: meta.width ?? 120,
      height: meta.height ?? 32,
    };
    continue;
  }

  let saved = null;

  if (directUrls[brand.name]) {
    const buf = await fetchUrl(directUrls[brand.name]);
    if (buf) saved = await saveFromBuffer(slug, buf);
  }

  if (!saved && ogDomains[brand.name]) {
    await sleep(1500);
    const buf = await ogImage(ogDomains[brand.name]);
    if (buf) saved = await saveFromBuffer(slug, buf);
  }

  if (saved) {
    updates[brand.name] = saved;
    console.log("ok", brand.name);
  } else {
    console.log("still text", brand.name);
  }
}

const next = brands.map((brand) => {
  if (!brand.label) return brand;
  const hit = updates[brand.name];
  if (!hit) return brand;
  return { name: brand.name, src: hit.src, width: hit.width, height: hit.height };
});

fs.writeFileSync(brandsPath, `${JSON.stringify(next, null, 2)}\n`);
