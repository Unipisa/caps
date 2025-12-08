'use client';

import Link from 'next/link';
import Layout from '../../components/Layout';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_DEGREES = gql`
  query GetDegrees {
    degrees {
      id
      name
      academic_year
      years
      enabled
      sharing_mode
    }
  }
`;

export { GET_DEGREES };

interface Degree {
  id: string;
  name: string;
  academic_year: number;
  years: number;
  enabled: boolean;
  sharing_mode: string;
}

function displayAcademicYears(n: number) {
  return `${n}/${n + 1}`;
}

function translateSharingMode(mode: string) {
  const translations = {
    enabled: 'abilitata',
    disabled: 'disabilitata',
    admin: 'amministratori',
  };
  return translations[mode as keyof typeof translations] || mode;
}

export default function DegreesPage() {
  const { loading, error, data } = useQuery<{ degrees: Degree[] }>(GET_DEGREES);

  const degrees = data?.degrees ? [...data.degrees].sort((a: Degree, b: Degree) => b.academic_year - a.academic_year) : [];

  return (
    <Layout>
      <div>
        <h2>Corsi di Studio</h2>

        {loading && <p>Caricamento...</p>}
        {error && <p className="text-danger">Errore nel caricamento dei corsi di laurea</p>}

        {!loading && !error && (
          <div className="card shadow mb-4">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered" width="100%" cellSpacing="0">
                  <thead>
                    <tr>
                      <th>attivo</th>
                      <th>richiesta parere</th>
                      <th>anno</th>
                      <th>nome</th>
                      <th>anni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {degrees.map((degree) => (
                      <tr key={degree.id}>
                        <td>{degree.enabled ? '•' : ''}</td>
                        <td>{translateSharingMode(degree.sharing_mode)}</td>
                        <td>{displayAcademicYears(degree.academic_year)}</td>
                        <td><Link href={`/degrees/${degree.id}`}>{degree.name}</Link></td>
                        <td>{degree.years}</td>
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