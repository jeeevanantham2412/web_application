# SmileCare Dental Clinic, Chennai — Demo Website
Fictional clinic website with a localStorage booking demo. Plain HTML/CSS/JS; no build step, backend, or paid service.

## Structure
`index/services/about/appointment/contact.html` in the root; `css/style.css`, `css/responsive.css`; `js/config.js` (edit clinic details, hours, `slotMinutes`, services), `js/main.js` (header/footer, service cards, contact form), `js/booking.js` (booking logic); `assets/images/` (add your own photos). Script order: config → main → booking. All paths are relative, so it works under a GitHub Pages sub-path.

## Run locally
1. Install VS Code, then the **Live Server** extension. 2. File > Open Folder > `dental-clinic-website`. 3. Right-click `index.html` > Open with Live Server.

## Deploy to GitHub Pages
1. Create a new GitHub repository (public). 2. Upload all files (keep the folder structure; `index.html` at the root). 3. Settings > Pages > Source: Deploy from a branch > `main` / `(root)` > Save. 4. After a minute the site appears at the URL shown on that Pages screen (your username and repo name, not guessed here).
**Troubleshooting:** unstyled page = wrong `css/` path or case mismatch (GitHub is case-sensitive); JS not working = check the browser console (F12) and the script order; 404 = `index.html` not in the root; changes not showing = hard refresh (Ctrl+Shift+R).

## Manual test checklist
- [ ] All 5 pages open; every nav link works (also on mobile menu)
- [ ] Each service card's Book button opens appointment page with that treatment selected
- [ ] Empty booking form shows errors; invalid mobile (e.g. 12345) rejected; bad email rejected
- [ ] Past dates blocked; Sunday shows "closed"; Saturday ends at 14:00
- [ ] Changing date updates slots; past times today are disabled
- [ ] Valid booking shows confirmation with reference
- [ ] Refresh: booking still listed; that slot now disabled
- [ ] Cancel removes the booking and frees the slot; Reset clears all
- [ ] Contact form validates and says demo-only
- [ ] Layout OK at ~375px width; browser console has no errors
- [ ] Works at the nested GitHub Pages URL

## Known limitations
localStorage is per-browser: no shared availability, no cross-device double-booking prevention, no patient accounts, no real emails/SMS, and the contact form sends nothing. Anyone can edit their stored data. Header/footer/service cards are rendered by JavaScript. No photos are included (icons/emoji used); add images to `assets/images/` with descriptive alt text.

## Needed before real clinic use
Backend + database for shared availability; authentication and admin dashboard; email/SMS confirmations; privacy policy, consent and data-protection compliance (India DPDP Act); secure hosting/HTTPS; real photos, contact details, and clinic-approved content; accessibility and security review; rate limiting/spam protection.
