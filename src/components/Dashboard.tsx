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
  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    degrees: 0,
    curricula: 0,
    proposals: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const queries = [
          { name: 'users', query: 'users { id }' },
          { name: 'exams', query: 'exams { id }' },
          { name: 'degrees', query: 'degrees { id }' },
          { name: 'curricula', query: 'curricula { id }' },
          { name: 'proposals', query: 'proposals { id }' },
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
            console.error(`Error fetching ${name}:`, result.errors);
            results[name] = [];
          } else {
            results[name] = result.data[name];
          }
        }

        setStats({
          users: results.users.length,
          exams: results.exams.length,
          degrees: results.degrees.length,
          curricula: results.curricula.length,
          proposals: results.proposals.length,
        });
      } catch (err: any) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="h3 mb-4 text-gray-800">Pannello di Controllo</h1>

      <div className="row">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Utenti
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.users}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Esami
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.exams}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-tasks fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Corsi di Laurea
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.degrees}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-university fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Curricula
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.curricula}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-scroll fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-danger shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    Piani di Studio
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.proposals}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-file-alt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}