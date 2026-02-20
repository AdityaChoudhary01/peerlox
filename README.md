# 📑 PeerNotez: The Cinematic Academic Discovery Engine

**PeerNotez** is a high-performance, decentralized academic library designed to empower students through seamless knowledge sharing. Built with a focus on **Cinematic UI/UX**, **Technical SEO**, and **Scalable Architecture**, it transforms static study materials into a dynamic discovery experience.

---

## ⚡ Core Pillars

### 🎨 Cinematic Experience

* **Hardware-Accelerated UI:** Utilizing Tailwind CSS and CSS variables for smooth, 60fps glassmorphism effects.
* **Adaptive Interactivity:** Smart components like the `NoteCard` and `BlogCard` feature hover-aware gradients and cinematic flares.
* **Motion-First Design:** Integrated Framer Motion and custom keyframe animations (like the Shimmer and Pulse effects) for a premium feel.

### 🔍 Discovery Engine (SEO)

* **Schema.org Integration:** Automated JSON-LD injection for `CreativeWork`, `BlogPosting`, and `Person` entities to secure Google Rich Snippets.
* **Dynamic Metadata:** High-octane `generateMetadata` implementation that scales titles and descriptions based on real-time database counts.
* **Semantic Navigation:** SEO-friendly pagination with `rel="next/prev"` and a crawler-accessible internal link structure.
* **Automated Sitemaps:** Real-time XML sitemap generation with `.lean()` query optimization for fast indexing.

### 🛠 Technical Excellence

* **Next.js 15/14 Power:** Fully utilizing the App Router, Server Actions, and Streaming for near-instant transitions.
* **Cloudflare R2 Storage:** Decentralized S3-compatible storage for high-speed document and image delivery.
* **PWA Ready:** Custom Service Worker implementation using a **Stale-While-Revalidate** strategy for offline academic access.
* **Image Optimization:** Leveraging the Next.js `Image` component with AVIF/WebP support to maximize LCP scores.

---

## 🏗 Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js (App Router), React, Tailwind CSS |
| **Backend** | Next.js Server Actions, Node.js |
| **Database** | MongoDB & Mongoose |
| **Storage** | Cloudflare R2 (S3 Compatible) |
| **Authentication** | NextAuth.js |
| **Real-time** | Ably Realtime Sync |
| **UI Components** | Radix UI / Shadcn UI |
| **Icons** | Lucide React & FontAwesome |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AdityaChoudhary01/peernotez.git
cd peernotez

```

### 2. Install dependencies

```bash
npm install

```

### 3. Environment Setup

Create a `.env.local` file in the root directory and populate it with your credentials:

```env
# APP
NEXT_PUBLIC_APP_URL=https://peernotez.netlify.app

# AUTH
NEXTAUTH_URL=https://peernotez.netlify.app
NEXTAUTH_SECRET=your_random_secret_here

# DATABASE
MONGODB_URI=your_mongodb_connection_string

# CLOUDFLARE R2
R2_ACCESS_KEY_ID=your_id
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-pub-id.r2.dev

```

### 4. Run Development Server

```bash
npm run dev

```

---

## 📉 Performance & SEO Strategy

PeerNotez implements a "Mobile-First" performance strategy:

1. **Zero Layout Shift (CLS):** Every image and skeleton state is pre-sized to prevent content jumping.
2. **Stale-While-Revalidate:** The Service Worker serves cached content instantly while fetching updates in the background.
3. **Code Splitting:** Heavy modules (like PDF.js and Edit Modals) are dynamically imported only when triggered by the user.

---

## 📂 Folder Structure

```text
├── actions/             # Server Actions (Database logic)
├── app/                 # Next.js App Router (Routes & Pages)
│   ├── api/             # API Route Handlers
│   ├── (auth)/          # Authentication routes
│   ├── search/          # The Discovery Engine
│   └── sitemap.xml/     # Automated SEO Sitemap
├── components/          # Reusable UI Components
│   ├── notes/           # Note-specific UI
│   ├── blog/            # Blog-specific UI
│   └── common/          # Loaders, Pagination, Star Ratings
├── lib/                 # Shared utilities & Database config
├── models/              # Mongoose Schema Models
├── public/              # Service Worker & Static Assets
└── next.config.js       # High-Octane Build Config

```

---

## 🗺 Roadmap

* [x] High-Octane SEO Overhaul
* [x] Cinematic Note & Blog Cards
* [x] Custom Service Worker Integration
* [x] Dynamic Sitemap Generation
* [ ] Custom Domain for R2 Assets (CDN)
* [ ] AI-Powered Note Summarization
* [ ] Peer-to-Peer Study Groups (Ably)

---

## 🤝 Contributing

Contributions are what make the academic community incredible. If you have a suggestion that would make this better, please fork the repo and create a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---