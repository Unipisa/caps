'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';

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
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                degrees {
                  id
                  name
                  academic_year
                  years
                  enabled
                  sharing_mode
                }
              }
            `,
          }),
        });
        const result = await response.json();
        if (result.errors) {
          setError('Errore nel caricamento dei corsi di laurea');
          console.error(result.errors);
        } else {
          const sortedDegrees = result.data.degrees.sort((a: Degree, b: Degree) => b.academic_year - a.academic_year);
          setDegrees(sortedDegrees);
        }
      } catch (err: any) {
        setError('Errore di rete');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDegrees();
  }, []);

  return (
    <Layout>
      <div>
        <h1>Corsi di Studio</h1>

        {loading && <p>Caricamento...</p>}
        {error && <p className="text-danger">{error}</p>}

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