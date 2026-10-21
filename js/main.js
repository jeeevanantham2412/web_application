// Shared UI: header, footer, service cards, contact form. Requires config.js.
(function () {
  const C = window.CLINIC_CONFIG;
  const pages = [["index.html","Home"],["services.html","Services"],["about.html","About"],["appointment.html","Book Appointment"],["contact.html","Contact"]];
  const current = location.pathname.split("/").pop() || "index.html";

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `<div class="wrap bar"><a class="logo" href="index.html"><span aria-hidden="true">🦷</span> SmileCare<small>Dental Clinic, ${C.city}</small></a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav id="nav" aria-label="Main">${pages.map(([h,t]) => `<a href="${h}"${h===current?' aria-current="page"':""}>${t}</a>`).join("")}</nav></div>`;
    const btn = header.querySelector(".nav-toggle");
    btn.addEventListener("click", () => {
      const open = header.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
  }
  const footer = document.getElementById("site-footer");
  if (footer) footer.innerHTML = `<div class="wrap"><p><strong>${C.name}</strong> — fictional demo clinic for portfolio use. Contact details are placeholders. No real patient data is collected.</p>
    <p>&copy; ${new Date().getFullYear()} Demo project</p></div>`;

  // Service cards: <div data-services data-limit="3"></div>
  document.querySelectorAll("[data-services]").forEach(box => {
    const list = C.services.slice(0, Number(box.dataset.limit) || C.services.length);
    box.innerHTML = list.map(s => `<article class="card"><div class="icon" aria-hidden="true">${s.icon}</div>
      <h3>${s.name}</h3><p>${s.text}</p>
      <a class="btn small" href="appointment.html?service=${s.id}">Book ${s.name.toLowerCase()}</a></article>`).join("");
  });

  // Fill placeholders from config
  document.querySelectorAll("[data-fill]").forEach(el => { el.textContent = C[el.dataset.fill]; });
  document.querySelectorAll("[data-tel]").forEach(el => { el.href = "tel:" + C.phone.replace(/\s/g, ""); });
  document.querySelectorAll("[data-maps]").forEach(el => { el.href = C.mapsUrl; });

  // Contact form (demo only: nothing is sent anywhere)
  const cf = document.getElementById("contactForm");
  if (cf) cf.addEventListener("submit", e => {
    e.preventDefault();
    const f = cf.elements, errs = {};
    if (f.cname.value.trim().length < 2) errs.cname = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.cemail.value.trim())) errs.cemail = "Enter a valid email address.";
    if (f.cmessage.value.trim().length < 10) errs.cmessage = "Write at least 10 characters.";
    ["cname","cemail","cmessage"].forEach(k => { document.getElementById("err-"+k).textContent = errs[k] || ""; });
    const out = document.getElementById("contactResult");
    if (Object.keys(errs).length) { out.textContent = ""; return; }
    out.textContent = "Demo only: your message passed validation but was not sent anywhere.";
    cf.reset();
  });
})();
