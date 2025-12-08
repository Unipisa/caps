export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
};

export type Attachment = {
  __typename?: 'Attachment';
  content?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  encoding?: Maybe<Scalars['String']['output']>;
  filename?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mimetype?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
};

export type Curriculum = {
  __typename?: 'Curriculum';
  degree?: Maybe<Degree>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
};

export type CurriculumInput = {
  degree_id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type Degree = {
  __typename?: 'Degree';
  academic_year: Scalars['Int']['output'];
  approval_confirmation: Scalars['Boolean']['output'];
  approval_message?: Maybe<Scalars['String']['output']>;
  default_group?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  free_choice_message?: Maybe<Scalars['String']['output']>;
  groups?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rejection_confirmation: Scalars['Boolean']['output'];
  rejection_message?: Maybe<Scalars['String']['output']>;
  sharing_mode: Scalars['String']['output'];
  submission_confirmation: Scalars['Boolean']['output'];
  submission_message?: Maybe<Scalars['String']['output']>;
  years: Scalars['Int']['output'];
};

export type DegreeInput = {
  academic_year: Scalars['Int']['input'];
  approval_confirmation: Scalars['Boolean']['input'];
  approval_message?: InputMaybe<Scalars['String']['input']>;
  default_group?: InputMaybe<Scalars['String']['input']>;
  enabled: Scalars['Boolean']['input'];
  free_choice_message?: InputMaybe<Scalars['String']['input']>;
  groups?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
  rejection_confirmation: Scalars['Boolean']['input'];
  rejection_message?: InputMaybe<Scalars['String']['input']>;
  sharing_mode: Scalars['String']['input'];
  submission_confirmation: Scalars['Boolean']['input'];
  submission_message?: InputMaybe<Scalars['String']['input']>;
  years: Scalars['Int']['input'];
};

export type Exam = {
  __typename?: 'Exam';
  code?: Maybe<Scalars['String']['output']>;
  credits: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  sector: Scalars['String']['output'];
  tags?: Maybe<Array<Scalars['String']['output']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  changeProposalState?: Maybe<Proposal>;
  createCurriculum?: Maybe<Curriculum>;
  createProposal?: Maybe<Proposal>;
  createUser?: Maybe<User>;
  deleteCurriculum?: Maybe<Scalars['Boolean']['output']>;
  deleteDegree?: Maybe<Scalars['Boolean']['output']>;
  deleteProposal?: Maybe<Scalars['Boolean']['output']>;
  updateCurriculum?: Maybe<Curriculum>;
  updateDegree?: Maybe<Degree>;
  updateProposal?: Maybe<Proposal>;
};


export type MutationChangeProposalStateArgs = {
  id: Scalars['ID']['input'];
  state: Scalars['String']['input'];
};


export type MutationCreateCurriculumArgs = {
  input: CurriculumInput;
};


export type MutationCreateProposalArgs = {
  input: ProposalInput;
};


export type MutationCreateUserArgs = {
  admin?: InputMaybe<Scalars['Boolean']['input']>;
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationDeleteCurriculumArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDegreeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProposalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateCurriculumArgs = {
  id: Scalars['ID']['input'];
  input: CurriculumInput;
};


export type MutationUpdateDegreeArgs = {
  id: Scalars['ID']['input'];
  input: DegreeInput;
};


export type MutationUpdateProposalArgs = {
  id: Scalars['ID']['input'];
  input: ProposalInput;
};

export type Proposal = {
  __typename?: 'Proposal';
  curriculum?: Maybe<Curriculum>;
  date_managed?: Maybe<Scalars['String']['output']>;
  date_modified?: Maybe<Scalars['String']['output']>;
  date_submitted?: Maybe<Scalars['String']['output']>;
  degree?: Maybe<Degree>;
  id: Scalars['ID']['output'];
  state: Scalars['String']['output'];
  user?: Maybe<User>;
};

export type ProposalInput = {
  attachments?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  curriculum_id: Scalars['ID']['input'];
  exams?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>>>;
  state: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  attachment?: Maybe<Attachment>;
  attachments: Array<Attachment>;
  curricula: Array<Curriculum>;
  curriculum?: Maybe<Curriculum>;
  degree?: Maybe<Degree>;
  degrees: Array<Degree>;
  exam?: Maybe<Exam>;
  exams: Array<Exam>;
  examsByIds: Array<Exam>;
  proposal?: Maybe<Proposal>;
  proposals: Array<Proposal>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryAttachmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAttachmentsArgs = {
  uploader_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryCurriculumArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDegreeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExamsByIdsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type QueryProposalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProposalsArgs = {
  curriculum_name?: InputMaybe<Scalars['String']['input']>;
  degree_academic_year?: InputMaybe<Scalars['Int']['input']>;
  degree_name?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  user_first_name?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['ID']['input']>;
  user_last_name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  admin?: InputMaybe<Scalars['Boolean']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  id_number?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  admin: Scalars['Boolean']['output'];
  email?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  id_number?: Maybe<Scalars['String']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type GetCurriculumQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetCurriculumQuery = { __typename?: 'Query', curriculum?: { __typename?: 'Curriculum', id: string, name: string, notes?: string | null, degree?: { __typename?: 'Degree', id: string, name: string, academic_year: number } | null } | null };

export type CreateCurriculumMutationVariables = Exact<{
  input: CurriculumInput;
}>;


export type CreateCurriculumMutation = { __typename?: 'Mutation', createCurriculum?: { __typename?: 'Curriculum', id: string, name: string, notes?: string | null, degree?: { __typename?: 'Degree', id: string, name: string } | null } | null };

export type GetCurriculaForListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurriculaForListQuery = { __typename?: 'Query', curricula: Array<{ __typename?: 'Curriculum', id: string, name: string, notes?: string | null, degree?: { __typename?: 'Degree', id: string, name: string, academic_year: number } | null }> };

export type GetDegreesForCurriculaQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDegreesForCurriculaQuery = { __typename?: 'Query', degrees: Array<{ __typename?: 'Degree', id: string, name: string, academic_year: number }> };

export type GetDegreeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetDegreeQuery = { __typename?: 'Query', degree?: { __typename?: 'Degree', id: string, name: string, academic_year: number, years: number, enabled: boolean, sharing_mode: string, groups?: any | null, default_group?: string | null, approval_confirmation: boolean, rejection_confirmation: boolean, submission_confirmation: boolean, approval_message?: string | null, rejection_message?: string | null, submission_message?: string | null, free_choice_message?: string | null } | null };

export type DeleteDegreeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteDegreeMutation = { __typename?: 'Mutation', deleteDegree?: boolean | null };

export type GetExamsByIdsQueryVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type GetExamsByIdsQuery = { __typename?: 'Query', examsByIds: Array<{ __typename?: 'Exam', id: string, name: string, code?: string | null }> };

export type UpdateDegreeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: DegreeInput;
}>;


export type UpdateDegreeMutation = { __typename?: 'Mutation', updateDegree?: { __typename?: 'Degree', id: string, name: string, academic_year: number, years: number, enabled: boolean, sharing_mode: string, groups?: any | null, default_group?: string | null, approval_confirmation: boolean, rejection_confirmation: boolean, submission_confirmation: boolean, approval_message?: string | null, rejection_message?: string | null, submission_message?: string | null, free_choice_message?: string | null } | null };

export type GetDegreesForListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDegreesForListQuery = { __typename?: 'Query', degrees: Array<{ __typename?: 'Degree', id: string, name: string, academic_year: number, years: number, enabled: boolean, sharing_mode: string }> };

export type GetMyProposalsQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetMyProposalsQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string, state: string, date_modified?: string | null, date_submitted?: string | null, date_managed?: string | null, user?: { __typename?: 'User', id: string, name?: string | null, username: string } | null, curriculum?: { __typename?: 'Curriculum', id: string, name: string } | null, degree?: { __typename?: 'Degree', id: string, name: string, academic_year: number } | null }> };

export type GetProposalsPageQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  user_first_name?: InputMaybe<Scalars['String']['input']>;
  user_last_name?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  curriculum_name?: InputMaybe<Scalars['String']['input']>;
  degree_name?: InputMaybe<Scalars['String']['input']>;
  degree_academic_year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetProposalsPageQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string, state: string, date_modified?: string | null, date_submitted?: string | null, date_managed?: string | null, user?: { __typename?: 'User', id: string, username: string, first_name?: string | null, last_name?: string | null, id_number?: string | null } | null, curriculum?: { __typename?: 'Curriculum', id: string, name: string } | null, degree?: { __typename?: 'Degree', id: string, name: string, academic_year: number } | null }> };

