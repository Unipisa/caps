'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState } from 'react';
import Layout from '../../components/Layout';

const GET_PROPOSALS = gql`
  query GetProposalsPage($limit: Int, $user_first_name: String, $user_last_name: String, $state: String, $curriculum_name: String, $degree_name: String, $degree_academic_year: Int) {
    proposals(limit: $limit, user_first_name: $user_first_name, user_last_name: $user_last_name, state: $state, curriculum_name: $curriculum_name, degree_name: $degree_name, degree_academic_year: $degree_academic_year) {
      id
      user {
        id
        username
        first_name
        last_name
        id_number
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
      state
      date_modified
      date_submitted
      date_managed
    }
  }
`;

interface Proposal {
  id: string;
  user: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    id_number?: string;
  };
  curriculum: {
    id: string;
    name: string;
  };
  degree: {
    id: string;
    name: string;
    academic_year: number;
  };
  state: string;
  date_modified?: string;
  date_submitted?: string;
  date_managed?: string;
}

interface FilterState {
  user_first_name: string;
  user_last_name: string;
  state: string;
  curriculum_name: string;
  degree_name: string;
  degree_academic_year: string;
}

export default function ProposalsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    user_first_name: '',
    user_last_name: '',
    state: '',
    curriculum_name: '',
    degree_name: '',
    degree_academic_year: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    user_first_name: '',
    user_last_name: '',
    state: '',
    curriculum_name: '',
    degree_name: '',
    degree_academic_year: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(20);

  const { loading, error, data } = useQuery<{ proposals: Proposal[] }>(GET_PROPOSALS, {
    variables: {
      limit,
      user_first_name: appliedFilters.user_first_name || undefined,
      user_last_name: appliedFilters.user_last_name || undefined,
      state: appliedFilters.state || undefined,
      curriculum_name: appliedFilters.curriculum_name || undefined,
      degree_name: appliedFilters.degree_name || undefined,
      degree_academic_year: appliedFilters.degree_academic_year ? parseInt(appliedFilters.degree_academic_year) : undefined,
    },
  });

  const proposals = data?.proposals || [];

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === proposals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(proposals.map(proposal => proposal.id));
    }
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    const emptyFilters = {
      user_first_name: '',
      user_last_name: '',
      state: '',
      curriculum_name: '',
      degree_name: '',
      degree_academic_year: '',
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const activeFiltersCount = Object.values(appliedFilters).filter(value => value !== '').length;

  const getStateBadge = (state: string) => {
    const badges: { [key: string]: string } = {
      draft: 'secondary',
      submitted: 'primary',
      approved: 'success',
      rejected: 'danger',
    };
    return badges[state] || 'secondary';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  return (
    <Layout>
      <div>
        <h2 className="text-primary">Piani di Studio</h2>

        {error && <p className="text-danger">Errore nel caricamento dei piani di studio</p>}

        {(!data && loading) && <p>Caricamento...</p>}

        {(data || !loading) && (
          <div className="card shadow mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <button
                  className="btn btn-secondary btn-sm me-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="fas fa-filter"></i>
                  <span className="ms-2">Filtra {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                </button>
                <button className="btn btn-primary btn-sm me-2">
                  Nuovo piano di studio
                </button>
                <button
                  className="btn btn-success btn-sm me-2"
                  disabled={!selectedIds.length}
                >
                  Approva
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={!selectedIds.length}
                >
                  Rifiuta
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="card-body border-bottom">
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.user_first_name}
                      onChange={(e) => updateFilter('user_first_name', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Filtra per nome..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Cognome</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.user_last_name}
                      onChange={(e) => updateFilter('user_last_name', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Filtra per cognome..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Curriculum</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.curriculum_name}
                      onChange={(e) => updateFilter('curriculum_name', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Filtra per curriculum..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Corso di Laurea</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.degree_name}
                      onChange={(e) => updateFilter('degree_name', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Filtra per corso..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Anno Accademico</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={filters.degree_academic_year}
                      onChange={(e) => updateFilter('degree_academic_year', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Anno..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Stato</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.state}
                      onChange={(e) => updateFilter('state', e.target.value)}
                    >
                      <option value="">Tutti gli stati</option>
                      <option value="draft">Bozza</option>
                      <option value="submitted">Inviato</option>
                      <option value="approved">Approvato</option>
                      <option value="rejected">Rifiutato</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 d-flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={applyFilters}>
                    <i className="fas fa-search"></i> Applica filtri
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                    <i className="fas fa-times"></i> Cancella filtri
                  </button>
                </div>
              </div>
            )}

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === proposals.length && proposals.length > 0}
                          onChange={selectAll}
                        />
                      </th>
                      <th>Studente</th>
                      <th>Curriculum</th>
                      <th>Corso di Laurea</th>
                      <th>Stato</th>
                      <th>Data Modifica</th>
                      <th>Data Invio</th>
                      <th>Data Gestione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((proposal) => (
                        <tr key={proposal.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(proposal.id)}
                              onChange={() => toggleSelection(proposal.id)}
                            />
                          </td>
                          <td>
                            <a href={`/proposals/${proposal.id}`}>
                              {proposal.user.first_name} {proposal.user.last_name}
                              {proposal.user.id_number && ` (${proposal.user.id_number})`}
                            </a>
                          </td>
                          <td>
                            <a href={`/proposals/${proposal.id}`}>{proposal.curriculum.name}</a>
                          </td>
                          <td>
                            <a href={`/proposals/${proposal.id}`}>
                              {proposal.degree ? `${proposal.degree.name} (${proposal.degree.academic_year})` : 'Corso non trovato'}
                            </a>
                          </td>
                          <td>
                            <span className={`badge bg-${getStateBadge(proposal.state)}`}>
                              {proposal.state === 'draft' && 'Bozza'}
                              {proposal.state === 'submitted' && 'Inviato'}
                              {proposal.state === 'approved' && 'Approvato'}
                              {proposal.state === 'rejected' && 'Rifiutato'}
                            </span>
                          </td>
                          <td>{formatDate(proposal.date_modified)}</td>
                          <td>{formatDate(proposal.date_submitted)}</td>
                          <td>{formatDate(proposal.date_managed)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {proposals.length >= limit && (
                <div className="card-body text-center">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setLimit(prev => prev * 10)}
                    disabled={loading}
                  >
                    {proposals.length} piani di studio visualizzati, carica altri...
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}