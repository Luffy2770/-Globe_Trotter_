# Tripyfy (GlobeTrotter)

Tripyfy is a full-stack personalized travel planning and collaborative itinerary management platform. It allows users to browse destination cities and curated activity catalogs, construct day-by-day modular trip itineraries with strict date validation, collaborate in real time with invited travel partners, manage trip budgets dynamically, and explore or share community itineraries.

---

## Key Features

### 1. Destination & Activity Exploration
- Curated showcase of destination cities across Europe, Asia, the Americas, the Middle East, and Africa.
- Interactive catalog of guided excursions, food crawls, landmark tours, and outdoor adventures.
- Filter destinations by continent, search by city name, and sort by popularity, cost index, or alphabetical order.

### 2. Modular Itinerary Builder
- Multi-section trip builder where each section represents a distinct leg of the trip (arrival, city tours, excursions).
- Strict date-bound activity scheduler ensuring all planned activities fall within the trip's start and end dates.
- Real-time spend calculations tracking section budgets alongside individual activity expenses.

### 3. Trip Collaboration & Invitations
- Direct user invitations by username or email.
- Permission-based role assignments:
  - Co-Planner (Editor): Full permissions to add and edit itinerary sections, dates, activities, and budgets.
  - Companion (Viewer): Read-only access to schedules, calendar days, and receipts.
- Dedicated Invitation Inbox in the top navigation bar with pending invitation counts, acceptance, and decline handling.
- Co-planned trips automatically sync to all accepted members' collections.

### 4. Community Itinerary Hub
- Public feed of traveler-created itineraries with category tags (Backpacking, Luxury, Food & Wine, Nature, Solo).
- One-click itinerary cloning allowing any user to fork a community route into their personal trips.
- Upvotes, likes, and a comments system for traveler reviews and tips.
- Direct sharing capabilities to publish personal trips to the global feed or copy shareable web links.

### 5. Interactive Calendar & Real-Time Analytics
- Calendar planner synchronizing scheduled activities to specific dates.
- Single-trip and aggregate spend analytics comparing actual expenses against target budgets.

---

## Tech Stack

### Frontend
- Framework: React 19 with TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS
- Icons: Lucide React
- HTTP Client: Axios

### Backend
- Framework: FastAPI (Python 3.11+)
- ORM: SQLAlchemy
- Database: SQLite (configurable to PostgreSQL)
- Authentication: JWT (JSON Web Tokens) with passlib and bcrypt password hashing
- Validation: Pydantic v2

---

## Project Structure

```
GlobeTrotter/
├── backend/
│   ├── app/
│   │   ├── api/             # API routes (auth, cities, trips, itinerary, invites, community)
│   │   ├── core/            # App configuration and JWT security helpers
│   │   ├── db/              # Database engine and session setup
│   │   ├── models/          # SQLAlchemy database models
│   │   └── schemas/         # Pydantic request and response schemas
│   ├── seed.py              # Database seeding script for cities, activities, and users
│   ├── requirements.txt     # Python dependencies
│   └── main.py              # Application entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, Logo)
│   │   ├── pages/           # Application views (Explore, Trips, Itinerary, Community, etc.)
│   │   ├── services/        # Axios API client integrations
│   │   ├── App.tsx          # Main application router and state container
│   │   └── main.tsx         # React root entry point
│   ├── package.json         # Node.js dependencies and scripts
│   └── vite.config.ts       # Vite build configuration
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher) and npm
- Python (v3.10 or higher)

---

### Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Seed the database with initial destinations, activities, and test accounts:
   ```bash
   python seed.py
   ```

5. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

The backend API will run at `http://localhost:8000`. You can explore the interactive API documentation at `http://localhost:8000/docs`.

---

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev -- --port 5173 --host
   ```

The frontend application will be accessible at `http://localhost:5173`.

---

## Seeded Test Accounts

To test multi-user collaboration and invitations, the following accounts are pre-configured:

| Name | Username | Email | Password | Location |
| :--- | :--- | :--- | :--- | :--- |
| Luffy Monkey | `luffy` | `luffy@tripyfy.com` | `password123` | Tokyo, Japan |
| Roronoa Zoro | `zoro` | `zoro@tripyfy.com` | `password123` | Kyoto, Japan |
| Nami Navigator | `nami` | `nami@tripyfy.com` | `password123` | Paris, France |
| Vinsmoke Sanji | `sanji` | `sanji@tripyfy.com` | `password123` | Rome, Italy |

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Sign in and receive a JWT bearer token.
- `GET /api/auth/me` - Retrieve authenticated user profile.

### Destinations & Activities
- `GET /api/cities` - List and filter destination cities.
- `GET /api/catalog/search` - Search global activities catalog.

### Trips & Itineraries
- `GET /api/trips-listing` - Get user trips grouped by status (ongoing, upcoming, completed).
- `POST /api/trips` - Create a new trip.
- `GET /api/trips-listing/{id}/overview` - Retrieve detailed trip breakdown with stops and activities.
- `PUT /api/trips/{id}` - Update trip metadata.
- `DELETE /api/trips/{id}` - Remove a trip.

### Collaborations & Invitations
- `POST /api/invites/trips/{trip_id}` - Send an invitation to a user with assigned role (editor/viewer).
- `GET /api/invites/trips/{trip_id}` - Retrieve current members and collaborators for a trip.
- `GET /api/invites/inbox` - Retrieve pending and past invitations for the logged-in user.
- `POST /api/invites/{invite_id}/respond` - Accept or decline a trip invitation.
- `DELETE /api/invites/trips/{trip_id}/{invite_id}` - Remove a collaborator from a trip.

### Community Hub
- `GET /api/community/posts` - Fetch public community itinerary plans.
- `POST /api/community/posts` - Publish an itinerary to the community feed.
- `POST /api/community/posts/{id}/like` - Toggle upvote on a community post.
- `GET /api/community/posts/{id}/comments` - Get traveler comments and tips.
- `POST /api/community/posts/{id}/comments` - Post a comment on an itinerary.
- `POST /api/community/posts/{id}/clone` - Clone a community itinerary into personal trips.

---

## License

This project is licensed under the MIT License.
