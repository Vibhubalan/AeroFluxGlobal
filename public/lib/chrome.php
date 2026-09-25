<?php
declare(strict_types=1);

function aero_page_start(string $title): void
{
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . aero_h($title) . '</title>';
    echo '<link rel="icon" href="/favicon.svg">';
    echo '<style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #f3eee6; font: 16px/1.65 ui-sans-serif, system-ui, sans-serif;
        background: #0c100e radial-gradient(70% 55% at 0% -8%, rgba(224,122,74,.28), transparent 52%),
        radial-gradient(55% 48% at 100% 8%, rgba(72,128,148,.24), transparent 54%),
        linear-gradient(115deg, #101816 0%, #162220 42%, #141210 100%); background-attachment: fixed; }
      a { color: inherit; }
      header, footer { padding: 1.25rem clamp(1.25rem, 5vw, 5rem); }
      header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(243,238,230,.12); }
      header a { text-decoration: none; letter-spacing: .14em; font-size: .78rem; }
      .wrap { padding: 3rem clamp(1.25rem, 5vw, 5rem) 4rem; }
      .crumb { font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; color: #a39b90; }
      .crumb a:hover { color: #e07a4a; }
      .grid { display: grid; gap: 2.5rem; align-items: start; }
      @media (min-width: 960px) { .grid { grid-template-columns: 1fr 1fr; } }
      .shot { min-height: 20rem; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,.1); border-radius: 1rem; padding: 2rem; }
      .shot img { max-height: 28rem; width: auto; object-fit: contain; }
      h1 { margin: 0; font-size: clamp(2rem, 4vw, 3.2rem); letter-spacing: -.03em; line-height: 1.05; font-weight: 600; }
      label span { display: block; margin-bottom: .5rem; }
      select, input, textarea { width: 100%; background: transparent; color: #f3eee6; border: 1px solid rgba(255,255,255,.15); border-radius: 8px; padding: .7rem .85rem; font: inherit; }
      .btn { display: inline-block; margin-top: 2rem; background: #e07a4a; color: #1a100c; text-decoration: none; font-weight: 600; padding: .75rem 1.2rem; border-radius: 10px; }
      h2 { margin: 1.5rem 0 0; font-size: .95rem; }
      p, li { color: #a39b90; }
      ul { margin: .4rem 0 0; padding-left: 1.2rem; }
      footer { border-top: 1px solid rgba(243,238,230,.1); color: #7a746c; font-size: .8rem; }
    </style></head><body>';
    echo '<header><a href="/">AEROFLUX GLOBAL</a><a href="/portfolio">Products</a></header><main class="wrap">';
}

function aero_page_end(): void
{
    echo '</main><footer>AeroFlux Global · sales@aerofluxglobal.com</footer></body></html>';
}
