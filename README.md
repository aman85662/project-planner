# Project Management System (PMP)

A full-stack web application for managing student projects, built with MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- **User Authentication**
  - Role-based access (Teacher/Student)
  - Secure login and registration
  - JWT-based authentication
  - Protected routes

- **Project Management**
  - Create and manage projects
  - Assign students to projects
  - Track project progress
  - Set deadlines and milestones
  - Add comments and updates

- **Dashboard Views**
  - Teacher Dashboard: Overview of all projects and students
  - Student Dashboard: Personal project tracking
  - Progress visualization
  - Deadline tracking

## Tech Stack

- **Frontend**
  - React.js
  - Vite
  - Tailwind CSS
  - React Query
  - React Router
  - Axios

- **Backend**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT Authentication
  - Bcrypt

## Project Structure

```
project-planner/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main application component
│   └── package.json
│
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Express middlewares
│   │   └── index.js        # Server entry point
│   └── package.json
```

## Key Code Snippets

### Authentication (AuthContext.jsx)
```javascript
const login = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setDefaultAuthHeader(userData.token);
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

### Project Model (Project.js)
```javascript
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'] },
  progress: { type: Number, default: 0 },
  milestones: [{
    title: String,
    completed: Boolean
  }]
});
```

### API Service (api.js)
```javascript
export const projectAPI = {
  getAll: (params) => API.get('/projects', { params }),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  getStudentProjects: (studentId) => API.get(`/projects/student/${studentId}`)
};
```

## Setup and Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd project-planner
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Environment Setup**
- Create `.env` file in server directory:
```env
NODE_ENV=development
PORT=8000
MONGO_URI=mongodb://localhost:27017/project-planner
JWT_SECRET=your_jwt_secret_key_for_tokens
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

## Running the Application

### Development Mode

1. **Start the backend server**
```bash
cd server
npm run dev
```
The server will run on http://localhost:8000

2. **Start the frontend development server**
```bash
cd client
npm run dev
```
The client will run on http://localhost:5173

### Database Setup

1. **Seed the database with sample data**
```bash
cd server
npm run seed
```

This will create:
- 2 teacher accounts
- 3 student accounts
- 3 sample projects

### Test Accounts

**Teachers:**
- Email: john.smith@example.com
  Password: password123
- Email: sarah.johnson@example.com
  Password: password123

**Students:**
- Email: alice.brown@example.com
  Password: password123
- Email: bob.wilson@example.com
  Password: password123
- Email: carol.davis@example.com
  Password: password123

## Available Scripts

### Server (in server directory)
```bash
npm run dev          # Start development server
npm run seed         # Seed database with sample data
npm run test:mongo   # Test MongoDB connection
```

### Client (in client directory)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## API Endpoints

### Authentication
- POST /api/users/register - Register new user
- POST /api/users/login - User login
- GET /api/users/me - Get current user profile

### Projects
- GET /api/projects - Get all projects
- POST /api/projects - Create new project
- GET /api/projects/:id - Get project by ID
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project
- GET /api/projects/student/:id - Get student's projects

### Students
- GET /api/students - Get all students
- POST /api/students - Create new student
- GET /api/students/:id - Get student by ID
- PUT /api/students/:id - Update student
- DELETE /api/students/:id - Delete student
- GET /api/students/stats - Get student statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 