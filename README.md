# Pacific Business Park — site

Static HTML/CSS/JS, no build step. Deploys via cPanel File Manager to `public_html/`, same pattern as other ATL-chapter sites.

## 2026-08-18 — full tenant populate pass

- Store directory rebuilt as data-driven: `assets/stores-data.js` holds all 17 confirmed tenants, `assets/site.js` renders cards, builds the category filter, and runs the search/A–Z filter — replacing the old 5 hand-written `<article>` cards.
- Extracted the old inline `<script>` into `assets/stores-data.js` + `assets/site.js`. Not cosmetic — a sibling ATL project (Elysian Labels) shipped dead JS on a live host because a server-level CSP silently blocked inline scripts. External same-origin files satisfy `script-src 'self'` if a CSP ever gets added here. See `SPEC.md` §0.1.
- 12 brand-new tenants added: Golden Shilajit, Miller's Travel & Tours, Plain Fabrics & Trim, Zaira – Blooming Flower, The Nappy Warehouse, Pagemasters Graphix, Detail Corner, Vintage Barbershop, Cozy Collection, Curtains On Us, The Farm Fruit and Veg, Milk Up.
- Real signage-based logos added for the 3 previously-placeholder tenants: EPC, The Gadget Shop, Siyabonga Builders.
- Category list expanded from 5 to 13 to fit the real tenant mix (Health & Wellness, Travel & Services, Fabric & Trims, Florist & Gifts, Baby & Family, Printing & Signage, Automotive Care, Home & Decor, plus the original 5 relabeled slightly — Siyabonga is now "Hardware & Furniture", barbershop folded into "Beauty & Personal Care").
- Hero stat "5+ Confirmed" → "17 Confirmed" (factual count fix only — the "Opening Day: 25 April 2026" framing is untouched pending client confirmation of real launch status, see `SPEC.md` §1.2/§5.1).

### Known rough edges (by design — see instructions this pass was built under)

- **Logo images in `images/stores/` are rough crops of phone photos of physical signage taken on today's store visit** (`Pacific business park stores.zip`), not final digitized assets. Saeed is digitizing signage properly over the following weekend — these crops exist so the site is fully populated today, not to be final. Swap in real digitized logos as they land; the `logo` field in `assets/stores-data.js` is the only thing that needs updating per store.
- Two tenants (The Farm Fruit and Veg, Milk Up) have no photo at all from this visit — render as text placeholders (`.store-placeholder`) same as the pre-populate pattern.
- Descriptions are short and drawn directly from what was legible on each store's signage — a few (Cozy Collection especially) are generic because the signage itself didn't show products/services. Flag for a proper description pass once Saeed's intake trip data comes in (see `STORE-INTAKE.md`).
- Cozy Collection's category ("Home & Decor") is a guess — signage showed no products/services, only the name and phone number.

### Scaffolding for the future delivery/POS build (SPEC.md §8.1)

`assets/stores-data.js` is a plain JS array keyed by `id` specifically so a future Sixty60-style delivery layer can extend each record (e.g. `products`, `posId`, `deliveryRadius`) without touching the rendering code in `assets/site.js`. Nothing POS-related is built yet — this is just the data shape decision made now so it doesn't need a rewrite later.

### Security

`.htaccess` sets HSTS, nosniff, SAMEORIGIN, referrer-policy, forces HTTPS, and blocks `.bak`/`.old`/`.orig`/`.md` from being served. **Deliberately no CSP** — see the comment at the top of `.htaccess` and `SPEC.md` §0.1 before adding one, especially once the social embeds (§2.4) are wired in.

## 2026-08-18, later same day — dark/light mode, 22→23 stores, CSP fix

- System-aware dark/light mode added (§9 of `SPEC.md`), 9-step tonal palette formalized into fixed brand tokens + adaptive semantic tokens. WCAG-verified via script, not eyeballed.
- CSP note above is now stale: the live host (shares an account with axiel.co.za) sends an account-wide default CSP that blocked the Instagram embed and Google Maps iframe. Fixed with an explicit per-site override in `.htaccess` — see the comment at the top of that file for the full story.
- 5 more tenants added (Elysian Labels, MilkUp Ice Creamery — corrected from "Milk Up", Crumble Corner, Zama Zama Auto Fitment Centre, Colorado – Canvas & Comfort, Snyders Packaging), bringing the count to 22.

## `concept-b-canalwalk` branch — Canal Walk-inspired redesign, not merged to `main`

Separate branch, built on Saeed's explicit request after reviewing `concept-B-canalwalk-spec.md` (project root) — a real headless-browser inspection of canalwalk.co.za, not secondhand. **This branch is a different concept from what's live on `main`/the real cPanel host — do not merge without an explicit ask**, same standing policy as every other merge this project.

What changed on this branch: editorial hero (bold headline, styled gradient placeholder — no real photography exists yet, glass-panel text treatment, pill+arrow CTA), shallow top nav (4 items) with a genuinely deep 3-column footer, a single-box crossfade store showcase (reusing the ATLAS Web OS badge-ring pattern), Events promoted front-loaded right after the showcase, a compact one-line Pacific Roadhouse specials strip (PBP's only restaurant tenant — was missing from `stores-data.js` entirely, added with `featured:true`), a unit-reference grid (only the 11 stores with a confirmed unit number — not a fabricated full map), and Directory demoted further down the page. 23 stores total (added Pacific Roadhouse). Verified with Playwright screenshots at 1440px/390px × light/dark — zero console errors across all four.

Per-store detail pages are explicitly deferred to v2 (Saeed's own call). Concept C (Waterfront) is a separate future build, not started.

## Open items

See `SPEC.md` (in the parent `pacific-business-park/` folder) §5 for the full open-questions list — real opening/launch status, canonical logo confirmation, Instagram/TikTok account ownership, and the CMS-vs-static decision for future tenant updates are all still pending client input.
