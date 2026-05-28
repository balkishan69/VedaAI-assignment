# VedaAI Assessment Creator

A full-stack, AI-powered assessment generation platform designed to create structured question papers with real-time generation progress and background job processing.

---

## 1. GitHub Repo

### Clean Code Practices

This project adheres to modern development standards and strict clean code principles to ensure maintainability and scalability:

- **Monorepo Workspace**: Structured via npm workspaces with explicit separation between `client` and `server`.
- **Strict Typing**: End-to-end TypeScript enforcement. Client-side form validation is handled via Zod and React Hook Form.
- **Separation of Concerns**: The backend is divided logically into `controllers`, `services`, `routes`, `schemas`, and `workers`.
- **State Management**: Lightweight, reactive state management using Zustand on the client.
- **Componentized UI**: Modular UI components leveraging Next.js App Router and Tailwind CSS for styles and responsive design.

### Setup Instructions

**Prerequisites:**
- Node.js (>= 20.0.0)
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Google Gemini API Key

**Installation & Execution:**

1. **Clone and Install dependencies:**
   ```bash
   git clone <repo-url>
   cd vedaai-assignment
   npm install
   ```

2. **Environment Configuration:**
   Copy the example environment files and fill in your credentials.
   ```bash
   # Root backend configuration
   cp .env.example .env
   
   # Frontend configuration
   cp client/.env.example client/.env.local
   ```
   *Make sure to configure `MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, and `GEMINI_API_KEY` in the `.env` file.*

3. **Run the Application (Development Mode):**
   This command concurrently starts the frontend client, backend API server, and background worker.
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Client: `http://localhost:3000`
   - API: `http://localhost:5000/api`

---

## 2. Architecture & Approach

### Architecture Overview

The system is built on a scalable, event-driven architecture designed to handle long-running AI tasks without blocking the main event loop.

- **Frontend**: Next.js 15 App Router providing the teacher dashboard, form validation, and real-time WebSocket progress updates.
- **Backend API**: Node.js & Express REST API that handles HTTP requests, persists data to MongoDB, and enqueues tasks.
- **Job Queue**: Redis-backed BullMQ used for offloading heavy tasks (AI generation and PDF generation).
- **Background Workers**: Dedicated worker processes that consume queue jobs, interact with Google Gemini AI, and parse structured output.
- **Real-Time Communication**: Socket.IO is used to push live status updates (`queued`, `progress`, `completed`, `failed`) from the workers directly back to the client UI.

### Approach

1. **Asynchronous Processing**: AI model interactions can be slow. Instead of blocking the HTTP request, the backend immediately returns a `jobId` while adding the task to a BullMQ queue.
2. **Real-time Feedback**: The client connects via WebSocket using the assignment ID. As the background worker progresses (e.g., fetching from Gemini, saving to DB, generating PDF), it emits progress events to keep the user informed.
3. **Structured Prompt Engineering**: The Gemini AI is given strict instructions and TypeScript shape definitions to ensure it returns predictable, structured JSON. The output is extracted, parsed, and validated.
4. **Deterministic Fallback**: If the Google Gemini API key is missing or the service is temporarily unavailable, the system safely falls back to a template-based generator to ensure continuous operation.
5. **PDF Export Generation**: Once the exam is generated, a secondary job is queued for PDFKit to render a professional, print-ready exam paper with ruled textures and structured sections, which is then served to the client.

---

## 3. Deployment Guide

To deploy this project and get a final working URL, you need to deploy the frontend, the backend API, and a background worker, alongside cloud databases.

### Step 1: Provision Cloud Databases
1. **MongoDB**: Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Get your connection string (`MONGODB_URI`).
2. **Redis**: Create a free Redis instance on [Upstash](https://upstash.com/) or [Render](https://render.com/). Get the host, port, and password.

### Step 2: Deploy the Backend (Render or Railway)
Deploy the Node.js backend using a service like Render:
1. Connect your GitHub repository.
2. **Web Service (API)**:
   - Build Command: `npm install && npm run build --workspace server`
   - Start Command: `npm run start --workspace server`
   - Environment Variables: `NODE_ENV=production`, `MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `GEMINI_API_KEY`.
   - Copy the deployed Web Service URL (e.g., `https://my-backend.onrender.com`).
3. **Background Worker**:
   - Create a "Background Worker" service pointing to the same repo.
   - Build Command: `npm install && npm run build --workspace server`
   - Start Command: `npm run worker --workspace server`
   - Environment Variables: Same as the Web Service.

### Step 3: Deploy the Frontend (Vercel)
Deploy the Next.js client using [Vercel](https://vercel.com/):
1. Import your GitHub repository into Vercel.
2. In the project settings, set the **Root Directory** to `client`.
3. Add the following Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your backend Web Service URL + `/api` (e.g., `https://my-backend.onrender.com/api`).
   - `NEXT_PUBLIC_WS_URL`: Your backend Web Service URL (e.g., `https://my-backend.onrender.com`).
4. Click **Deploy**. Vercel will give you your final live frontend link (e.g., `https://vedaai-assessment.vercel.app`).

### Step 4: Finalize CORS Configuration
Go back to your backend (Render/Railway) environment variables for the Web Service:
1. Add `CLIENT_URL` and set it to your Vercel deployment link (e.g., `https://vedaai-assessment.vercel.app`).
2. Redeploy the Web Service to apply the new CORS policy.
