'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_USERS_COUNT = gql`
  query GetUsersCount {
    users {
      id
    }
  }
`;

const GET_EXAMS_COUNT = gql`
  query GetExamsCount {
    exams {
      id
    }
  }
`;

const GET_DEGREES_COUNT = gql`
  query GetDegreesCount {
    degrees {
      id
    }
  }
`;

const GET_CURRICULA_COUNT = gql`
  query GetCurriculaCount {
    curricula {
      id
    }
  }
`;

const GET_PROPOSALS_COUNT = gql`
  query GetProposalsCount {
    proposals {
      id
    }
  }
`;

export default function Dashboard() {
  const usersQuery = useQuery<{ users: { id: string }[] }>(GET_USERS_COUNT);
  const examsQuery = useQuery<{ exams: { id: string }[] }>(GET_EXAMS_COUNT);
  const degreesQuery = useQuery<{ degrees: { id: string }[] }>(GET_DEGREES_COUNT);
  const curriculaQuery = useQuery<{ curricula: { id: string }[] }>(GET_CURRICULA_COUNT);
  const proposalsQuery = useQuery<{ proposals: { id: string }[] }>(GET_PROPOSALS_COUNT);

  const stats = {
    users: usersQuery.data?.users?.length || 0,
    exams: examsQuery.data?.exams?.length || 0,
    degrees: degreesQuery.data?.degrees?.length || 0,
    curricula: curriculaQuery.data?.curricula?.length || 0,
    proposals: proposalsQuery.data?.proposals?.length || 0,
  };

  const loading = usersQuery.loading || examsQuery.loading || degreesQuery.loading || curriculaQuery.loading || proposalsQuery.loading;
  const error = usersQuery.error || examsQuery.error || degreesQuery.error || curriculaQuery.error || proposalsQuery.error;

  return (
    <div>
      <h1 className="h3 mb-4 text-gray-800">Pannello di Controllo</h1>

      {loading && <p>Caricamento statistiche...</p>}
      {error && <p className="text-danger">Errore nel caricamento delle statistiche</p>}

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