const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri, config.mongo.options);
    console.log(`\x1b[32m[HELLCORP DB]\x1b[0m MongoDB connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error(`\x1b[31m[HELLCORP DB ERROR]\x1b[0m ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('\x1b[33m[HELLCORP DB]\x1b[0m MongoDB disconnected. Reconnecting...');
      setTimeout(connectDB, 5000);
    });
    
  } catch (err) {
    console.error(`\x1b[31m[HGE DB FATAL]\x1b[0m Connection failure detected.`);
    process.exit(1);
  }
};

module.exports = connectDB;
