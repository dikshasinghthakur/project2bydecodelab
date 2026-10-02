# Full Stack Project 2

A full-stack project management dashboard built with Node.js and Express. It allows users to track project status, budgets, priorities, and progress through a responsive dashboard and API-driven backend.

## Live Demo

https://project2bydecodelab.onrender.com/

## Features

- Express backend with REST API routes
- Responsive frontend dashboard
- Search projects by title, owner, or description; filter by status and priority
- Create, update, and delete projects
- Project progress and budget tracking
- Real-time summary cards for project status
- Data persistence using a JSON file

## Project structure

- `server.js` - backend API and server configuration
- `public/index.html` - UI layout
- `public/styles.css` - dashboard styling
- `public/app.js` - frontend logic and API calls
- `data/projects.json` - stored project data

## Run locally

1. Install dependencies:
   npm install
2. Start the app:
   npm start
3. Open http://localhost:3000

## API endpoints

- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

## GitHub deployment

1. Create a new GitHub repository.
2. Push the project to GitHub:
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
3. Deploy the app using a free hosting service such as Render or Railway.
4. Add the live link to this README when deployment is complete.
