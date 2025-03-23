const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Log the MongoDB URI (with password hidden)
const uri = process.env.MONGO_URI;
const maskedUri = uri ? uri.replace(/:([^@]+)@/, ':****@') : 'not set';
console.log('MONGO_URI:', maskedUri);

// Test connection
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 