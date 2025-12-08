'use client';

import Link from 'next/link';
import { useState } from 'react';
import Layout from '../../components/Layout';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { GetCurriculaForListDocument, GetDegreesForCurriculaDocument, GetCurriculaForListQuery, GetDegreesForCurriculaQuery } from '../../generated/graphql';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _GET_CURRICULA = gql`
  query GetCurriculaForList {
    curricula {
      id
      name
      notes
      degree {
        id
        name
        academic_year
      }
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _GET_DEGREES = gql`
  query GetDegreesForCurricula {
    degrees {
      id
      name
      academic_year
    }
  }
`;

interface FilterState {
  name: string;
  degree_name: string;
  academic_year: string;
}

function displayAcademicYears(n: number) {
  return `${n}/${n + 1}`;
}

export default function CurriculaPage() {
  const [filters, setFilters] = useState<FilterState>({
    name: '',
    degree_name: '',
    academic_year: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { loading, error, data } = useQuery<GetCurriculaForListQuery>(GetCurriculaForListDocument);
  const { data: degreesData } = useQuery<GetDegreesForCurriculaQuery>(GetDegreesForCurriculaDocument);

  let curricula = data?.curricula ? [...data.curricula].sort((a, b) => {
    if (!a.degree || !b.degree) return 0;
    return b.degree.academic_year - a.degree.academic_year;
  }) : [];

  // Apply filters client-side for now (could be moved to GraphQL later)
  if (filters.name) {
    curricula = curricula.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase()));
  }
  if (filters.degree_name) {
    curricula = curricula.filter(c => c.degree?.name.toLowerCase().includes(filters.degree_name.toLowerCase()));
  }
  if (filters.academic_year) {
    curricula = curricula.filter(c => c.degree?.academic_year.toString() === filters.academic_year);
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  const academicYears: number[] = Array.from(new Set(degreesData?.degrees?.map((d) => d.academic_year) || []));

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      degree_name: '',
      academic_year: '',
    });
  };

  return (
    <Layout>
      <div>
        <h2 className="text-primary">Curricula</h2>

        {error && <p className="text-danger">Errore nel caricamento dei curricula</p>}

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
                <Link href="/curricula/new" className="btn btn-primary btn-sm">
                  <i className="fas fa-plus"></i> Nuovo Curriculum
                </Link>
              </div>
            </div>

            {showFilters && (
              <div className="card-body border-bottom">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.name}
                      onChange={(e) => updateFilter('name', e.target.value)}
                      placeholder="Cerca per nome..."
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Corso di Laurea</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={filters.degree_name}
                      onChange={(e) => updateFilter('degree_name', e.target.value)}
                      placeholder="Cerca per corso di laurea..."
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Anno Accademico</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.academic_year}
                      onChange={(e) => updateFilter('academic_year', e.target.value)}
                    >
                      <option value="">Tutti gli anni</option>
                      {academicYears.sort((a, b) => b - a).map((year) => (
                        <option key={year} value={year.toString()}>
                          {displayAcademicYears(year)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {activeFiltersCount > 0 && (
                  <div className="mt-3">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={clearFilters}
                    >
                      <i className="fas fa-times"></i> Cancella filtri
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered" width="100%" cellSpacing="0">
                  <thead>
                    <tr>
                      <th>nome</th>
                      <th>corso di laurea</th>
                      <th>anno</th>
                      <th>note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curricula.map((curriculum) => (
                      <tr key={curriculum.id}>
                        <td><Link href={`/curricula/${curriculum.id}`}>{curriculum.name}</Link></td>
                        <td>{curriculum.degree?.name || 'N/A'}</td>
                        <td>{curriculum.degree ? displayAcademicYears(curriculum.degree.academic_year) : 'N/A'}</td>
                        <td>{curriculum.notes || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}