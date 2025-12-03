import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import mongoose from 'mongoose';
import User from '../../../../models/User';
import Proposal from '../../../../models/Proposal';
import Exam from '../../../../models/Exam';
import Curriculum from '../../../../models/Curriculum';
import Degree from '../../../../models/Degree';

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

    type Exam {
      id: ID!
      name: String!
      code: String
      sector: String!
      credits: Int!
      tags: [String!]
      notes: String
    }

    type Degree {
      id: ID!
      name: String!
      academic_year: Int!
      years: Int!
      enabled: Boolean!
      sharing_mode: String!
    }

    type Curriculum {
      id: ID!
      name: String!
      notes: String
      degree: Degree
    }

    type Proposal {
      id: ID!
      user: User
      curriculum: Curriculum
      degree: Degree
      state: String!
      date_modified: String
      date_submitted: String
      date_managed: String
    }

    type Query {
      users: [User!]!
      user(id: ID!): User
      exams: [Exam!]!
      exam(id: ID!): Exam
      degrees: [Degree!]!
      degree(id: ID!): Degree
      curricula: [Curriculum!]!
      curriculum(id: ID!): Curriculum
      proposals: [Proposal!]!
      proposal(id: ID!): Proposal
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
      exams: async () => {
        return await Exam.find();
      },
      exam: async (_: any, { id }: { id: string }) => {
        return await Exam.findById(id);
      },
      degrees: async () => {
        return await Degree.find();
      },
      degree: async (_: any, { id }: { id: string }) => {
        return await Degree.findById(id);
      },
      curricula: async () => {
        return await Curriculum.find();
      },
      curriculum: async (_: any, { id }: { id: string }) => {
        return await Curriculum.findById(id);
      },
      proposals: async () => {
        return await Proposal.find();
      },
      proposal: async (_: any, { id }: { id: string }) => {
        return await Proposal.findById(id);
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
    Proposal: {
      user: async (parent: any) => {
        return await User.findById(parent.user_id);
      },
      curriculum: async (parent: any) => {
        return await Curriculum.findById(parent.curriculum_id);
      },
      degree: async (parent: any) => {
        return await Degree.findById(parent.degree_id);
      },
    },
    Curriculum: {
      degree: async (parent: any) => {
        return await Degree.findById(parent.degree_id);
      },
    },
  },
});

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
});

export { handleRequest as GET, handleRequest as POST };