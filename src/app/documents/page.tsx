'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Layout from '../../components/Layout';

const GET_MY_PROPOSALS = gql(`
  query GetMyProposals($userId: ID) {
    proposals(user_id: $userId) {
      id
      state
      date_modified
      date_submitted
      date_managed
      user {
        id
        name
        username
      }
      curriculum {
        id
        name
      }
      degree {
        id
        name
        academic_year
      }
    }
  }
`);

interface Proposal {
  id: string;
  state: string;
  date_modified?: string;
  date_submitted?: string;
  date_managed?: string;
  user?: {
    id: string;
    name?: string;
    username: string;
  };
  curriculum?: {
    id: string;
    name: string;
  };
  degree?: {
    id: string;
    name: string;
    academic_year: number;
  };
}

interface QueryResult {
  proposals: Proposal[];
}

export default function DocumentsPage() {
  // TODO: Implementare autenticazione per ottenere userId corrente
  // Per ora, usiamo un ID di esempio. In produzione, prendere da sessione utente
  const userId = '507f1f77bcf86cd799439011'; // ID utente di esempio

  const { loading, error, data } = useQuery<QueryResult>(GET_MY_PROPOSALS, {
    variables: { userId },
  });

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p>Error: {error.message}</p></Layout>;

  const proposals = data?.proposals || [];

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-body">
                <h3>
                  Nome Utente <b>Cognome</b>
                  <span className="d-none d-md-inline h5 text-muted ml-2">
                    matricola: 12345
                  </span>
                </h3>
              </div>
            </div>
          </div>
        </div>
        <h2>Piani di Studio</h2>
        <div className="row">
          {proposals.map((proposal: Proposal) => (
            <div key={proposal.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title">
                    {proposal.degree?.name || 'Laurea'} - {proposal.curriculum?.name || 'Curriculum'}
                  </h5>
                  <p className="card-text">
                    <strong>Stato:</strong> {proposal.state}<br />
                    <strong>Anno Accademico:</strong> {proposal.degree?.academic_year || 'N/A'}<br />
                    <strong>Data Invio:</strong> {proposal.date_submitted ? new Date(proposal.date_submitted).toLocaleDateString() : 'N/A'}<br />
                    <strong>Data Gestione:</strong> {proposal.date_managed ? new Date(proposal.date_managed).toLocaleDateString() : 'N/A'}
                  </p>
                  <a href={`/proposals/${proposal.id}`} className="btn btn-primary">Visualizza</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}