const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // For production, use the MongoDB URI from environment variables
    if (process.env.NODE_ENV === 'production') {
      // Check if MONGO_URI is defined
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is not defined for production');
      }

      console.log(`Connecting to MongoDB: ${process.env.MONGO_URI}`);
      
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } 
    // For development, use MongoDB Memory Server
    else {
      console.log('Using MongoDB Memory Server for development');
      
      // Close existing connection if any
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      
      // Start MongoDB Memory Server if not already running
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        console.log(`MongoDB Memory Server URI: ${mongoUri}`);
        
        const conn = await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        
        console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
        
        // Set up connection event listeners
        mongoose.connection.on('error', err => {
          console.error(`MongoDB connection error: ${err}`);
        });
        
        return conn;
      }
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

// Function to close the connection and stop the server
const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

module.exports = { connectDB, closeDatabase }; 