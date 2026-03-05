'use client';

import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[AquaLink] ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: '#020b18',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 20,
                        fontFamily: 'monospace',
                        color: '#e2e8f0',
                        padding: 32,
                    }}
                >
                    {/* Icon */}
                    <div style={{ fontSize: 52 }}>⚠️</div>

                    {/* Title */}
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f87171', margin: 0 }}>
                        Digital Twin Failed to Load
                    </h1>

                    {/* Error message */}
                    <p
                        style={{
                            fontSize: 13,
                            color: '#94a3b8',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 8,
                            padding: '10px 20px',
                            maxWidth: 480,
                            textAlign: 'center',
                        }}
                    >
                        {this.state.message || 'An unexpected error occurred in the 3D rendering engine.'}
                    </p>

                    {/* Reload button */}
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: 8,
                            padding: '10px 28px',
                            background: 'rgba(6,182,212,0.15)',
                            border: '1px solid rgba(6,182,212,0.4)',
                            borderRadius: 8,
                            color: '#22d3ee',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            letterSpacing: '0.05em',
                            transition: 'background 0.2s',
                        }}
                        onMouseOver={(e) =>
                            ((e.target as HTMLButtonElement).style.background = 'rgba(6,182,212,0.28)')
                        }
                        onMouseOut={(e) =>
                            ((e.target as HTMLButtonElement).style.background = 'rgba(6,182,212,0.15)')
                        }
                    >
                        🔄 Reload Dashboard
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
