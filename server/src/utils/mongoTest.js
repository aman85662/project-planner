const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars with correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('MongoDB Connection Test');
console.log('----------------------');
console.log(`MONGO_URI is: ${process.env.MONGO_URI ? process.env.MONGO_URI : 'UNDEFINED'}`);

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI environment variable is not defined!');
  console.error('Please make sure your .env file exists and contains MONGO_URI=mongodb://localhost:27017/project-planner');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('Connected to MongoDB successfully!');
  console.log(`Host: ${mongoose.connection.host}`);
  console.log(`Database: ${mongoose.connection.name}`);
  console.log('Connection test passed!');
  process.exit(0);
})
.catch(err => {
  console.error('Failed to connect to MongoDB:');
  console.error(`Error Type: ${err.name}`);
  console.error(`Error Message: ${err.message}`);
  
  // Get more information about the error
  if (err.name === 'MongoServerSelectionError') {
    console.error('\nPossible causes:');
    console.error('1. MongoDB service is not running');
    console.error('2. MongoDB URI is incorrect');
    console.error('3. Network connectivity issues');
    console.error('\nTroubleshooting steps:');
    console.error('1. Make sure MongoDB is installed and running:');
    console.error('   - On Windows: Check if MongoDB service is running in Services');
    console.error('   - On Linux/Mac: Run "sudo systemctl status mongodb" or "brew services list"');
    console.error('2. Try connecting with MongoDB Compass or mongo shell');
    console.error('3. Update your MONGO_URI in the .env file');
  }
  
  process.exit(1);
}); 