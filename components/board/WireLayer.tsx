'use client';

import React, { useEffect, useState } from 'react';
import { useBoardStore } from '@/store/boardStore';

interface Point {
    x: number;
    y: number;
}

export function WireLayer() {
    const wires = useBoardStore(state => state.wires);
    const rails = useBoardStore(state => state.rails); // Listen to rails to trigger re-render on move
    const [wirePaths, setWirePaths] = useState<{ id: string, path: string, color: string }[]>([]);

    useEffect(() => {
        const calculatePaths = () => {
            const paths = wires.map(wire => {
                const sourceEl = document.getElementById(`terminal-${wire.sourceComponentId}-${wire.sourceTerminal}`);
                const targetEl = document.getElementById(`terminal-${wire.targetComponentId}-${wire.targetTerminal}`);

                if (!sourceEl || !targetEl) return null;

                const sourceRect = sourceEl.getBoundingClientRect();
                const targetRect = targetEl.getBoundingClientRect();

                // Calculate relative to the viewport (or we could use offset if container allows)
                // However, our SVG is fixed/absolute over the screen usually.
                // Actually, BoardCanvas scrolls. We need coords relative to the SVG container if it scrolls, 
                // OR make the SVG fixed screen overlay and use client coordinates.
                // Let's assume SVG covers the scrollable specific area or we map client coords.

                // For simplicity, let's use client coordinates and make the SVG fixed overlay.
                // But wait, if we scroll, the wires need to move. 
                // A better approach is usually to put the SVG inside the scrollable container.

                const container = document.getElementById('board-canvas-container');
                const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 };

                const start: Point = {
                    x: sourceRect.left + sourceRect.width / 2 - containerRect.left,
                    y: sourceRect.top + sourceRect.height / 2 - containerRect.top
                };

                const end: Point = {
                    x: targetRect.left + targetRect.width / 2 - containerRect.left,
                    y: targetRect.top + targetRect.height / 2 - containerRect.top
                };

                // Bezier Curve Logic
                const distY = Math.abs(end.y - start.y);
                const controlPoint1 = { x: start.x, y: start.y - distY * 0.5 }; // Up from bottom
                const controlPoint2 = { x: end.x, y: end.y + distY * 0.5 }; // Down to top

                // Adjust control points based on terminal direction if needed
                // Assuming IN is top, OUT is bottom
                const cp1 = wire.sourceTerminal === 'OUT' ? { x: start.x, y: start.y + 50 } : { x: start.x, y: start.y - 50 };
                const cp2 = wire.targetTerminal === 'IN' ? { x: end.x, y: end.y - 50 } : { x: end.x, y: end.y + 50 };

                const path = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

                return {
                    id: wire.id,
                    path,
                    color: wire.color === 'red' ? '#ef4444' : wire.color === 'blue' ? '#3b82f6' : '#22c55e'
                };
            }).filter(Boolean) as { id: string, path: string, color: string }[];

            setWirePaths(paths);
        };

        // Recalculate on mount and when dependencies change
        calculatePaths();

        // Also recalculate on window resize
        window.addEventListener('resize', calculatePaths);

        // Use a small interval or ResizeObserver if needed for smooth drag updates
        const interval = setInterval(calculatePaths, 50);

        return () => {
            window.removeEventListener('resize', calculatePaths);
            clearInterval(interval);
        };
    }, [wires, rails]);

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible">
            {wirePaths.map(wire => (
                <g key={wire.id}>
                    <path
                        d={wire.path}
                        stroke={wire.color}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        className="opacity-80"
                    />
                    {/* Inner highlight */}
                    <path
                        d={wire.path}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1"
                        fill="none"
                    />
                </g>
            ))}
        </svg>
    );
}
