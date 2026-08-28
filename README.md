# ⚡ EV Charging Station — Frontend

A React + Vite single-page application for a community EV charging platform. It provides role-specific dashboards for **Users**, **Hosts**, and **Admins**, with real-time chat, map-based charger discovery, booking & payment flows, ratings, notifications, and analytics.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-19-blue?logo=react">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite">
  <img alt="React Router" src="https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?logo=tailwindcss&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-lightgrey">
</p>

> This is the frontend for the EV Charging Station platform. It talks to a companion [Spring Boot backend](#) (REST + WebSocket API) — see that repo for the server-side setup.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Routing Overview](#routing-overview)
- [Key Services](#key-services)
- [Available Scripts](#available-scripts)
- [Roadmap](#roadmap)
- [License](#license)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios (with JWT + auto-refresh interceptors) |
| Real-time | STOMP.js + SockJS |
| Maps | Leaflet / React-Leaflet + Google Maps API |
| Charts | Recharts, Chart.js (via `react-chartjs-2`) |
| Styling | Tailwind CSS + per-component CSS |
| Icons | Lucide React, React Icons |
| Dates | `date-fns` |
| Notifications (UI) | React Toastify |

---

## Features

### 🔐 Authentication
- Login and registration forms with validation
- JWT stored in `localStorage`; attached to every Axios request via a request interceptor
- Automatic token refresh on `401` responses — retries the original request transparently
- `ProtectedRoute` component enforces role-based access (`USER`, `HOST`, `ADMIN`)
- Logout clears all tokens and redirects to `/login`

### 🧭 Role-Based Dashboards
All three roles share a `DashboardLayout` (Navbar + Sidebar) and get role-specific sidebar links and sections.

**User Dashboard** (`/user-dashboard/*`)
- Browse and filter available chargers (list and map view)
- View charger detail pages with ratings and reviews
- Book a charger for a time slot
- Payment modal with a 10-minute countdown timer
- Receipt viewer/download after payment
- My Bookings with cancellation support
- Payments history, profile management, real-time messaging

**Host Dashboard** (`/host-dashboard/*`)
- List and manage own chargers
- Add a new charger (image upload, location, pricing)
- Edit existing charger details
- View all bookings for own chargers
- Real-time messaging with users

**Admin Dashboard** (`/admin-dashboard/*`)
- Users management (view, suspend, delete)
- Hosts management (approve `PENDING_HOST` registrations, manage active hosts)
- All chargers overview
- Platform reports
- Real-time messaging

### 🗺️ Charger Discovery
- `ChargerList` — filterable/sortable grid of available chargers
- `ChargerMap` — Leaflet map with charger markers; click a marker to open details
- `ChargerDetail` — full info page with images, specs, ratings summary, and booking CTA

### 💳 Booking & Payment Flow
1. User selects a charger and picks a time slot in `BookCharger`
2. `PaymentModal` opens with a live countdown (`PaymentTimer`) — 10 minutes to complete payment
3. On success, `ReceiptModal` displays the receipt with a downloadable PDF link
4. Cancellation available from `MyBookings` until 1 hour before the booking start

### 💬 Real-Time Chat
- `websocketService.js` wraps `@stomp/stompjs` + SockJS:
  - Automatic reconnection with exponential backoff (up to 5 attempts)
  - Message queue during disconnection — delivered on reconnect
  - JWT authentication sent on STOMP `CONNECT`
  - Heartbeat every 25 seconds
- `ChatDashboard` renders the conversation list + message thread
- Typing indicators and read receipts update in real time
- Floating `ChatButton` available on all dashboard pages

### 🔔 Notifications
- Bell icon in the Navbar opens `NotificationDropdown`
- Unread count badge updated via WebSocket push
- Mark individual or all notifications as read

### 📊 Analytics Dashboards
Each role has a dedicated analytics dashboard powered by Recharts:

| Role | Sections |
|---|---|
| User | Overview, Booking Analytics, Spending, Charging Behaviour, Ratings |
| Host | Overview, Revenue, Charger Analytics, Booking Analytics, User Analytics |
| Admin | Overview, Revenue, Users, Hosts, Chargers, Bookings, Ratings, Time Analytics, Platform Performance |

All dashboards support date-range filtering and display line charts, bar charts, pie charts, and metric cards.

### ⭐ Ratings & Reviews
- `RatingModal` — 1–5 star input with comment, submitted after a completed booking
- `ReviewsList` — paginated list of reviews per charger
- `ChargerRatingSummary` — star distribution breakdown
- `MyRatings` — user's own submitted ratings

---

## Project Structure

```
src/
├── App.jsx                  # Route definitions for all three roles
├── main.jsx                 # React DOM entry point
├── assets/                  # Static assets (logo, etc.)
│
├── components/
│   ├── auth/                # Login, Register, ProtectedRoute, LogoutButton
│   ├── cards/                # ChargerCard
│   ├── common/                # LoadingSpinner, EmptyState
│   ├── dashboard/
│   │   ├── DashboardLayout.jsx   # Shared layout with Navbar + Sidebar
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── NotificationDropdown.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── admin/sections/  # UsersManagement, HostsManagement, AllChargers, AdminReports, AdminMessages
│   │   ├── host/sections/   # HostChargers, AddCharger, EditCharger, HostBookings, HostMessages
│   │   └── user/sections/   # ChargerList, ChargerDetail, ChargerMap, MyBookings, BookCharger,
│   │                        #   PaymentModal, PaymentTimer, ReceiptModal, UserPayments,
│   │                        #   UserProfile, UserMessages, UserSupport
│   ├── analytics/
│   │   ├── admin/           # AdminAnalyticsDashboard + 9 section components
│   │   ├── host/            # HostAnalyticsDashboard + 4 sub-dashboards
│   │   └── user/            # UserAnalyticsDashboard + 4 sub-dashboards
│   ├── rating/               # StarRating, RatingModal, RatingButton, ReviewsList, MyRatings, ChargerRatingSummary
│   ├── ChatButton.jsx        # Floating chat trigger
│   └── ChatDashboard.jsx     # Full-screen chat UI
│
├── services/
│   ├── api.js                 # Axios instance with JWT interceptors + 401 refresh
│   ├── bookingService.js
│   ├── charRegistration.js    # Charger CRUD
│   ├── chatService.js         # Conversation + message REST calls
│   ├── notificationService.js
│   ├── paymentService.js
│   ├── ratingService.js
│   ├── receiptService.js
│   ├── reservationService.js
│   ├── analyticsService.js    # User & host analytics
│   ├── adminAnalyticsService.js
│   └── websocketService.js    # STOMP WebSocket client wrapper
│
└── css/                      # Per-component and per-section CSS files
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm (or yarn)
- The [backend API](#) running (defaults to `http://localhost:8080`)

### Install & Run

```bash
npm install
npm run dev
```

The app starts at **http://localhost:5173**.

### Build for Production

```bash
npm run build
```

Output is placed in `dist/`.

```bash
npm run preview   # locally preview the production build
```

---

## Environment Variables

Create a `.env` file in the project root to override defaults:

```env
VITE_API_URL=http://localhost:8080/api
```

The Axios base URL and chat service API URL both default to `http://localhost:8080/api` if `VITE_API_URL` is not set.

---

## Routing Overview

| Path | Role | Component |
|---|---|---|
| `/login` | Public | `Login` |
| `/register` | Public | `Register` |
| `/user-dashboard/chargers` | USER | `ChargerList` |
| `/user-dashboard/charger/:id` | USER | `ChargerDetail` |
| `/user-dashboard/my-bookings` | USER | `MyBookings` |
| `/user-dashboard/messages` | USER | `UserMessages` |
| `/user-dashboard/payments` | USER | `UserPayments` |
| `/user-dashboard/profile` | USER | `UserProfile` |
| `/host-dashboard/my-chargers` | HOST | `HostChargers` |
| `/host-dashboard/add-charger` | HOST | `AddCharger` |
| `/host-dashboard/edit-charger/:id` | HOST | `EditCharger` |
| `/host-dashboard/bookings` | HOST | `HostBookings` |
| `/host-dashboard/messages` | HOST | `HostMessages` |
| `/admin-dashboard/users` | ADMIN | `UsersManagement` |
| `/admin-dashboard/hosts` | ADMIN | `HostsManagement` |
| `/admin-dashboard/chargers` | ADMIN | `AllChargers` |
| `/admin-dashboard/reports` | ADMIN | `AdminReports` |
| `/admin-dashboard/messages` | ADMIN | `AdminMessages` |

All dashboard routes are wrapped in `ProtectedRoute`, which verifies the JWT role before rendering.

---

## Key Services

### `api.js`
Central Axios instance. Attaches `Authorization: Bearer <token>` to every request. On a `401`, it attempts a token refresh at `/api/auth/refresh` and retries the original request. If refresh fails, it clears `localStorage` and redirects to `/login`.

### `websocketService.js`
Singleton STOMP client. Key methods:
- `connect(token, onConnect, onError)` — establishes connection with JWT header
- `subscribe(destination, callback)` — subscribes to a STOMP topic/queue
- `sendMessage(destination, body)` — sends a message (queued if disconnected)
- `disconnect()` — gracefully closes the connection

### `chatService.js`
REST wrapper for conversation and message endpoints. Supports conversation initiation, pagination, message sending, read receipts, unread counts, and user presence tracking.

### `analyticsService.js` / `adminAnalyticsService.js`
Typed wrappers around the `/api/analytics/{user,host,admin}` endpoints, used by the Recharts-powered dashboards.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Roadmap

- [ ] Component-level tests (React Testing Library)
- [ ] Wire up remaining placeholder routes (`UserProfile`, `UserPayments`, `UserSupport`, etc.)
- [ ] Dark mode
- [ ] E2E test coverage (Playwright/Cypress)

---

## License

Distributed under the MIT License. See `LICENSE` for details.
