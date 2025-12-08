'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { GET_DEGREES } from '../page';

const GET_DEGREE = gql`
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
`;

const DELETE_DEGREE = gql`
  mutation DeleteDegree($id: ID!) {
    deleteDegree(id: $id)
  }
`;

const GET_EXAMS_BY_IDS = gql`
  query GetExamsByIds($ids: [ID!]!) {
    examsByIds(ids: $ids) {
      id
      name
      code
    }
  }
`;

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
  const router = useRouter();
  const id = params.id as string;
  const { loading, error, data } = useQuery<{ degree: Degree }>(GET_DEGREE, {
    variables: { id },
    skip: !id,
  });

  const [deleteDegreeMutation] = useMutation(DELETE_DEGREE, {
    refetchQueries: [{ query: GET_DEGREES }],
  });

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare questo corso di laurea?")) {
      return;
    }

    try {
      await deleteDegreeMutation({
        variables: { id },
      });
      
      router.push('/degrees');
    } catch (error) {
      console.error('Error deleting degree:', error);
      alert('Errore durante l\'eliminazione del corso di laurea');
    }
  };

  const degree = data?.degree;

  if (loading) return <Layout><p>Caricamento corso di studi...</p></Layout>;
  if (error) return <Layout><p className="text-danger">Errore nel caricamento del corso di laurea</p></Layout>;
  if (!degree) return <Layout><p>Corso di studi non trovato</p></Layout>;

  return (
    <Layout>
      <h2>{degree.name}</h2>
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="d-flex mb-2">
            <Link href="/degrees">
              <button type="button" className="btn btn-sm btn-primary me-2">
                <i className="fas fa-arrow-left me-2"></i>
                Tutti i corsi di studi
              </button>
            </Link>
            <Link href={`/degrees/edit/${id}`}>
              <button type="button" className="btn btn-sm btn-primary me-2">
                Modifica
              </button>
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={handleDelete}
            >
              Elimina
            </button>
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
            L&apos;approvazione, invio, e rifiuto di un piano di studi possono essere comunicati
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
  const { loading, error, data } = useQuery<{ examsByIds: { id: string; name: string; code: string }[] }>(
    GET_EXAMS_BY_IDS,
    {
      variables: { ids: exam_ids },
      skip: exam_ids.length === 0,
    }
  );

  const exams = data?.examsByIds || [];

  if (loading) return <tr><th>{name}</th><td>...caricamento...</td></tr>;
  if (error || exams.length === 0) return <tr><th>{name}</th><td>...errore...</td></tr>;

  return (
    <tr>
      <th>{name}</th>
      <td>{exams.map((e) => e.name).join(", ")}</td>
    </tr>
  );
}