export type GetUsersForPageQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  id_number?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  admin?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetUsersForPageQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, username: string, id_number?: string | null, first_name?: string | null, last_name?: string | null, email?: string | null, admin: boolean }> };

export type GetUsersCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersCountQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string }> };

export type GetExamsCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExamsCountQuery = { __typename?: 'Query', exams: Array<{ __typename?: 'Exam', id: string }> };

export type GetDegreesCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDegreesCountQuery = { __typename?: 'Query', degrees: Array<{ __typename?: 'Degree', id: string }> };

export type GetCurriculaCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurriculaCountQuery = { __typename?: 'Query', curricula: Array<{ __typename?: 'Curriculum', id: string }> };

export type GetProposalsCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalsCountQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string }> };

export type GetUsersForListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersForListQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, username: string, name?: string | null, email?: string | null, admin: boolean }> };

export type GetExamsForListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExamsForListQuery = { __typename?: 'Query', exams: Array<{ __typename?: 'Exam', id: string, name: string, code?: string | null, sector: string, credits: number }> };

export type GetDegreesForUsersListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDegreesForUsersListQuery = { __typename?: 'Query', degrees: Array<{ __typename?: 'Degree', id: string, name: string, academic_year: number, enabled: boolean }> };

export type GetCurriculaForUsersListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurriculaForUsersListQuery = { __typename?: 'Query', curricula: Array<{ __typename?: 'Curriculum', id: string, name: string, notes?: string | null }> };

export type GetProposalsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalsQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string, state: string, user?: { __typename?: 'User', username: string } | null, curriculum?: { __typename?: 'Curriculum', name: string } | null, degree?: { __typename?: 'Degree', name: string } | null }> };

export type GetAttachmentsQueryVariables = Exact<{
  uploader_id?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetAttachmentsQuery = { __typename?: 'Query', attachments: Array<{ __typename?: 'Attachment', id: string, filename?: string | null, mimetype?: string | null, size?: number | null, createdAt?: string | null, uploader?: { __typename?: 'User', id: string, username: string, name?: string | null } | null }> };
