import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@alphadesk/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
            '@alphadesk/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src'),
        },
    },
    server: {
        port: 5173,
        host: true,
    },
    build: {
        target: 'esnext',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    charts: ['recharts'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
                },
            },
        },
    },
    types: ['vite/client'],
});
