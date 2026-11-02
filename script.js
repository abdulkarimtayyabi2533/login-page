// Login Page — front-end authentication demo.
// Accounts are stored in the browser (localStorage) with SHA-256 hashed
// passwords. This is a demo-grade auth flow, not production security.
// The "email" panel previews the exact email that would be delivered once
// a real email service is connected.

const USERS_KEY = "lp_users";
const SESSION_KEY = "lp_session";
const RESET_KEY = "lp_reset";

// ---------- Email delivery (the real-website way) ----------
// Real websites never ask visitors to connect Gmail. The WEBSITE sends
// mail from its own mail service. Here that service is EmailJS:
// the site owner connects their email ONCE on emailjs.com, then every
// visitor automatically gets real emails — no visitor ever connects
// anything. Until the keys below are filled in, the page shows the
// exact email in the on-page preview instead, so the flow still works.
const EMAIL_CONFIG = {
  enabled: false, // set to true after EmailJS setup (see README)
  publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId: "YOUR_SERVICE_ID",
  welcomeTemplateId: "YOUR_WELCOME_TEMPLATE_ID",
  resetTemplateId: "YOUR_RESET_TEMPLATE_ID",
};

async function sendRealEmail(templateId, params) {
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
  if (!res.ok) throw new Error("EmailJS send failed: " + res.status);
}

// Sends the email for real when configured, otherwise shows the exact
// email in the on-page preview. Returns true when really delivered.
async function deliverEmail(to, subject, body, templateId, params) {
  if (!EMAIL_CONFIG.enabled) {
    showMail(to, subject, body);
    return false;
  }
  try {
    await sendRealEmail(templateId, params);
    mailPreview.hidden = true;
    return true;
  } catch {
    showMail(to, subject, body);
    return false;
  }
}

const $ = (id) => document.getElementById(id);

const authCard = $("authCard");
const dashboard = $("dashboard");
const formMsg = $("formMsg");
const mailPreview = $("mailPreview");

// ---------- helpers ----------
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
  // Fallback (non-secure, demo only)
  let h = 0;
  for (const c of password) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return "fallback-" + h;
}

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = "form-msg " + type;
  formMsg.hidden = false;
}

function hideMsg() {
  formMsg.hidden = true;
}

function showView(view) {
  ["signinForm", "signupForm", "forgotForm", "resetForm"].forEach((id) => {
    $(id).hidden = id !== view;
  });
  $("tabSignin").classList.toggle("active", view === "signinForm");
  $("tabSignup").classList.toggle("active", view === "signupForm");
  hideMsg();
}

function showMail(to, subject, body) {
  $("mailTo").textContent = to;
  $("mailSubject").textContent = subject;
  $("mailBody").textContent = body;
  mailPreview.hidden = false;
  mailPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showDashboard(user) {
  $("dashTitle").textContent = `Welcome, ${user.username}!`;
  $("dashUser").textContent = user.username;
  $("dashEmail").textContent = user.email;
  authCard.hidden = true;
  mailPreview.hidden = true;
  dashboard.hidden = false;
}

function showAuth() {
  dashboard.hidden = true;
  authCard.hidden = false;
  showView("signinForm");
}

// ---------- tabs & navigation ----------
$("tabSignin").addEventListener("click", () => showView("signinForm"));
$("tabSignup").addEventListener("click", () => showView("signupForm"));
document.querySelectorAll("[data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.goto === "signup" ? "signupForm" : "signinForm"));
});
$("forgotLink").addEventListener("click", () => showView("forgotForm"));
$("closeMail").addEventListener("click", () => (mailPreview.hidden = true));

// ---------- show / hide password ----------
document.querySelectorAll(".eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = $(btn.dataset.target);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.textContent = show ? "🙈" : "👁";
  });
});

// ---------- password strength ----------
$("suPass").addEventListener("input", (e) => {
  const v = e.target.value;
  const box = $("strength");
  if (!v) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const pct = Math.min(100, (score / 5) * 100);
  const fill = $("strengthFill");
  fill.style.width = pct + "%";
  fill.style.background = pct < 40 ? "#ef4444" : pct < 80 ? "#f59e0b" : "#22c55e";
  $("strengthLabel").textContent = pct < 40 ? "Weak" : pct < 80 ? "Good" : "Strong";
});

