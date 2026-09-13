# Student Management / School Attendance System

This is a cleaned project package prepared for local setup and later deployment.

## Important
- `node_modules`, build output, caches, and Git metadata are intentionally excluded.
- Do NOT commit real `.env` files, passwords, API keys, or database credentials.
- Install dependencies from each app's `package.json` after extracting the ZIP.

## Basic setup
1. Extract this ZIP.
2. Open the backend folder in a terminal and run:
   npm install
3. Copy `.env.example` to `.env` and enter your local database settings.
4. Create/import the MySQL database using the SQL files included in the project.
5. Start the backend with the command specified by its `package.json`.
6. Open the frontend folder in a second terminal and run:
   npm install
7. Start the frontend with its Vite/npm start command.
8. If the frontend API URL is configurable, point it to the local backend URL.

We will verify and connect the individual modules before deployment.
