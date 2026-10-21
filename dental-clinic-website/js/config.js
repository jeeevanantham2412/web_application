// Edit this file to change clinic details, hours, and services. Loaded BEFORE main.js and booking.js.
window.CLINIC_CONFIG = {
  name: "SmileCare Dental Clinic",
  city: "Chennai",
  phone: "+91 7010609646",            // PLACEHOLDER - fictional demo number
  email: "gnanapandiyan02@gmail.com",           // PLACEHOLDER
  address: "[Demo address placeholder], Chennai, Tamil Nadu",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=dental+clinic+Chennai",
  slotMinutes: 30,                     // appointment duration
  // Opening hours by weekday (0 = Sunday). null = closed. Format "HH:MM" 24h.
  hours: { 0: null, 1: ["09:00","18:00"], 2: ["09:00","18:00"], 3: ["09:00","18:00"],
           4: ["09:00","18:00"], 5: ["09:00","18:00"], 6: ["09:00","14:00"] },
  services: [
    { id: "checkup",   icon: "🩺", name: "General dental check-up", text: "A thorough exam, X-ray review and a clear plan for your oral health." },
    { id: "cleaning",  icon: "🪥", name: "Teeth cleaning",          text: "Scaling and polishing to remove plaque, tartar and surface stains." },
    { id: "rootcanal", icon: "🦷", name: "Root canal treatment",    text: "Gentle treatment that relieves tooth pain and saves the natural tooth." },
    { id: "braces",    icon: "😁", name: "Braces & orthodontics",   text: "Metal and clear options to straighten teeth and correct your bite." },
    { id: "implants",  icon: "🔩", name: "Dental implants",         text: "A long-lasting replacement for missing teeth that looks and feels natural." },
    { id: "whitening", icon: "✨", name: "Teeth whitening",         text: "Professional whitening for a visibly brighter smile in one visit." }
  ]
};
