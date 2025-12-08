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

export const GET_ATTACHMENTS = gql`
  query GetAttachments($uploader_id: ID) {
    attachments(uploader_id: $uploader_id) {
      id
      filename
      mimetype
      size
      createdAt
      uploader {
        id
        username
        name
      }
    }
  }
`;