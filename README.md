# Login Page

A professional, premium sign-in / sign-up page built with HTML, CSS and JavaScript. No build step, no framework needed — just open `index.html`.

## Features

- **Sign In** — with username or email + password, "Remember me" session
- **Sign Up** — username, email, password with a live password-strength meter
- **Forgot Password** — request a 6-digit reset code, verify it, and set a new password
- **Dashboard** — a welcome screen after sign-in, with Log Out
- **Show/hide password** toggles on every password field
- **Premium design** — dark glassmorphism theme, gradient accents, responsive layout

## How it works

Accounts are stored in the browser (localStorage) and passwords are SHA-256 hashed before storage. The email panel on the page previews the exact email that would be delivered (welcome email on sign-up, reset code on forgot password).

## Real email delivery — the way professional websites do it

Professional websites never ask visitors to connect Gmail. The **website itself** sends mail from the **site owner's** mail service. This page is built exactly that way, using [EmailJS](https://www.emailjs.com/) (free tier available):

1. Create a free account on emailjs.com and connect your email **once** on their own website (no password is shared with anyone here).
2. Create two email templates there:
   - **Welcome template** using variables `{{to_name}}` and `{{username}}`
   - **Reset template** using variables `{{to_name}}` and `{{reset_code}}`
3. Copy your **Service ID**, the two **Template IDs** and your **Public Key** into the `EMAIL_CONFIG` block at the top of `script.js`, and set `enabled: true`.
4. Push the change. From then on, every visitor who signs up gets a real welcome email, and every forgot-password request gets a real reset-code email — no visitor is ever asked to connect Gmail.

Until those keys are filled in, the page shows the exact email in the on-page preview panel, so the whole flow can be tested end to end.

## Run it

Open `index.html` in any browser, or use the GitHub Pages link.
