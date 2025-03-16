const mongoose = require('mongoose');

const connectDB = async () => {
  // Check if MONGO_URI is defined
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  console.log(`Attempting to connect to MongoDB: ${process.env.MONGO_URI}`);

  try {
    // Increase the timeout and add more robust connection options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Increase timeout to 5 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Set up connection event listeners
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, attempting to reconnect...');
      setTimeout(() => connectDB().catch(err => console.error(err)), 5000);
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(() => connectDB().catch(err => console.error(err)), 5000);
    throw error; // rethrow to be caught in the main file
  }
};

module.exports = connectDB; 