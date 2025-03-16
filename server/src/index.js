// // Suppress process warnings
// process.emitWarning = function() {};

// // Load suppressor for deprecated warnings
// require('./suppressor');

// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');
// const morgan = require('morgan');
// const mongoose = require('mongoose');
// const connectDB = require('./config/db');
// const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// // Load environment variables with correct path
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// // Verify the MongoDB URI is loaded
// if (!process.env.MONGO_URI) {
//   console.error('ERROR: MONGO_URI environment variable is not defined!');
//   console.error('Please make sure your .env file exists and contains MONGO_URI');
//   process.exit(1);
// }

// // Routes
// const studentRoutes = require('./routes/studentRoutes');
// const userRoutes = require('./routes/userRoutes');
// const projectRoutes = require('./routes/projectRoutes');

// const app = express();
// const PORT = process.env.PORT || 8000;

// // Middleware
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // API Routes
// app.use('/api/students', studentRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes);

// // Root route
// app.get('/', (req, res) => {
//   res.send('API is running....');
// });

// // Middleware for error handling
// app.use(notFound);
// app.use(errorHandler);

// // Connect to MongoDB and then start the server
// connectDB()
//   .then(() => {
//     // Start server only after successful MongoDB connection
//     const server = app.listen(PORT, () => {
//       console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
//     });

//     // Handle unhandled promise rejections
//     process.on('unhandledRejection', (err) => {
//       console.error(`Unhandled Rejection: ${err}`);
//       // Close server & exit process gracefully
//       server.close(() => {
//         console.log('Server closed due to unhandled promise rejection');
//         process.exit(1);
//       });
//     });
//   })
//   .catch(err => {
//     console.error(`Failed to connect to MongoDB: ${err.message}`);
//     process.exit(1);
//   }); 

// Suppress process warnings
process.emitWarning = function() {};

// Load suppressor for deprecated warnings
require('./suppressor');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Load environment variables with correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verify the MongoDB URI is loaded
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI environment variable is not defined!');
  console.error('Please make sure your .env file exists and contains MONGO_URI');
  process.exit(1);
}

// Routes
const studentRoutes = require('./routes/studentRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running....');
});

// Middleware for error handling
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and then start the server
connectDB()
  .then(() => {
    // Start server only after successful MongoDB connection
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err}`);
      // Close server & exit process gracefully
      server.close(() => {
        console.log('Server closed due to unhandled promise rejection');
        process.exit(1);
      });
    });
  })
  .catch(err => {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  });