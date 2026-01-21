'use client';

import React from 'react';
import { useSortable, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DinRail as DinRailType } from '@/types/board';
import { ComponentItem } from './ComponentItem';
import { GripVertical, Trash2 } from 'lucide-react';
import { useBoardStore } from '@/store/boardStore';

interface DinRailProps {
    rail: DinRailType;
    onTerminalClick?: (componentId: string, terminal: 'IN' | 'OUT', element: HTMLButtonElement) => void;
}

export function DinRail({ rail, onTerminalClick }: DinRailProps) {
    const removeRail = useBoardStore(state => state.removeRail);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: rail.id,
        data: { type: 'RAIL' }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl overflow-hidden group"
        >
            {/* Rail Header / Handle */}
            <div className="flex items-center justify-between p-2 bg-zinc-800 border-b border-zinc-700">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-white text-zinc-500">
                    <GripVertical size={20} />
                </div>
                <div className="h-2 flex-1 mx-4 bg-zinc-600 rounded-full opacity-20" /> {/* Visual rail hint */}
                <button
                    onClick={() => removeRail(rail.id)}
                    className="p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Rail Content Area */}
            <div className="p-4 min-h-[100px] bg-zinc-900/50">
                {/* Actual Metal Rail visual */}
                <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 h-8 -mt-4 bg-zinc-400 rounded flex items-center justify-center opacity-20 pointer-events-none border-t border-b border-zinc-300">

                    </div>

                    <SortableContext items={rail.components.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                        <div className="flex items-center gap-1 min-h-[80px] px-2">
                            {rail.components.map((component) => (
                                <ComponentItem
                                    key={component.id}
                                    component={component}
                                    onTerminalClick={onTerminalClick}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </div>
            </div>
        </div>
    );
}
