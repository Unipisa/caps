import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { GraphQLJSON } from 'graphql-type-json';
import { NextRequest } from 'next/server';
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
    scalar JSON

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
      groups: JSON
      default_group: String
      approval_confirmation: Boolean!
      rejection_confirmation: Boolean!
      submission_confirmation: Boolean!
      approval_message: String
      rejection_message: String
      submission_message: String
      free_choice_message: String
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
      examsByIds(ids: [ID!]!): [Exam!]!
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
    JSON: GraphQLJSON,
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
      examsByIds: async (_: any, { ids }: { ids: string[] }) => {
        return await Exam.find({ _id: { $in: ids } });
      },
      exam: async (_: any, { id }: { id: string }) => {
        return await Exam.findById(id);
      },
      degrees: async () => {
        const degrees = await Degree.find();
        return degrees.map(deg => ({
          id: deg._id,
          name: deg.name,
          academic_year: deg.academic_year,
          years: deg.years,
          enabled: deg.enabled,
          sharing_mode: deg.sharing_mode,
        }));
      },
      degree: async (_: any, { id }: { id: string }) => {
        const deg = await Degree.findById(id);
        if (deg) {
          return {
            id: deg._id,
            name: deg.name,
            academic_year: deg.academic_year,
            years: deg.years,
            enabled: deg.enabled,
            sharing_mode: deg.sharing_mode,
            groups: Object.fromEntries(deg.groups),
            default_group: deg.default_group,
            approval_confirmation: deg.approval_confirmation,
            rejection_confirmation: deg.rejection_confirmation,
            submission_confirmation: deg.submission_confirmation,
            approval_message: deg.approval_message,
            rejection_message: deg.rejection_message,
            submission_message: deg.submission_message,
            free_choice_message: deg.free_choice_message,
          };
        }
        return null;
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
  fetchAPI: globalThis,
});

export { handleRequest as GET, handleRequest as POST };