# Login Page

A professional, premium sign-in / sign-up website built with HTML, CSS and JavaScript. No build step, no framework needed — just open `index.html`.

## Pages

- **`index.html`** — the Login page: username + password, with Forgot password and Sign up options below
- **`signup.html`** — a separate Sign Up page: username, email, password with a live strength meter. After creating an account, a button takes you back to the Login page
- **`forgot.html`** — Forgot password: request a 6-digit reset code, verify it, set a new password, then back to Login
- **`auth.js`** — shared auth logic (accounts, SHA-256 hashed passwords, email delivery)
- **`style.css`** — premium dark glassmorphism theme, responsive layout

## How it works

Accounts are stored in the browser (localStorage). This is a demo-grade auth flow, not production security.

## Real email delivery — the way professional websites do it

Professional websites never ask visitors to connect Gmail. The **website itself** sends mail from the **site owner's** mail service. This site is built exactly that way, using [EmailJS](https://www.emailjs.com/) (free tier available):

1. Create a free account on emailjs.com and connect your email **once** on their own website (no password is shared with anyone here).
2. Create two email templates there:
   - **Welcome template** using variables `{{to_name}}` and `{{username}}`
   - **Reset template** using variables `{{to_name}}` and `{{reset_code}}`
3. Copy your **Service ID**, the two **Template IDs** and your **Public Key** into the `EMAIL_CONFIG` block in `auth.js`, and set `enabled: true`.
4. Push the change. From then on, every visitor who signs up gets a real welcome email in their inbox, and every forgot-password request gets a real reset-code email — no visitor is ever asked to connect Gmail.

Until those keys are filled in, the site honestly tells the user that email delivery is not connected yet, instead of pretending an email was sent.

## Run it

Open `index.html` in any browser, or use the GitHub Pages link.
