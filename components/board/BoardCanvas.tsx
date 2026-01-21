'use client';

import React from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent, DragOverEvent, defaultDropAnimationSideEffects, DropAnimation } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useBoardStore } from '@/store/boardStore';
import { DinRail } from './DinRail';
import { ComponentItem } from './ComponentItem';
import { Component } from '@/types/board';
import { WireLayer } from './WireLayer';

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function BoardCanvas() {
    const rails = useBoardStore((state) => state.rails);
    const addRail = useBoardStore((state) => state.addRail);
    const updateRailOrder = useBoardStore((state) => state.updateRailOrder);
    const moveComponent = useBoardStore((state) => state.moveComponent);
    const addWire = useBoardStore((state) => state.addWire);

    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [activeComponent, setActiveComponent] = React.useState<Component | null>(null);

    // Wiring State
    const [wiringSource, setWiringSource] = React.useState<{ componentId: string, terminal: 'IN' | 'OUT' } | null>(null);

    const handleTerminalClick = (componentId: string, terminal: 'IN' | 'OUT', element: HTMLButtonElement) => {
        console.log('Clicked terminal', componentId, terminal);
        if (!wiringSource) {
            // Select source
            setWiringSource({ componentId, terminal });
            // Optional: Add visual feedback for selected terminal (could use local state or store)
            element.style.backgroundColor = '#3b82f6'; // blue-500
        } else {
            // Complete wire
            if (wiringSource.componentId === componentId && wiringSource.terminal === terminal) {
                // Cancel if clicked same terminal
                setWiringSource(null);
                element.style.backgroundColor = ''; // Reset
                return;
            }

            addWire({
                sourceComponentId: wiringSource.componentId,
                sourceTerminal: wiringSource.terminal,
                targetComponentId: componentId,
                targetTerminal: terminal,
                color: 'red' // Default to Phase for now, UI should allow selection
            });

            setWiringSource(null);
            // Ideally we reset styles here, but direct DOM manipulation is hacky. 
            // Better would be to have selected state passed down.
            // For prototype, this is acceptable.
            const sourceEl = document.getElementById(`terminal-${wiringSource.componentId}-${wiringSource.terminal}`);
            if (sourceEl) sourceEl.style.backgroundColor = '';
        }
    };


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        // Logic to find active component in store to render overlay
        const component = rails.flatMap(r => r.components).find(c => c.id === event.active.id);
        if (component) setActiveComponent(component);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveComponent(null);

        if (!over) return;

        // Handle Rail Reordering (if we dragged a rail handle)
        if (active.data.current?.type === 'RAIL' && over.data.current?.type === 'RAIL') {
            if (active.id !== over.id) {
                const oldIndex = rails.findIndex(r => r.id === active.id);
                const newIndex = rails.findIndex(r => r.id === over.id);
                const newOrder = arrayMove(rails, oldIndex, newIndex).map(r => r.id);
                updateRailOrder(newOrder);
            }
            return;
        }

        // Handle Component Drop
        // Note: Most reordering logic happens in DragOver, but final commit can happen here
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Ensure we are dragging a component
        if (active.data.current?.type === 'COMPONENT') {
            // Find source and target rails
            const sourceRail = rails.find(r => r.components.some(c => c.id === activeId));
            const targetRail = rails.find(r => r.id === overId) || rails.find(r => r.components.some(c => c.id === overId));

            if (sourceRail && targetRail) {
                // Implementation of moving component is complex in DragOver for smooth sortable
                // basic implementation: 
                // check if we need to move it to a different rail store-wise
                if (sourceRail.id !== targetRail.id) {
                    moveComponent(activeId, targetRail.id, targetRail.components.length);
                }
            }
        }
    };

    return (
        <div id="board-canvas-container" className="relative flex-1 p-8 bg-zinc-900 overflow-y-auto min-h-screen">
            <WireLayer />
            <div className="relative max-w-4xl mx-auto z-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Project Canvas</h1>
                    <button
                        onClick={addRail}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                        Add DIN Rail
                    </button>
                </div>

                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                >
                    <SortableContext items={rails.map(r => r.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6">
                            {rails.map((rail) => (
                                <DinRail
                                    key={rail.id}
                                    rail={rail}
                                    onTerminalClick={handleTerminalClick}
                                />
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeId && activeComponent ? (
                            <ComponentItem component={activeComponent} isOverlay />
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {rails.length === 0 && (
                    <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center text-zinc-500">
                        Click "Add DIN Rail" to start planning your board
                    </div>
                )}
            </div>
        </div>
    );
}
