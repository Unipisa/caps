'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';

interface Degree {
  id: string;
  name: string;
  academic_year: number;
  years: number;
  enabled: boolean;
  sharing_mode: string;
  groups: Record<string, string[]> | null;
  default_group?: string;
  approval_confirmation: boolean;
  rejection_confirmation: boolean;
  submission_confirmation: boolean;
  approval_message?: string;
  rejection_message?: string;
  submission_message?: string;
  free_choice_message?: string;
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

export default function DegreePage() {
  const params = useParams();
  const id = params.id as string;
  const [degree, setDegree] = useState<Degree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDegree = async () => {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetDegree($id: ID!) {
                degree(id: $id) {
                  id
                  name
                  academic_year
                  years
                  enabled
                  sharing_mode
                  groups
                  default_group
                  approval_confirmation
                  rejection_confirmation
                  submission_confirmation
                  approval_message
                  rejection_message
                  submission_message
                  free_choice_message
                }
              }
            `,
            variables: { id },
          }),
        });
        const result = await response.json();
        if (result.errors) {
          setError('Errore nel caricamento del corso di laurea');
          console.error(result.errors);
        } else {
          setDegree(result.data.degree);
        }
      } catch (err: any) {
        setError('Errore di rete');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDegree();
    }
  }, [id]);

  if (loading) return <Layout><p>Caricamento corso di studi...</p></Layout>;
  if (error) return <Layout><p className="text-danger">{error}</p></Layout>;
  if (!degree) return <Layout><p>Corso di studi non trovato</p></Layout>;

  return (
    <Layout>
      <h1>{degree.name}</h1>
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="d-flex mb-2">
            <Link href="/degrees">
              <button type="button" className="btn btn-sm mr-2 btn-primary">
                <i className="fas fa-arrow-left mr-2"></i>
                Tutti i corsi di studi
              </button>
            </Link>
            {/* TODO: Add edit and delete buttons when implemented */}
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <td>{degree.name}</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Anno accademico</th>
                <td>{displayAcademicYears(degree.academic_year)}</td>
              </tr>
              <tr>
                <th>Durata anni</th>
                <td>{degree.years}</td>
              </tr>
              <tr>
                <th>Attivato</th>
                <td>{degree.enabled ? "attivo" : "non attivo"}</td>
              </tr>
              <tr>
                <th>Richiesta parere</th>
                <td>{translateSharingMode(degree.sharing_mode)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Messaggi</h6>
        </div>
        <div className="card-body">
          <p>
            Questi messaggi vengono mostrati allo studente che visualizza il piano.
            Possono essere personalizzati per indicare le procedure da seguire nei vari casi.
          </p>
          <table className="table">
            <tbody>
              <tr>
                <th>Messaggio invio</th>
                <td dangerouslySetInnerHTML={{ __html: degree.submission_message || '' }} />
              </tr>
              <tr>
                <th>Messaggio approvazione</th>
                <td dangerouslySetInnerHTML={{ __html: degree.approval_message || '' }} />
              </tr>
              <tr>
                <th>Messaggio rifiuto</th>
                <td dangerouslySetInnerHTML={{ __html: degree.rejection_message || '' }} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Email</h6>
        </div>
        <div className="card-body">
          <p>
            L'approvazione, invio, e rifiuto di un piano di studi possono essere comunicati
            via e-mail allo studente e agli indirizzi specificati nelle
            <a href="/settings">impostazioni</a>.
            Questo avviene
            solo per gli eventi selezionati qui.
          </p>
          <table className="table">
            <tbody>
              <tr>
                <th>Invio</th>
                <td>Email {degree.submission_confirmation ? "abilitata" : "disabilitata"}</td>
              </tr>
              <tr>
                <th>Approvazione</th>
                <td>Email {degree.approval_confirmation ? "abilitata" : "disabilitata"}</td>
              </tr>
              <tr>
                <th>Rifiuto</th>
                <td>Email {degree.rejection_confirmation ? "abilitata" : "disabilitata"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Gruppi di esami</h6>
        </div>
        <div className="card-body">
          <table className="table">
            <tbody>
              <tr>
                <th><i>scelta libera</i></th>
                <td>{degree.default_group ? `gruppo ${degree.default_group}` : <i>tutti gli esami</i>}</td>
              </tr>
              {Object.entries(degree.groups || {}).map(([name, exams]) =>
                <ExamGroup key={name} name={name} exam_ids={exams} />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function ExamGroup({ name, exam_ids }: { name: string; exam_ids: string[] }) {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      if (exam_ids.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetExams($ids: [ID!]!) {
                examsByIds(ids: $ids) {
                  id
                  name
                  code
                }
              }
            `,
            variables: { ids: exam_ids },
          }),
        });
        const result = await response.json();
        if (result.errors) {
          console.error(result.errors);
        } else {
          setExams(result.data.examsByIds);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [exam_ids]);

  if (loading) return <tr><th>{name}</th><td>...caricamento...</td></tr>;
  if (exams.length === 0) return <tr><th>{name}</th><td>...errore...</td></tr>;

  return (
    <tr>
      <th>{name}</th>
      <td>{exams.map(e => e.name).join(", ")}</td>
    </tr>
  );
}