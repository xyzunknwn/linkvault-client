# LinkVault – URL Shortener & Analytics

A full-stack web application that converts long URLs into manageable short links. Built using the MERN stack, LinkVault features custom URL aliases, optional link expiration dates, and click-tracking analytics, all wrapped in a premium dark-mode interface. 

This project was developed as a technical assignment for the Junior Coordinator – Technical role.

## Features

* **Custom Aliases:** Generate secure random short IDs or specify a custom, memorable text alias.
* **Link Expiry:** Set a specific date and time for a link to expire. Expired links automatically block redirection.
* **Analytics Tracking:** Track the total number of clicks for each generated short link.
* **Security & Reliability:** Rejects non-HTTP/HTTPS protocols to prevent malicious injections and includes atomic database updates to prevent click-counting data loss.
* **Modern UI:** Responsive, developer-focused dark mode interface with subtle background animations and glassmorphism styling.

## Tech Stack

* **Frontend:** React.js, Vite, Axios, Pure CSS (Custom Animations & Dark Theme)
* **Backend:** Node.js, Express.js, CORS
* **Database:** MongoDB Atlas, Mongoose
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## Local Setup Instructions

### Prerequisites
* Node.js installed on your machine.
* A free MongoDB Atlas cluster (or a local MongoDB instance).

### 1. Clone the Repositories

Backend

```bash
git clone https://github.com/xyzunknwn/link-vault.git
cd link-vault
```

Frontend

```bash
git clone https://github.com/xyzunknwn/linkvault-client.git
cd linkvault-client
```

### 2. Backend Setup
Navigate to the server directory, install dependencies, and configure your environment variables.
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add your MongoDB connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
PORT=5001
```
Start the backend server:
```bash
npm start
# or use `node index.js`
```
*The server will start running on `http://localhost:5001`.*

### 3. Frontend Setup
Open a new terminal window, navigate to the client directory, and install dependencies.
```bash
cd client
npm install
```
If you are running the project locally, ensure the `baseURL` in your `App.jsx` Axios requests points to your local server (`http://localhost:5001`). If you are connecting to the deployed backend, ensure it points to the Render URL (e.g., `https://link-vault-k9li.onrender.com`).

Start the Vite development server:
```bash
npm run dev
```
*The React application will be available at `http://localhost:5173`.*

---

## API Endpoints

### `POST /api/shorten`
Generates a new short link.
* **Payload:** `{ originalUrl: "https://...", customAlias: "optional-text", expiresAt: "2026-12-31T12:00" }`
* **Returns:** The newly created database document including the `shortId`.

### `GET /:shortId`
Core redirection engine.
* Looks up the `shortId`.
* If found and not expired, increments the click count and redirects to `originalUrl`.
* If expired, returns `410 Gone`. If not found, returns `404 Not Found`.

### `GET /api/analytics/:shortId`
Retrieves click statistics.
* **Returns:** JSON object containing the original URL, total clicks, creation date, and expiration date.
