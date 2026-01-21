'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Component } from '@/types/board';
import { Zap, Activity, ToggleLeft, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ComponentItemProps {
    component: Component;
    isOverlay?: boolean;
    onTerminalClick?: (componentId: string, terminal: 'IN' | 'OUT', element: HTMLButtonElement) => void;
}

export function ComponentItem({ component, isOverlay, onTerminalClick }: ComponentItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: component.id,
        data: { type: 'COMPONENT', component }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1, // Hide original when dragging
        width: `${component.width * 20}px`, // 20px per module
    };

    if (isOverlay) {
        style.opacity = 1;
        style.transform = '';
    }

    // Component visual styles based on type
    const getComponentStyle = () => {
        switch (component.type) {
            case 'MCB': return 'bg-white text-zinc-900 border-zinc-200';
            case 'RCCB': return 'bg-blue-50 text-blue-900 border-blue-200';
            case 'ISOLATOR': return 'bg-red-50 text-red-900 border-red-200';
            default: return 'bg-zinc-100 text-zinc-900 border-zinc-200';
        }
    };

    const getIcon = () => {
        switch (component.type) {
            case 'MCB': return <Zap size={14} />;
            case 'RCCB': return <ShieldAlert size={14} />;
            case 'ISOLATOR': return <ToggleLeft size={14} />;
            default: return <Activity size={14} />;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={twMerge(
                "relative h-16 rounded border shadow-sm flex flex-col items-center justify-center select-none hover:ring-2 ring-blue-500/50 transition-all group",
                getComponentStyle(),
                isOverlay && "shadow-2xl scale-105 z-50 ring-2 ring-blue-500"
            )}
        >
            {/* Drag Handle Overlay - Allows dragging only from the body, not terminals */}
            <div {...attributes} {...listeners} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

            <div className="absolute top-1 text-[8px] font-bold opacity-50 tracking-wider z-10 pointer-events-none">
                {component.type}
            </div>

            <div className="mb-1 z-10 pointer-events-none">
                {getIcon()}
            </div>

            <div className="text-[10px] font-bold z-10 pointer-events-none">
                {component.specs.amps}A
            </div>

            {/* Screw Terminals Visuals & Interaction */}
            <button
                id={`terminal-${component.id}-IN`}
                className="absolute -top-1 w-3 h-3 rounded-full bg-zinc-300 border border-zinc-500 hover:bg-zinc-100 hover:scale-125 transition-all z-20 flex items-center justify-center cursor-crosshair"
                onClick={(e) => onTerminalClick?.(component.id, 'IN', e.currentTarget)}
                title="Input Terminal"
            />

            <button
                id={`terminal-${component.id}-OUT`}
                className="absolute -bottom-1 w-3 h-3 rounded-full bg-zinc-300 border border-zinc-500 hover:bg-zinc-100 hover:scale-125 transition-all z-20 flex items-center justify-center cursor-crosshair"
                onClick={(e) => onTerminalClick?.(component.id, 'OUT', e.currentTarget)}
                title="Output Terminal"
            />
        </div>
    );
}
