import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import mongoose from 'mongoose';
import User from '../../../../models/User';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/caps';
mongoose.connect(mongoUri);

const schema = createSchema({
  typeDefs: `
    type User {
      id: ID!
      username: String!
      name: String
      email: String
      admin: Boolean!
    }

    type Query {
      users: [User!]!
      user(id: ID!): User
    }

    type Mutation {
      createUser(username: String!, password: String!, admin: Boolean): User
    }
  `,
  resolvers: {
    Query: {
      users: async () => {
        return await User.find();
      },
      user: async (_: any, { id }: { id: string }) => {
        return await User.findById(id);
      },
    },
    Mutation: {
      createUser: async (_: any, { username, password, admin }: { username: string; password: string; admin?: boolean }) => {
        const user = new User({ username, admin: admin || false });
        await (user as any).setPassword(password);
        await user.save();
        return user;
      },
    },
  },
});

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
});

export { handleRequest as GET, handleRequest as POST };