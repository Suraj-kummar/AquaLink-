import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'AquaLink – Digital Twin Ocean Dashboard',
    description:
        'Real-time 3D ocean monitoring platform powered by Smart Buoy telemetry, ' +
        'PostGIS reef coordinates, and WebGL heat stress visualization.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="bg-[#020b18] text-white antialiased overflow-hidden">
                {children}
            </body>
        </html>
    );
}
