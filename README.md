# Voronoi

🌐 **Live:** [https://www.voronoi.space](https://www.voronoi.space)

Voronoi is a modern web application for organizing developer knowledge — libraries, folders, and code snippets — in a clean, fast, and scalable way.

It’s designed to feel lightweight and responsive while being built on a production-ready architecture that can grow from a personal knowledge base into a collaborative platform.

## ✨ Features

### 🔐 Authentication
- OAuth via GitHub and Google
- Powered by NextAuth for secure session handling

### 📚 Library Management
- Create and manage libraries
- Organize content into folders and files
- Designed for nested, scalable structures

### ⚡ Fast State Management
- Global client state handled with Zustand
- Optimistic UI updates
- Minimal re-renders and no unnecessary page refreshes

### 🎨 Modern UI
- Tailwind CSS
- Custom branding and background visuals
- Polished empty, loading, and error states

### 🗄️ Database
- PostgreSQL via Supabase
- Structured data with room for access control and realtime features

## 🧠 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Authentication:** NextAuth
- **Database:** Supabase (PostgreSQL)
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Domain:** Namecheap

## 🏗️ Architecture

Voronoi follows a clean separation of responsibilities:

- **Next.js** — routing, rendering, and application structure
- **NextAuth** — authentication and identity management
- **Supabase** — data persistence and backend services
- **Zustand** — client-side state and UI logic

This structure keeps the app maintainable while allowing features to scale without rewrites.

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Supabase project
- OAuth credentials for GitHub / Google / Discord

### Installation
```bash
git clone https://github.com/your-username/voronoi.git
cd voronoi
pnpm install
```

### Environment Variables

Create a .env.local file:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SUPABASE_URL=
```

### Run Locally

```bash
pnpm run dev
```

Then visit: 👉 http://localhost:3000