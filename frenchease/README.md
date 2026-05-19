# FrenchEase

FrenchEase is a full-stack MERN language-learning tool for English speakers learning French. It translates English text to French, adds IPA phonetics and simplified pronunciation guidance, generates a short AI learning tip, and keeps a temporary MongoDB-backed search history.

## Tech Stack

- Frontend: React + Vite, plain CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- External APIs: MyMemory Translation API and Groq chat completions
- Deployment: Render web service + Render static site

## Project Structure

```text
frenchease/
├── client/
├── server/
├── .env.example
├── render.yaml
└── README.md
```

## Local Setup

1. Install server dependencies:

```bash
cd server
npm install
```

2. Install client dependencies:

```bash
cd ../client
npm install
```

3. Create `server/.env` from `server/.env.example`:

```text
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

4. Create `client/.env` from `client/.env.example`:

```text
VITE_API_URL=http://localhost:5000
```

5. Start the backend:

```bash
cd server
npm run dev
```

6. Start the frontend:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

Server:

- `PORT`: Express port, defaults to `5000`.
- `MONGODB_URI`: MongoDB connection string.
- `GROQ_API_KEY`: Groq API key.
- `JWT_SECRET`: Long random secret used to sign authentication tokens.
- `NODE_ENV`: `development` or `production`.
- `CLIENT_ORIGIN`: Allowed CORS origin for the React app.

Client:

- `VITE_API_URL`: Base URL for the Express API.

## API Routes

- `POST /api/translate`: Translates English text to French using MyMemory and creates a history entry.
- `POST /api/phonetics`: Gets French IPA, pronunciation guide, word breakdown, and audio description from Groq.
- `POST /api/ai-tip`: Gets a learning tip, example sentence, common mistake, and difficulty from Groq.
- `GET /api/history?page=1&limit=10`: Returns paginated search history.
- `DELETE /api/history/:id`: Deletes one history entry.
- `POST /api/auth/register`: Creates an account and sets a secure JWT cookie.
- `POST /api/auth/login`: Logs in with username and password.
- `POST /api/auth/logout`: Clears the auth cookie.
- `GET /api/auth/me`: Returns the current authenticated user.

## Render Deployment

This repo includes `render.yaml` with two services:

- `frenchease-api`: Node web service using `server/`.
- `frenchease-client`: Static site using `client/dist`.

Deployment steps:

1. Push the repository to GitHub.
2. In Render, create a Blueprint from `render.yaml`.
3. Set `MONGODB_URI`, `GROQ_API_KEY`, and `JWT_SECRET` on the API service.
4. Set `CLIENT_ORIGIN` on the API service to the deployed frontend URL.
5. Set `VITE_API_URL` on the static site to the deployed API URL.
6. Deploy both services.

## API Credits

- Translation data is provided by [MyMemory](https://mymemory.translated.net/).
- AI phonetics and learning tips are powered by [Groq](https://groq.com/).

## Notes

- History documents expire automatically after 30 days through a MongoDB TTL index.
- The frontend never calls Groq directly. All external API calls go through Express.
- If Groq is unavailable, translation remains visible and the UI shows graceful fallback content.
- Authentication uses an HTTP-only JWT cookie. Passwords are hashed with bcrypt before storage.
