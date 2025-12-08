import { gql } from '@apollo/client';

export const GET_DEGREES_FOR_CURRICULA = gql`
  query GetDegreesForCurricula {
    degrees {
      id
      name
      academic_year
    }
  }
`;