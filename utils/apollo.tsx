import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { useMemo } from 'react';


function createApolloClient() {
    return new ApolloClient({
        uri: 'https://wpe-hiring.tokopedia.net/graphql',
        cache: new InMemoryCache(),
    });;
}

export function useApollo() {
    const client = useMemo(() => createApolloClient(), []);
    return client;
}