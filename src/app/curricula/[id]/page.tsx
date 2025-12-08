'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_CURRICULUM = gql`
  query GetCurriculum($id: ID!) {
    curriculum(id: $id) {
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

interface Curriculum {
  id: string;
  name: string;
  notes?: string;
  degree?: {
    id: string;
    name: string;
    academic_year: number;
  };
}

function displayAcademicYears(n: number) {
  return `${n}/${n + 1}`;
}

export default function CurriculumPage() {
  const params = useParams();
  const id = params.id as string;

  const { loading, error, data } = useQuery<{ curriculum: Curriculum }>(GET_CURRICULUM, {
    variables: { id },
  });

  const curriculum = data?.curriculum;

  return (
    <Layout>
      <div>
        <h2>Curriculum</h2>

        {loading && <p>Caricamento...</p>}
        {error && <p className="text-danger">Errore nel caricamento del curriculum</p>}

        {!loading && !error && curriculum && (
          <div className="card shadow mb-4">
            <div className="card-body">
              <h5 className="card-title">{curriculum.name}</h5>
              <p><strong>Corso di laurea:</strong> <Link href={`/degrees/${curriculum.degree?.id}`}>{curriculum.degree?.name}</Link></p>
              <p><strong>Anno accademico:</strong> {curriculum.degree ? displayAcademicYears(curriculum.degree.academic_year) : 'N/A'}</p>
              {curriculum.notes && <p><strong>Note:</strong> {curriculum.notes}</p>}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}