import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as simpleIcons from "simple-icons";

const root = process.cwd();
const brandsPath = path.join(root, "src", "data", "brands.json");
const outDir = path.join(root, "public", "brands", "png");
const brands = JSON.parse(fs.readFileSync(brandsPath, "utf8"));

/** @type {Record<string, string>} */
const domains = {
  "ACF-50": "acf50.com",
  Airtech: "airtech.ltd.uk",
  "Allwipe (Allchem)": "allchem.co.uk",
  Ambersil: "ambersil.com",
  "American Fiber & Finishing": "affinc.com",
  Aplix: "aplix.com",
  Armite: "armite.com",
  Astroseal: "astroseal.com",
  Biobor: "biobor.com",
  Bonderite: "bonderite.com",
  Bostik: "bostik.com",
  "Breyden Products": "breyden.com",
  Callington: "callington.com",
  Castrol: "castrol.com",
  "Cerex Advanced Fabrics": "cerexfabrics.com",
  Chemetall: "chemetall.com",
  Chemours: "chemours.com",
  CHT: "cht.com",
  "CRC Industries": "crcindustries.com",
  Davies: "davies.ca",
  Dow: "dow.com",
  "Dykem (ITW)": "dykem.com",
  "Elkem Silicones": "elkem.com",
  Eurochem: "eurochemgroup.com",
  Hexcel: "hexcel.com",
  Huntsman: "huntsman.com",
  Hylomar: "hylomar.com",
  "Indestructible Paints": "indestructible.co.uk",
  "ITW Devcon": "devcon.com",
  Kroil: "kroil.com",
  "Malin Co.": "malinco.com",
  "Microb-Monitor": "microbmonitor.com",
  Nyco: "nycoproducts.com",
  Panolam: "panolam.com",
  Permali: "permali.co.uk",
  "Polyken (Vybond)": "polyken.com",
  Relink: "relinkonline.com",
  "RMP Plastics": "rmpplastics.com",
  Rocol: "rocol.com",
  Sharpie: "sharpie.com",
  "Shell Aviation": "shell.com",
  SkyMark: "skymark.com",
  Socomore: "socomore.com",
  Strutwipe: "strutwipe.com",
  SurTec: "surtec.com",
  Syensqo: "syensqo.com",
  "Tacky Tape": "tackytape.com",
  "WD-40 Company": "wd40.com",
  Winton: "winton.uk.com",
  "Zip-Chem": "zip-chem.com",
};

/** @type {Record<string, string>} */
const simpleIconKeys = {
  "3M": "si3m",
  "Shell Aviation": "siShell",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function wikiLogo(searchTerm) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${searchTerm} logo`,
    gsrnamespace: "6",
    gsrlimit: "5",
    prop: "imageinfo",
    iiprop: "url|size|mime",
    iiurlwidth: "640",
    format: "json",
    origin: "*",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const candidates = Object.values(pages)
    .filter((p) => p.title && /logo/i.test(p.title))
    .flatMap((p) => p.imageinfo ?? [])
    .filter((i) => i.url && !/svg/i.test(i.mime ?? "") || i.thumburl)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const pick = candidates[0];
  return pick?.thumburl ?? pick?.url ?? null;
}

async function duckLogo(domain) {
  const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 400) return null;
  return buf;
}

async function googleFavicon(domain) {
  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 400) return null;
  return buf;
}

async function savePng(slug, input, isBuffer = false) {
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.png`);
  const pipeline = isBuffer ? sharp(input) : sharp(input);
  const { data, info } = await pipeline.ensureAlpha().png().toBuffer({ resolveWithObject: true });
  if (info.width < 48 || info.height < 16) return null;
  fs.writeFileSync(outPath, data);
  return { outPath, width: info.width, height: info.height };
}

async function fromSimpleIcon(key) {
  const icon = simpleIcons[key];
  if (!icon?.svg) return null;
  const svg = icon.svg.replace("<svg", '<svg fill="#ffffff"');
  return savePng("tmp", Buffer.from(svg), true);
}

async function fetchBrand(brand) {
  const slug = slugify(brand.name);
  const outPath = path.join(outDir, `${slug}.png`);
  if (fs.existsSync(outPath)) {
    const meta = await sharp(outPath).metadata();
    return { slug, width: meta.width ?? 120, height: meta.height ?? 32, cached: true };
  }

  if (simpleIconKeys[brand.name]) {
    const icon = simpleIcons[simpleIconKeys[brand.name]];
    if (icon?.svg) {
      const svg = icon.svg.replace("<svg", '<svg fill="#ffffff"');
      const saved = await savePng(slug, Buffer.from(svg), true);
      if (saved) return { slug, width: saved.width, height: saved.height };
    }
  }

  const domain = domains[brand.name];
  if (domain) {
    for (const fn of [googleFavicon, duckLogo]) {
      try {
        const buf = await fn(domain);
        if (buf) {
          const saved = await savePng(slug, buf, true);
          if (saved) return { slug, width: saved.width, height: saved.height };
        }
      } catch {
        /* try next */
      }
    }
  }

  const wiki = await wikiLogo(brand.name.replace(/\([^)]*\)/g, "").trim());
  if (wiki) {
    const res = await fetch(wiki);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const saved = await savePng(slug, buf, true);
      if (saved) return { slug, width: saved.width, height: saved.height };
    }
  }

  return null;
}

async function convertExistingWebp(srcUrl) {
  const rel = srcUrl.replace(/^\//, "");
  const filePath = path.join(root, "public", rel);
  if (!fs.existsSync(filePath)) return null;
  const slug = path.basename(rel, path.extname(rel));
  const pngPath = path.join(outDir, `${slug}.png`);
  if (!fs.existsSync(pngPath)) {
    const { data, info } = await sharp(filePath).ensureAlpha().png().toBuffer({ resolveWithObject: true });
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(pngPath, data);
    return { slug, width: info.width, height: info.height, src: `/brands/png/${slug}.png` };
  }
  const meta = await sharp(pngPath).metadata();
  return { slug, width: meta.width ?? 120, height: meta.height ?? 32, src: `/brands/png/${slug}.png` };
}

const results = {};

for (const brand of brands) {
  if (brand.name.startsWith("Generic")) continue;

  if (brand.src && !brand.label) {
    const converted = await convertExistingWebp(brand.src);
    if (converted) {
      results[brand.name] = { ...converted, from: "webp" };
      console.log("webp->png", brand.name);
    }
    continue;
  }

  if (!brand.label) continue;

  const got = await fetchBrand(brand);
  if (got) {
    results[brand.name] = { ...got, src: `/brands/png/${got.slug}.png` };
    console.log("fetched", brand.name);
  } else {
    console.log("miss", brand.name);
  }
}

const updated = brands.map((brand) => {
  if (brand.name.startsWith("Generic")) return brand;
  const hit = results[brand.name];
  if (!hit) return brand;
  const next = {
    name: brand.name,
    src: hit.src ?? `/brands/png/${hit.slug}.png`,
    width: hit.width,
    height: hit.height,
  };
  return next;
});

fs.writeFileSync(brandsPath, `${JSON.stringify(updated, null, 2)}\n`);
console.log("updated brands.json");
