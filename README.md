# Project Planner (PMP)

A full-stack application for managing student projects, built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication**: Secure login and registration with JWT
- **Role-Based Access Control**: Different views and permissions for teachers and students
- **Project Management**: Create, update, and track student projects
- **Milestone Tracking**: Break down projects into manageable milestones
- **Real-time Progress Updates**: Track project completion status
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React.js with hooks and context API
- React Router for navigation
- React Query for data fetching and caching
- TailwindCSS for styling
- Vite for fast development and building

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- Express Async Handler for cleaner error handling
- Joi for validation

## Project Structure

```
project-planner/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   ├── layouts/        # Layout components
│   │   └── assets/         # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── middlewares/    # Express middlewares
│   │   ├── utils/          # Utility functions
│   │   └── services/       # Business logic services
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables
└── package.json            # Root package.json for scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/project-planner.git
   cd project-planner
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory based on the `.env.example` file

4. Start the development servers:
   ```bash
   npm run dev
   ```

## Development

- Frontend runs on: http://localhost:5173
- Backend API runs on: http://localhost:8000

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get token
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Students
- `GET /api/students` - Get all students (with filtering and pagination)
- `GET /api/students/:id` - Get a single student
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student
- `GET /api/students/stats` - Get student statistics

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a single project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `PATCH /api/projects/:id/status` - Update project status
- `POST /api/projects/:id/milestones` - Add a milestone
- `PATCH /api/projects/:id/milestones/:milestoneId` - Update a milestone
- `DELETE /api/projects/:id/milestones/:milestoneId` - Delete a milestone
- `POST /api/projects/:id/comments` - Add a comment

## License

MIT 