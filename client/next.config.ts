import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverRuntimeConfig: {
        // Will only be available on the server side
        apiUrl: process.env.NEXT_SERVER_API_URL || 'http://host.docker.internal:8000'
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    }
};

export default nextConfig;
