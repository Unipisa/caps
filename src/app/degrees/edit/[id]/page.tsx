'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../../components/Layout';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { GET_DEGREES } from '../../page';
import { useState, useEffect } from 'react';

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

const UPDATE_DEGREE = gql`
  mutation UpdateDegree($id: ID!, $input: DegreeInput!) {
    updateDegree(id: $id, input: $input) {
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

export default function EditDegreePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { loading, error, data } = useQuery<{ degree: Degree }>(GET_DEGREE, {
    variables: { id },
    skip: !id,
  });

  const [updateDegreeMutation] = useMutation(UPDATE_DEGREE, {
    refetchQueries: [{ query: GET_DEGREES }],
  });

  const [formData, setFormData] = useState<Partial<Degree>>({});

  useEffect(() => {
    if (data?.degree) {
      setFormData(data.degree);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateDegreeMutation({
        variables: {
          id,
          input: {
            name: formData.name,
            academic_year: formData.academic_year,
            years: formData.years,
            enabled: formData.enabled,
            sharing_mode: formData.sharing_mode,
            groups: formData.groups,
            default_group: formData.default_group,
            approval_confirmation: formData.approval_confirmation,
            rejection_confirmation: formData.rejection_confirmation,
            submission_confirmation: formData.submission_confirmation,
            approval_message: formData.approval_message,
            rejection_message: formData.rejection_message,
            submission_message: formData.submission_message,
            free_choice_message: formData.free_choice_message,
          },
        },
      });

      router.push(`/degrees/${id}`);
    } catch (error) {
      console.error('Error updating degree:', error);
      alert('Errore durante l\'aggiornamento del corso di laurea');
    }
  };

  const handleChange = (field: keyof Degree, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <Layout><p>Caricamento corso di studi...</p></Layout>;
  if (error) return <Layout><p className="text-danger">Errore nel caricamento del corso di laurea</p></Layout>;
  if (!data?.degree) return <Layout><p>Corso di studi non trovato</p></Layout>;

  return (
    <Layout>
      <h1>Modifica Corso di Studi: {data.degree.name}</h1>

      <div className="card shadow mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Nome</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="academic_year" className="form-label">Anno Accademico</label>
              <input
                type="number"
                className="form-control"
                id="academic_year"
                value={formData.academic_year || ''}
                onChange={(e) => handleChange('academic_year', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="years" className="form-label">Durata (anni)</label>
              <input
                type="number"
                className="form-control"
                id="years"
                value={formData.years || ''}
                onChange={(e) => handleChange('years', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled || false}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="enabled">
                  Attivato
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="sharing_mode" className="form-label">Modalità Condivisione</label>
              <select
                className="form-control"
                id="sharing_mode"
                value={formData.sharing_mode || ''}
                onChange={(e) => handleChange('sharing_mode', e.target.value)}
              >
                <option value="enabled">Abilitata</option>
                <option value="disabled">Disabilitata</option>
                <option value="admin">Amministratori</option>
              </select>
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="submission_confirmation"
                  checked={formData.submission_confirmation || false}
                  onChange={(e) => handleChange('submission_confirmation', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="submission_confirmation">
                  Conferma invio via email
                </label>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="approval_confirmation"
                  checked={formData.approval_confirmation || false}
                  onChange={(e) => handleChange('approval_confirmation', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="approval_confirmation">
                  Conferma approvazione via email
                </label>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rejection_confirmation"
                  checked={formData.rejection_confirmation || false}
                  onChange={(e) => handleChange('rejection_confirmation', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="rejection_confirmation">
                  Conferma rifiuto via email
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="submission_message" className="form-label">Messaggio Invio</label>
              <textarea
                className="form-control"
                id="submission_message"
                rows={3}
                value={formData.submission_message || ''}
                onChange={(e) => handleChange('submission_message', e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="approval_message" className="form-label">Messaggio Approvazione</label>
              <textarea
                className="form-control"
                id="approval_message"
                rows={3}
                value={formData.approval_message || ''}
                onChange={(e) => handleChange('approval_message', e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="rejection_message" className="form-label">Messaggio Rifiuto</label>
              <textarea
                className="form-control"
                id="rejection_message"
                rows={3}
                value={formData.rejection_message || ''}
                onChange={(e) => handleChange('rejection_message', e.target.value)}
              />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                Salva Modifiche
              </button>
              <Link href={`/degrees/${id}`}>
                <button type="button" className="btn btn-secondary">
                  Annulla
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}