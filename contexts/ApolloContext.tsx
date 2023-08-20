'use client'

import { useApollo } from "@/utils/apollo";
import { ApolloProvider } from "@apollo/client";

export default function ApolloContext ({
    children,
}: {
    children: React.ReactNode
}) {
    const client = useApollo();

    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    )
}