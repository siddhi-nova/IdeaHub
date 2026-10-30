# IDEAHUB Frontend

A colorful, responsive React frontend for the IDEAHUB idea-sharing platform.

## Features

- Dashboard
- Explore/search/filter ideas
- Idea cards and detailed idea pages
- Give-to-Get locked solutions
- Create/publish ideas
- Contribution points
- Rewards and badges
- Leaderboard
- Profile
- Settings
- Likes/comments
- LocalStorage persistence
- Responsive mobile navigation

## Run

Start MySQL, then start the Spring Boot backend from `..\..\IDEAHUB-backend`:

```powershell
cd ..\..\IDEAHUB-backend
mvn spring-boot:run
```

In a second terminal, start the frontend:

```bash
npm install
npm run dev
```

Open http://localhost:5173

The backend uses `http://localhost:8080` and requires Java 17+, Maven, and MySQL. Configure the database credentials in the backend's `src/main/resources/application.properties`.

The current login is demo-only: passwords are stored in browser localStorage and are not authenticated by the backend. Do not use real passwords.
