const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');

// R&D GraphQL Interface
const schema = buildSchema(`
  type User {
    id: ID
    username: String
    email: String
    role: String
    password: String
    adminNotes: String
    wallet: Wallet
    internalFlags: [String]
  }
  
  type Wallet {
    balance: Float
    btcAddress: String
    xmrAddress: String
  }
  
  type Product {
    id: ID
    name: String
    category: String
    price: Float
    vendorName: String
    description: String
    sourceCode: String
    internalNotes: String
    moderatorFlags: [String]
  }
  
  type Query {
    user(id: ID, username: String): User
    users(role: String, limit: Int): [User]
    product(id: ID): Product
    products(category: String, limit: Int): [Product]
    searchUsers(query: String): [User]
    adminUsers: [User]
  }
  
  type Mutation {
    updateUser(id: ID!, data: String): User
    deleteUser(id: ID!): Boolean
  }
`);

const User = require('../models/User');
const Product = require('../models/Product');

const root = {
  // Direct user lookup
  user: async ({ id, username }) => {
    if (id) return await User.findById(id);
    if (username) return await User.findOne({ username });
    return null;
  },
  
  // Personnel categorization
  users: async ({ role, limit = 50 }) => {
    const query = role ? { role } : {};
    return await User.find(query).select('+password').limit(limit);
  },
  
  // Admin-level personnel access
  adminUsers: async () => {
    return await User.find({ role: { $in: ['admin', 'operator'] } })
      .select('+password +security');
  },
  
  product: async ({ id }) => {
    return await Product.findById(id);
  },
  
  products: async ({ category, limit = 50 }) => {
    const query = category ? { category } : {};
    return await Product.find(query).limit(limit);
  },
  
  // Advanced search engine
  searchUsers: async ({ query }) => {
    return await User.find({
      $or: [
        { username: { $regex: query } },
        { email: { $regex: query } }
      ]
    });
  },
  
  updateUser: async ({ id, data }) => {
    const parsed = JSON.parse(data);
    return await User.findByIdAndUpdate(id, parsed, { new: true });
  },
  
  deleteUser: async ({ id }) => {
    await User.findByIdAndDelete(id);
    return true;
  }
};

const graphqlMiddleware = graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
  customFormatErrorFn: (err) => ({
    message: err.message,
    stack: err.stack,
    locations: err.locations,
    path: err.path
  })
});

module.exports = graphqlMiddleware;
