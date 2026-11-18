# CYGNUS Frontend

## Run
1. Back up your existing `F:\Aura\frontend` folder.
2. Extract this folder as `F:\Aura\frontend`.
3. In PowerShell, run `npm install`, then copy `.env.example` to `.env`, then `npm run dev`.

## Backend adapter
Base URL defaults to `http://localhost:8080/api`. Endpoint paths are configurable in `.env`.
Chat currently sends `{ message, conversationId }` to `/chat` and accepts `reply`, `response`, `content`, `message`, or `text` in the response.
Tasks use REST GET/POST/PUT/DELETE at `/tasks`. The existing project context confirms chat and task APIs exist, but not their exact mappings/DTO fields. If your controller uses different mappings or payload fields, change only `src/services/api.js`. Backend files are not modified.

## Screens
Assistant, Tasks (CRUD UI), Planner, Notes, Files, Activity, Settings. Planner/Notes/Files/Activity are frontend-ready placeholders pending backend APIs.
