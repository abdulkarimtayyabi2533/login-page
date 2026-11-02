// Shared auth logic for the Login Page.
// Accounts live in the browser (localStorage), passwords are SHA-256 hashed.
// Email delivery uses EmailJS — the website's own mail service, exactly like
// professional websites: the site owner connects their email ONCE on
// emailjs.com, and then the site itself sends mail to whoever signs up.
// Visitors are never asked to connect anything.

const USERS_KEY = "lp_users";
const SESSION_KEY = "lp_session";
const RESET_KEY = "lp_reset";

const EMAIL_CONFIG = {
  enabled: false, // set to true after EmailJS setup (see README)
  publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId: "YOUR_SERVICE_ID",
  welcomeTemplateId: "YOUR_WELCOME_TEMPLATE_ID",
  resetTemplateId: "YOUR_RESET_TEMPLATE_ID",
};

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password) {
  if (crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0;
  for (const c of password) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return "fallback-" + h;
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = "form-msg " + type;
  el.hidden = false;
}

function hideMsg(el) {
  el.hidden = true;
}

// Sends a real email through the site's own mail service (EmailJS).
// Returns true only when it was really delivered.
async function deliverEmail(templateId, params) {
  if (!EMAIL_CONFIG.enabled) return false;
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAIL_CONFIG.serviceId,
        template_id: templateId,
        user_id: EMAIL_CONFIG.publicKey,
        template_params: params,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Show/hide password toggles (any page using .eye buttons).
document.querySelectorAll(".eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.textContent = show ? "🙈" : "👁";
  });
});