// ---------- sign up ----------
$("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = $("suUser").value.trim();
  const email = $("suEmail").value.trim().toLowerCase();
  const pass = $("suPass").value;
  const confirm = $("suConfirm").value;

  if (username.length < 3) return showMsg("Username must be at least 3 characters.", "error");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMsg("Please enter a valid email address.", "error");
  if (pass.length < 8) return showMsg("Password must be at least 8 characters.", "error");
  if (pass !== confirm) return showMsg("Passwords do not match.", "error");

  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return showMsg("This username is already taken.", "error");
  }
  if (users.some((u) => u.email === email)) {
    return showMsg("An account with this email already exists.", "error");
  }

  users.push({ username, email, passHash: await hashPassword(pass) });
  saveUsers(users);

  const welcomeBody =
    `Hi ${username},\n\nYou have successfully created your account.\n\nUsername: ${username}\nEmail: ${email}\n\nYou can now sign in with your username and password.\n\nThanks for joining us!`;
  const delivered = await deliverEmail(
    email,
    "Welcome! Your account has been created",
    welcomeBody,
    EMAIL_CONFIG.welcomeTemplateId,
    { to_email: email, to_name: username, username }
  );
  showMsg(
    delivered
      ? "Account created! A confirmation email has been sent to your inbox."
      : "Account created! The confirmation email is shown below.",
    "success"
  );
  e.target.reset();
  $("strength").hidden = true;
  setTimeout(() => showView("signinForm"), 1200);
});

// ---------- sign in ----------
$("signinForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const login = $("siUser").value.trim();
  const pass = $("siPass").value;

  const users = getUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === login.toLowerCase() || u.email === login.toLowerCase()
  );
  if (!user) return showMsg("No account found with this username or email.", "error");
  if ((await hashPassword(pass)) !== user.passHash) {
    return showMsg("Incorrect password. Try again or use Forgot password.", "error");
  }

  localStorage.setItem(SESSION_KEY, user.username);
  showDashboard(user);
});

// ---------- forgot password ----------
$("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("fpEmail").value.trim().toLowerCase();
  const user = getUsers().find((u) => u.email === email);
  if (!user) return showMsg("No account found with this email.", "error");

  const code = String(Math.floor(100000 + Math.random() * 900000));
  localStorage.setItem(RESET_KEY, JSON.stringify({ email, code, at: Date.now() }));

  const resetBody =
    `Hi ${user.username},\n\nYour password reset code is:\n\n${code}\n\nEnter this code on the reset page to set a new password. The code expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`;
  const delivered = await deliverEmail(
    email,
    "Your password reset code",
    resetBody,
    EMAIL_CONFIG.resetTemplateId,
    { to_email: email, to_name: user.username, reset_code: code }
  );
  showMsg(
    delivered
      ? "Reset code sent to your email."
      : "Reset code is shown below (email preview).",
    "success"
  );
  e.target.reset();
  setTimeout(() => showView("resetForm"), 1200);
});

// ---------- reset password ----------
$("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = $("rpCode").value.trim();
  const newPass = $("rpPass").value;

  let reset;
  try {
    reset = JSON.parse(localStorage.getItem(RESET_KEY));
  } catch {
    reset = null;
  }
  if (!reset) return showMsg("No reset request found. Please request a code first.", "error");
  if (Date.now() - reset.at > 15 * 60 * 1000) {
    localStorage.removeItem(RESET_KEY);
    return showMsg("This code has expired. Please request a new one.", "error");
  }
  if (code !== reset.code) return showMsg("Incorrect reset code.", "error");
  if (newPass.length < 8) return showMsg("New password must be at least 8 characters.", "error");

  const users = getUsers();
  const user = users.find((u) => u.email === reset.email);
  if (!user) return showMsg("Account not found.", "error");
  user.passHash = await hashPassword(newPass);
  saveUsers(users);
  localStorage.removeItem(RESET_KEY);

  showMsg("Password updated successfully! You can now sign in.", "success");
  e.target.reset();
  setTimeout(() => showView("signinForm"), 1200);
});

// ---------- logout & session ----------
$("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  showAuth();
});

// Restore session on load
const sessionUser = localStorage.getItem(SESSION_KEY);
if (sessionUser) {
  const user = getUsers().find((u) => u.username === sessionUser);
  if (user) showDashboard(user);
}
