// Appointment logic. Requires config.js. Data lives ONLY in this browser's localStorage (demo).
(function () {
  const C = window.CLINIC_CONFIG, KEY = "smilecare_demo_bookings";
  const $ = id => document.getElementById(id);
  const form = $("bookingForm");
  if (!form) return;

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = list => localStorage.setItem(KEY, JSON.stringify(list));
  const pad = n => String(n).padStart(2, "0");
  const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmt = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const serviceName = id => (C.services.find(s => s.id === id) || {}).name || id;

  // Build the slot list for a date from configurable opening hours.
  function slotsFor(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const hours = C.hours[new Date(y, m - 1, d).getDay()];
    if (!hours) return [];
    const out = [], end = toMin(hours[1]);
    for (let t = toMin(hours[0]); t + C.slotMinutes <= end; t += C.slotMinutes) out.push(fmt(t));
    return out;
  }

  // Booked slots (one chair assumed) and already-passed times today are disabled.
  function renderSlots() {
    const date = form.date.value, box = $("slots"), hint = $("slotHint");
    box.innerHTML = "";
    if (!date) { hint.textContent = "Choose a date to see available times."; return; }
    if (date < todayStr()) { hint.textContent = "Past dates cannot be booked."; return; }
    const slots = slotsFor(date);
    if (!slots.length) { hint.textContent = "The clinic is closed on this day. Please pick another date."; return; }
    const taken = load().filter(b => b.date === date).map(b => b.time);
    const now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
    let free = 0;
    slots.forEach(t => {
      const off = taken.includes(t) || (date === todayStr() && toMin(t) <= nowMin);
      if (!off) free++;
      box.insertAdjacentHTML("beforeend", `<label class="slot${off ? " off" : ""}"><input type="radio" name="time" value="${t}"${off ? " disabled" : ""}><span>${t}</span></label>`);
    });
    hint.textContent = free ? `${free} slot(s) available.` : "All slots are taken on this date. Please pick another date.";
  }

  function newReference() {
    const used = load().map(b => b.ref);
    let ref;
    do { ref = "SC-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).toUpperCase().slice(2, 4); } while (used.includes(ref));
    return ref;
  }

  function validate() {
    const e = {}, v = form.elements;
    if (v.name.value.trim().length < 2) e.name = "Enter the patient's full name.";
    const mobile = v.mobile.value.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
    if (!/^[6-9]\d{9}$/.test(mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number (starts with 6-9).";
    if (v.email.value.trim() && !/^\S+@\S+\.\S+$/.test(v.email.value.trim())) e.email = "Enter a valid email or leave it blank.";
    if (!v.service.value) e.service = "Select a treatment.";
    if (!v.date.value) e.date = "Choose a date."; else if (v.date.value < todayStr()) e.date = "Choose today or a future date.";
    else if (!slotsFor(v.date.value).length) e.date = "The clinic is closed on this day.";
    if (!form.querySelector('input[name="time"]:checked')) e.time = "Select a time slot.";
    if (!v.consent.checked) e.consent = "You must agree to continue.";
    ["name", "mobile", "email", "service", "date", "time", "consent"].forEach(k => { $("err-" + k).textContent = e[k] || ""; });
    return { ok: !Object.keys(e).length, mobile };
  }

  function renderBookings() {
    const list = load().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), box = $("bookingList");
    if (!list.length) { box.innerHTML = '<p class="muted">No demo bookings yet. Book an appointment and it will appear here.</p>'; return; }
    box.innerHTML = list.map(b => `<div class="booking"><div><strong>${esc(serviceName(b.service))}</strong><br>${esc(b.date)} at ${esc(b.time)} — ${esc(b.name)}<br><small>Ref: ${esc(b.ref)}</small></div>
      <button type="button" class="btn small ghost" data-cancel="${esc(b.ref)}">Cancel</button></div>`).join("");
  }

  // form.addEventListener("submit", ev => {
  //   ev.preventDefault();
  //   const { ok, mobile } = validate();
  //   if (!ok) { $("formStatus").textContent = "Please fix the highlighted fields."; return; }
  //   const v = form.elements, time = form.querySelector('input[name="time"]:checked').value, list = load();
  //   // Business rule: one booking per slot in this browser's stored records.
  //   if (list.some(b => b.date === v.date.value && b.time === time)) { $("formStatus").textContent = "That slot was just taken. Please choose another."; renderSlots(); return; }
  //   const booking = { ref: newReference(), name: v.name.value.trim(), mobile, email: v.email.value.trim(), service: v.service.value, date: v.date.value, time, notes: v.notes.value.trim() };
  //   list.push(booking); save(list);
  //   $("confirmation").hidden = false;
  //   $("confirmation").innerHTML = `<h2>Booking request received</h2><p>Treatment: <strong>${esc(serviceName(booking.service))}</strong><br>Date: <strong>${esc(booking.date)}</strong><br>Time: <strong>${esc(booking.time)}</strong><br>Reference: <strong>${esc(booking.ref)}</strong></p><p class="muted">Demo only — saved in your browser, not sent to a clinic.</p>`;
  //   $("confirmation").focus();
  //   $("formStatus").textContent = "";
  //   form.reset(); renderSlots(); renderBookings();
  // });



form.addEventListener("submit", async ev => {
  ev.preventDefault();

  const { ok, mobile } = validate();

  if (!ok) {
    $("formStatus").textContent =
      "Please fix the highlighted fields.";
    return;
  }

  const v = form.elements;
  const selectedTime =
    form.querySelector('input[name="time"]:checked');

  if (!selectedTime) {
    $("formStatus").textContent =
      "Please select an appointment time.";
    return;
  }

  const time = selectedTime.value;
  const list = load();

  if (list.some(b => b.date === v.date.value && b.time === time)) {
    $("formStatus").textContent =
      "That slot was just taken. Please choose another.";
    renderSlots();
    return;
  }

  const booking = {
    ref: newReference(),
    name: v.name.value.trim(),
    mobile,
    email: v.email.value.trim(),
    service: v.service.value,
    date: v.date.value,
    time,
    notes: v.notes.value.trim()
  };

  // Save locally first.
  list.push(booking);
  save(list);

  // Show confirmation immediately.
  $("confirmation").hidden = false;
  $("confirmation").innerHTML = `
    <h2>Booking request received</h2>
    <p>
      Treatment: <strong>${esc(serviceName(booking.service))}</strong><br>
      Date: <strong>${esc(booking.date)}</strong><br>
      Time: <strong>${esc(booking.time)}</strong><br>
      Reference: <strong>${esc(booking.ref)}</strong>
    </p>
    <p class="muted" id="emailStatus" role="status">
      Sending email notification...
    </p>
  `;

  $("confirmation").focus();
  $("formStatus").textContent = "";

  // Attempt email delivery without losing the local booking.
  try {
    await sendSMTPEmail(booking);

    $("emailStatus").textContent =
      "Email notification accepted by the mail server.";
  } catch (error) {
    console.error("Email notification failed:", error);

    $("emailStatus").textContent =
      "Booking saved in this browser, but email failed. Please contact the clinic.";
  }

  form.reset();
  renderSlots();
  renderBookings();
});











  form.date.addEventListener("change", renderSlots);
  form.date.min = todayStr();
  $("bookingList").addEventListener("click", e => {
    const ref = e.target.dataset.cancel; if (!ref) return;
    save(load().filter(b => b.ref !== ref)); renderSlots(); renderBookings();
  });
  $("resetDemo").addEventListener("click", () => {
    if (confirm("Delete all demo bookings in this browser?")) { localStorage.removeItem(KEY); $("confirmation").hidden = true; renderSlots(); renderBookings(); }
  });

  form.service.innerHTML = '<option value="">Select a treatment</option>' + C.services.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  const pre = new URLSearchParams(location.search).get("service");
  if (pre && C.services.some(s => s.id === pre)) form.service.value = pre;
  renderSlots(); renderBookings();

///////////SMTP Email Sending Logic///////////
const API_BASE_URL = "https://web-application-1-36hi.onrender.com";
async function sendSMTPEmail(booking) {
  const response = await fetch(
    `${API_BASE_URL}/api/send-appointment-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ref: booking.ref,
        name: booking.name,
        mobile: booking.mobile,
        email: booking.email,
        service: serviceName(booking.service),
        date: booking.date,
        time: booking.time,
        notes: booking.notes
      })
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to send appointment email."
    );
  }

  return result;
}




})();
