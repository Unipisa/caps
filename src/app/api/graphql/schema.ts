import { GraphQLJSON } from 'graphql-type-json';
import fs from 'fs';
import path from 'path';
import { Query } from './resolvers/queryResolvers';
import { Mutation } from './resolvers/mutationResolvers';
import { Proposal } from './resolvers/proposalResolvers';
import { Curriculum } from './resolvers/curriculumResolvers';
import { Attachment } from './resolvers/attachmentResolvers';

export const typeDefs = fs.readFileSync(path.join(process.cwd(), 'src/app/api/graphql/schema.gql'), 'utf8');

export const resolvers = {
  JSON: GraphQLJSON,
  Query,
  Mutation,
  Proposal,
  Curriculum,
  Attachment,
};