# Encrypted Chat App

A real-time chat application with a Node.js backend, PostgreSQL database, Redis cache, and a Next.js CLI frontend. Fully dockerized for easy setup and deployment.

---

## Project Structure

chatapp/
├─ backend/ # Node.js + TypeScript backend
├─ cli/ # Next.js frontend (CLI)
├─ docker-compose.yml
├─ README.md


---

## Architecture Overview

+----------------+ +-----------------+
| | | |
| Frontend CLI | <-----> | Backend API |
| (Next.js) | | (Node.js) |
+----------------+ +-----------------+
| |
| |
v v
User Input Database + Cache
+---------------------+
| PostgreSQL + Redis |
+---------------------+


- **Frontend CLI**: React/Next.js client that communicates with backend via API.  
- **Backend**: Node.js + TypeScript server handling authentication, chats, and real-time socket communication.  
- **Database**: PostgreSQL for storing users, chats, and messages.  
- **Cache**: Redis for session management and caching frequently accessed data.

---

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed  
- [Docker Compose](https://docs.docker.com/compose/install/) installed  
- (Optional) Node.js & npm if you want to run without Docker

---

## Setup & Run

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/encryptedChat.git
cd encryptedChat

2️⃣ Create environment variables

    Backend: backend/.env

    Frontend CLI: cli/.env.local

Example backend .env:

NODE_ENV=development
DATABASE_URL=postgresql://chatuser:chatpass@postgres:5432/chatapp
REDIS_URL=redis://:redispass@redis:6379
JWT_SECRET=your-super-secret-jwt-key-dev
CLIENT_URL=http://localhost:3000
PORT=5000

Example frontend .env.local:

NODE_ENV=development
REACT_APP_API_URL=http://localhost:8000

3️⃣ Build and run using Docker Compose

From the root of the project:

docker compose up --build

    This will start:

        postgres on port 5432

        redis on port 6379

        backend on port 8000

        frontend CLI on port 3000

        Prisma Studio on port 5555

4️⃣ Access the application

    Frontend CLI: http://localhost:3000

Backend API: http://localhost:8000

Prisma Studio: http://localhost:5555
Backend Scripts

Inside the backend container or locally:

# Run development server
npm run dev

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

Frontend Scripts (CLI / Next.js)

Inside the CLI container or locally:

# Run development server
npm run dev

# Build production version
npm run build
npm start

Docker Cleanup

    Stop all containers:

docker compose down

    Remove unused images and volumes:

docker system prune -a
docker volume prune

Notes

    Make sure the ports in docker-compose.yml are free on your machine.

    JWT authentication is used for API requests. Ensure REACT_APP_API_URL points to the correct backend URL.

    Prisma Studio allows inspecting the database at http://localhost:5555

    .

License

MIT License


---

If you want, I can also **write a ready `.env.example` file** for both backend and CLI so anyone can just copy it and run `docker compose up --build` without editing. This makes onboarding super smooth.  

Do you want me to create that as well?


