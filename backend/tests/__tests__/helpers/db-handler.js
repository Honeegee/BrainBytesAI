// db-handler.js - Handles database connection for tests
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

mongoose.set('useCreateIndex', true); // Use createIndex instead of ensureIndex

// Singleton pattern for MongoDB connection management
class MongooseTestConnection {
  constructor() {
    this.mongoServer = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // If already connected, return immediately
      if (this.isConnected && mongoose.connection.readyState === 1) {
        return;
      }

      // Disconnect if connection exists but is not in the right state
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      // Create a new MongoDB memory server
      this.mongoServer = await MongoMemoryServer.create();
      const uri = this.mongoServer.getUri();

      // Connect with specified options
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });

      this.isConnected = true;
      console.log('MongoDB Memory Server connected successfully');
    } catch (error) {
      console.error('Error connecting to MongoDB Memory Server:', error);
      throw error;
    }
  }

  async closeDatabase() {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
      }

      if (this.mongoServer) {
        await this.mongoServer.stop();
        this.mongoServer = null;
      }

      this.isConnected = false;
      console.log('MongoDB Memory Server disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting from MongoDB Memory Server:', error);
      throw error;
    }
  }

  async clearDatabase() {
    try {
      if (!this.isConnected || mongoose.connection.readyState === 0) {
        console.log('Not connected to any database, skipping clear operation');
        return;
      }

      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }

      console.log('All collections cleared successfully');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }
}

// Export singleton instance
const dbHandler = new MongooseTestConnection();

module.exports = {
  connect: () => dbHandler.connect(),
  closeDatabase: () => dbHandler.closeDatabase(),
  clearDatabase: () => dbHandler.clearDatabase(),
};