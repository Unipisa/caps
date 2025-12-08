'use client';

import { ApolloProvider } from '@apollo/client/react';
import client from '../lib/apollo-client';
import React from 'react';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
