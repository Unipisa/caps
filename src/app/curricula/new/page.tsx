'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { GetDegreesForCurriculaDocument, GetDegreesForCurriculaQuery } from '../../../generated/graphql';

const CREATE_CURRICULUM = gql`
  mutation CreateCurriculum($input: CurriculumInput!) {
    createCurriculum(input: $input) {
      id
      name
      notes
      degree {
        id
        name
      }
    }
  }
`;

function displayAcademicYears(n: number) {
  return `${n}/${n + 1}`;
}

export default function NewCurriculumPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    degree_id: '',
  });

  const { data: degreesData } = useQuery<GetDegreesForCurriculaQuery>(GetDegreesForCurriculaDocument);
  const [createCurriculum, { loading: createLoading }] = useMutation(CREATE_CURRICULUM);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createCurriculum({
        variables: {
          input: {
            name: formData.name,
            notes: formData.notes || undefined,
            degree_id: formData.degree_id,
          },
        },
      });
      if ((result.data as any)?.createCurriculum) {
        router.push('/curricula');
      }
    } catch (error) {
      console.error('Error creating curriculum:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div>
        <h2>Nuovo Curriculum</h2>

        <div className="card shadow mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="degree_id">Corso di Laurea</label>
                <select
                  className="form-control"
                  id="degree_id"
                  name="degree_id"
                  value={formData.degree_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleziona un corso di laurea</option>
                  {degreesData?.degrees?.map((degree) => (
                    <option key={degree.id} value={degree.id}>
                      {degree.name} ({displayAcademicYears(degree.academic_year)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Note</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creazione...' : 'Crea Curriculum'}
                </button>
                <Link href="/curricula" className="btn btn-secondary ml-2">
                  Annulla
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}