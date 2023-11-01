'use client'

import { QueryClient, QueryClientProvider } from 'react-query'

/** 
 * maybe this should be a state variable of Provider
 **/
const queryClient = new QueryClient()

export default function Provider({children}:{
    children: React.ReactNode
}) {
    return <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
}