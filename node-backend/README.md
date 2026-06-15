# SRM Node.js MongoDB Backend

This service provides MongoDB CRUD endpoints for the SRM project.

## Setup

1. Install dependencies:

   ```bash
   cd node-backend
   npm install
   ```

2. Create `.env` from `.env.example` and set your MongoDB URL.

3. Run the service:

   ```bash
   npm start
   ```

## API

- `GET /api/mongo/notes`
- `GET /api/mongo/notes/:id`
- `POST /api/mongo/notes`
- `PUT /api/mongo/notes/:id`
- `DELETE /api/mongo/notes/:id`

The service listens on port `9000` by default.
