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

## Open items

See `SPEC.md` (in the parent `pacific-business-park/` folder) §5 for the full open-questions list — real opening/launch status, canonical logo confirmation, Instagram/TikTok account ownership, and the CMS-vs-static decision for future tenant updates are all still pending client input.
