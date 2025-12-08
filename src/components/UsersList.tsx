'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_USERS = gql`
  query GetUsersForList {
    users {
      id
      username
      name
      email
      admin
    }
  }
`;

const GET_EXAMS = gql`
  query GetExamsForList {
    exams {
      id
      name
      code
      sector
      credits
    }
  }
`;

const GET_DEGREES = gql`
  query GetDegreesForUsersList {
    degrees {
      id
      name
      academic_year
      enabled
    }
  }
`;

const GET_CURRICULA = gql`
  query GetCurriculaForUsersList {
    curricula {
      id
      name
      notes
    }
  }
`;

const GET_PROPOSALS = gql`
  query GetProposals {
    proposals {
      id
      state
      user {
        username
      }
      curriculum {
        name
      }
      degree {
        name
      }
    }
  }
`;

interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  admin: boolean;
}

interface Exam {
  id: string;
  name: string;
  code?: string;
  sector: string;
  credits: number;
}

interface Degree {
  id: string;
  name: string;
  academic_year: number;
  enabled: boolean;
}

interface Curriculum {
  id: string;
  name: string;
  notes?: string;
}

interface Proposal {
  id: string;
  state: string;
  user?: User;
  curriculum?: Curriculum;
  degree?: Degree;
}

export default function Dashboard() {
  const usersQuery = useQuery<{ users: User[] }>(GET_USERS);
  const examsQuery = useQuery<{ exams: Exam[] }>(GET_EXAMS);
  const degreesQuery = useQuery<{ degrees: Degree[] }>(GET_DEGREES);
  const curriculaQuery = useQuery<{ curricula: Curriculum[] }>(GET_CURRICULA);
  const proposalsQuery = useQuery<{ proposals: Proposal[] }>(GET_PROPOSALS);

  const users = usersQuery.data?.users || [];
  const exams = examsQuery.data?.exams || [];
  const degrees = degreesQuery.data?.degrees || [];
  const curricula = curriculaQuery.data?.curricula || [];
  const proposals = proposalsQuery.data?.proposals || [];

  const loading = usersQuery.loading || examsQuery.loading || degreesQuery.loading || curriculaQuery.loading || proposalsQuery.loading;
  const error = usersQuery.error || examsQuery.error || degreesQuery.error || curriculaQuery.error || proposalsQuery.error;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">CAPS Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
          <ul className="space-y-2">
            {users.slice(0, 5).map((user) => (
              <li key={user.id} className="text-sm">
                {user.username} {user.admin && '(Admin)'}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Exams ({exams.length})</h2>
          <ul className="space-y-2">
            {exams.slice(0, 5).map((exam) => (
              <li key={exam.id} className="text-sm">
                {exam.name} ({exam.credits} CFU)
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Degrees ({degrees.length})</h2>
          <ul className="space-y-2">
            {degrees.slice(0, 5).map((degree) => (
              <li key={degree.id} className="text-sm">
                {degree.name} ({degree.academic_year})
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Curricula ({curricula.length})</h2>
          <ul className="space-y-2">
            {curricula.slice(0, 5).map((curriculum) => (
              <li key={curriculum.id} className="text-sm">
                {curriculum.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Proposals ({proposals.length})</h2>
          <ul className="space-y-2">
            {proposals.slice(0, 5).map((proposal) => (
              <li key={proposal.id} className="text-sm">
                {proposal.user?.username} - {proposal.state}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}