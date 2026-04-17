const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');

// INTENTIONAL VULN G1: GraphQL introspection enabled in production
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
  // INTENTIONAL VULN G2: No auth on sensitive queries
  user: async ({ id, username }) => {
    if (id) return await User.findById(id);
    if (username) return await User.findOne({ username });
    return null;
  },
  
  // INTENTIONAL VULN G2: Returns all users with sensitive data
  users: async ({ role, limit = 50 }) => {
    const query = role ? { role } : {};
    // INTENTIONAL VULN D4: Password hashes returned
    return await User.find(query).select('+password').limit(limit);
  },
  
  // INTENTIONAL VULN G2: No auth required for admin users
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
  
  // INTENTIONAL VULN G3: Batch query abuse - no depth limiting
  searchUsers: async ({ query }) => {
    // INTENTIONAL VULN I1: Regex injection
    return await User.find({
      $or: [
        { username: { $regex: query } },
        { email: { $regex: query } }
      ]
    });
  },
  
  // INTENTIONAL VULN A5: No auth on mutations
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
  // INTENTIONAL VULN G1: GraphiQL enabled in production
  graphiql: true,
  // INTENTIONAL VULN G3: No query complexity/depth limiting
  customFormatErrorFn: (err) => ({
    message: err.message,
    // INTENTIONAL VULN D1: Stack trace in error
    stack: err.stack,
    locations: err.locations,
    path: err.path
  })
});

module.exports = graphqlMiddleware;
