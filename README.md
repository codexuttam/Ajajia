# Ajaia Docs

Ajaia Docs is a lightweight, full-stack collaborative document editor inspired by Google Docs. It allows users to create, edit, upload, and share rich-text documents in a beautiful and responsive environment.

## 🚀 Features
- **Rich-Text Editor**: Fully featured editor powered by TipTap & ProseMirror.
- **File Uploads**: Convert `.txt` and `.md` files directly into rich-text documents instantly.
- **Collaborative Sharing Model**: Mock authentication with `js-cookie` and sharing functionality. Document owners can grant edit access to specific users, cleanly dividing workspaces between "Owned" and "Shared".
- **Local Database Persistence**: A robust local JSON-based file storage mimicking a production database, ensuring documents and permissions remain available across page reloads and server restarts.

---

## 🏗 Architecture Note
Ajaia Docs prioritizes a sleek, native-feeling user experience paired with a reliable, lightweight backend to demonstrate full-stack engineering proficiency within a concise scope. 

**Why these tools?**
- **Next.js (App Router)**: Chosen for rapid full-stack development. React server components, built-in API routes, and cookie management make sharing functionality simple and cohesive.
- **TipTap**: A headless editor wrapper around ProseMirror. Selected because it avoids heavy DOM opinions, allowing us to enforce a strict "Premium Google Docs" design using vanilla CSS.
- **Vanilla CSS (No Tailwind)**: To strictly demonstrate foundational CSS architecture. The styling logic supports light/dark mode and uses modular, scoped CSS principles within `globals.css`.
- **File-Based Database (`.data/`)**: While an enterprise app would use Postgres or Supabase, using a custom file-based store in `src/lib/db.ts` proves an understanding of database fundamentals—like CRUD operations, relational ownership (`ownerId`), array checks (`sharedWith`), and atomic updates—without requiring external provisioning to review the code.
- **Mock Auth (`js-cookie`)**: We used an injected fixed UI component (`UserSwitcher`) to simulate session handoffs. This perfectly models real JWT/Session mechanics without building complex OAuth flows.

---

## 🛠 Setup and Run Instructions

### 1. Install Dependencies
Ensure you have Node.js 18+ installed.
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
A suite of tests has been implemented using `vitest` to validate the file-system database logic (CRUD operations & shared filtering).
```bash
npm test
```

---

## 🌍 Deployment
This repository is configured to be deployed on **Vercel** out-of-the-box. 
*Note: Because the database uses a local `.data` directory, Vercel's ephemeral serverless architecture will reset the files periodically. For a fully persistent production deployment, host the application on a VPS (like Render, Railway, or DigitalOcean) where the local filesystem persists, or swap `db.ts` with an external Postgres provider.*

**To deploy quickly:**
```bash
npx vercel
```
