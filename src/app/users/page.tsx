'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState } from 'react';
import Layout from '../../components/Layout';

const GET_USERS = gql`
  query GetUsers($limit: Int, $username: String, $id_number: String, $first_name: String, $last_name: String, $email: String, $admin: Boolean) {
    users(limit: $limit, username: $username, id_number: $id_number, first_name: $first_name, last_name: $last_name, email: $email, admin: $admin) {
      id
      username
      id_number
      first_name
      last_name
      email
      admin
    }
  }
`;

interface User {
  id: string;
  username: string;
  id_number?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  admin: boolean;
}

interface FilterState {
  username: string;
  id_number: string;
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean | null;
}

export default function UsersPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    username: '',
    id_number: '',
    first_name: '',
    last_name: '',
    email: '',
    admin: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(20);

  const { loading, error, data } = useQuery<{ users: User[] }>(GET_USERS, {
    variables: { 
      limit,
      username: filters.username || undefined,
      id_number: filters.id_number || undefined,
      first_name: filters.first_name || undefined,
      last_name: filters.last_name || undefined,
      email: filters.email || undefined,
      admin: filters.admin ?? undefined,
    },
  });

  const users = data?.users || [];

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(user => user.id));
    }
  };

  const updateFilter = (key: keyof FilterState, value: string | boolean | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      username: '',
      id_number: '',
      first_name: '',
      last_name: '',
      email: '',
      admin: null,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value =>
    value !== '' && value !== null
  ).length;

  return (
    <Layout>
      <div>
        <h2 className="text-primary">Utenti</h2>

        {error && <p className="text-danger">Errore nel caricamento degli utenti</p>}

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
                  Aggiungi utente
                </button>
                <button
                  className="btn btn-secondary btn-sm me-2"
                  disabled={!selectedIds.length}
                >
                  Rendi admin
                </button>
                <button
                  className="btn btn-warning btn-sm"
                  disabled={!selectedIds.length}
                >
                  Rimuovi da admin
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="card-body border-bottom">
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.username}
                      onChange={(e) => updateFilter('username', e.target.value)}
                      placeholder="Cerca username..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Matricola</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.id_number}
                      onChange={(e) => updateFilter('id_number', e.target.value)}
                      placeholder="Cerca matricola..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.first_name}
                      onChange={(e) => updateFilter('first_name', e.target.value)}
                      placeholder="Cerca nome..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Cognome</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.last_name}
                      onChange={(e) => updateFilter('last_name', e.target.value)}
                      placeholder="Cerca cognome..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Email</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.email}
                      onChange={(e) => updateFilter('email', e.target.value)}
                      placeholder="Cerca email..."
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Admin</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.admin === null ? '' : filters.admin.toString()}
                      onChange={(e) => updateFilter('admin', e.target.value === '' ? null : e.target.value === 'true')}
                    >
                      <option value="">Tutti</option>
                      <option value="true">Solo admin</option>
                      <option value="false">Non admin</option>
                    </select>
                  </div>
                </div>
                {activeFiltersCount > 0 && (
                  <div className="mt-3">
                    <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                      <i className="fas fa-times"></i> Cancella filtri
                    </button>
                  </div>
                )}
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
                          checked={selectedIds.length === users.length && users.length > 0}
                          onChange={selectAll}
                        />
                      </th>
                      <th>Matricola</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Cognome</th>
                      <th>Nome</th>
                      <th>Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(user.id)}
                            onChange={() => toggleSelection(user.id)}
                          />
                        </td>
                        <td>
                          <a href={`/users/${user.id}`}>{user.id_number || '-'}</a>
                        </td>
                        <td>
                          <a href={`/users/${user.id}`}>{user.username}</a>
                        </td>
                        <td>
                          <a href={`/users/${user.id}`}>{user.email || '-'}</a>
                        </td>
                        <td>
                          <a href={`/users/${user.id}`}>{user.last_name || '-'}</a>
                        </td>
                        <td>
                          <a href={`/users/${user.id}`}>{user.first_name || '-'}</a>
                        </td>
                        <td>{user.admin ? '•' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length >= limit && (
                <div className="card-body text-center">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setLimit(prev => prev * 10)}
                    disabled={loading}
                  >
                    {users.length} utenti visualizzati, carica altri...
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