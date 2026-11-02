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

## Real email delivery

To deliver those emails to a real inbox, connect an email service (for example an SMTP provider or an email API) and wire the `showMail(...)` calls in `script.js` to it. Until then, the email preview panel shows exactly what the user would receive.

## Run it

Open `index.html` in any browser, or use the GitHub Pages link.
