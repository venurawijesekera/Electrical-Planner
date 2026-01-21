'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Component, ComponentType } from '@/types/board';
import { Zap, ShieldAlert, ToggleLeft, Box } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Defines the available components in the palette
const AVAILABLE_COMPONENTS: Omit<Component, 'id' | 'railId'>[] = [
    { type: 'MCB', width: 1, specs: { amps: 10, poles: 1 } },
    { type: 'MCB', width: 1, specs: { amps: 16, poles: 1 } },
    { type: 'MCB', width: 1, specs: { amps: 32, poles: 1 } },
    { type: 'RCCB', width: 2, specs: { amps: 40, rating: 30, poles: 2 } },
    { type: 'ISOLATOR', width: 2, specs: { amps: 63, poles: 2 } },
    { type: 'SURGE_PROTECTOR', width: 1, specs: { poles: 1 } },
];

function PaletteItem({ component }: { component: Omit<Component, 'id' | 'railId'> }) {
    // Generate a temporary ID for dragging from palette
    const id = React.useMemo(() => uuidv4(), []);

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette-${id}`,
        data: {
            type: 'COMPONENT',
            component: { ...component, id, railId: 'palette' }
        }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`
                p-3 bg-zinc-800 rounded-lg border border-zinc-700 cursor-grab hover:border-zinc-500 transition-colors flex items-center gap-3
                ${isDragging ? 'opacity-50' : ''}
            `}
        >
            <div className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center text-zinc-300">
                {component.type === 'MCB' && <Zap size={16} />}
                {component.type === 'RCCB' && <ShieldAlert size={16} />}
                {component.type === 'ISOLATOR' && <ToggleLeft size={16} />}
                {component.type === 'SURGE_PROTECTOR' && <Box size={16} />}
            </div>
            <div>
                <div className="text-sm font-bold text-zinc-200">{component.type}</div>
                <div className="text-xs text-zinc-400">
                    {component.specs.amps ? `${component.specs.amps}A` : ''}
                    {component.specs.rating ? ` ${component.specs.rating}mA` : ''}
                    {component.width} Mod
                </div>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <div className="w-80 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen">
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Components</h2>
                <div className="space-y-3">
                    {AVAILABLE_COMPONENTS.map((c, i) => (
                        <PaletteItem key={i} component={c} />
                    ))}
                </div>
            </div>

            <div className="mt-auto p-4 bg-zinc-800/50 rounded-lg text-xs text-zinc-500">
                <p>Drag components onto the rails.</p>
                <p className="mt-2">Use the "Add DIN Rail" button to expand your board.</p>
            </div>
        </div>
    );
}
