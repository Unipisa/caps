'use client';

import { useState, useEffect } from 'react';

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
  const [users, setUsers] = useState<User[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queries = [
          { name: 'users', query: 'users { id username name email admin }' },
          { name: 'exams', query: 'exams { id name code sector credits }' },
          { name: 'degrees', query: 'degrees { id name academic_year enabled }' },
          { name: 'curricula', query: 'curricula { id name notes }' },
          { name: 'proposals', query: 'proposals { id state user { username } curriculum { name } degree { name } }' },
        ];

        const results: any = {};

        for (const { name, query } of queries) {
          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: `{ ${query} }` }),
          });
          const result = await response.json();
          if (result.errors) {
            throw new Error(result.errors[0].message);
          }
          results[name] = result.data[name];
        }

        setUsers(results.users);
        setExams(results.exams);
        setDegrees(results.degrees);
        setCurricula(results.curricula);
        setProposals(results.proposals);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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