# Workforce Scheduling System

This repository is set up to deploy as a single Render web service. Render builds the React frontend, starts the Express backend, and the backend serves the compiled frontend in production.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, choose `New` -> `Blueprint`.
3. Connect this repository and keep the default `render.yaml` path.
4. Enter values for:
   - `MONGO_URI`
   - `JWT_SECRET`
5. Deploy the blueprint.

When the deploy finishes, Render will expose one public URL for the whole app. The API health check will be available at `/api/health`.

## Local development

Run the frontend and backend separately during development:

1. In `backend`, create `.env` from `.env.example`.
2. Start the API with `npm start`.
3. In `frontend`, optionally set `REACT_APP_API_URL` in `.env` if your API is not at `http://localhost:5000/api`.
4. Start the frontend with `npm start`.
