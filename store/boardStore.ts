import { create } from 'zustand';
import { Board, Component, DinRail, Wire } from '@/types/board';
import { v4 as uuidv4 } from 'uuid';

interface BoardState extends Board {
    addRail: () => void;
    removeRail: (railId: string) => void;
    addComponent: (railId: string, component: Omit<Component, 'id' | 'railId'>) => void;
    removeComponent: (componentId: string) => void;
    moveComponent: (componentId: string, targetRailId: string, newIndex: number) => void;
    updateRailOrder: (railIds: string[]) => void;
    addWire: (wire: Omit<Wire, 'id'>) => void;
    removeWire: (wireId: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
    rails: [],
    wires: [],

    addRail: () => set((state) => ({
        rails: [
            ...state.rails,
            {
                id: uuidv4(),
                components: [],
                yPosition: state.rails.length,
            }
        ]
    })),

    removeRail: (railId) => set((state) => ({
        rails: state.rails.filter(r => r.id !== railId),
        wires: state.wires.filter(w => {
            // Also remove wires connected to components in this rail
            const rail = state.rails.find(r => r.id === railId);
            if (!rail) return true;
            const componentIds = rail.components.map(c => c.id);
            return !componentIds.includes(w.sourceComponentId) && !componentIds.includes(w.targetComponentId);
        })
    })),

    addComponent: (railId, component) => set((state) => ({
        rails: state.rails.map(rail => {
            if (rail.id === railId) {
                return {
                    ...rail,
                    components: [...rail.components, { ...component, id: uuidv4(), railId }]
                };
            }
            return rail;
        })
    })),

    removeComponent: (componentId) => set((state) => ({
        rails: state.rails.map(rail => ({
            ...rail,
            components: rail.components.filter(c => c.id !== componentId)
        })),
        wires: state.wires.filter(w => w.sourceComponentId !== componentId && w.targetComponentId !== componentId)
    })),

    moveComponent: (componentId, targetRailId, newIndex) => set((state) => {
        // Find the component and its current rail
        let component: Component | undefined;

        // First remove from old position
        const newRails = state.rails.map(rail => {
            const found = rail.components.find(c => c.id === componentId);
            if (found) {
                component = found;
                return {
                    ...rail,
                    components: rail.components.filter(c => c.id !== componentId)
                };
            }
            return rail;
        });

        if (!component) return state;

        // Add to new position
        return {
            rails: newRails.map(rail => {
                if (rail.id === targetRailId) {
                    const newComponents = [...rail.components];
                    newComponents.splice(newIndex, 0, { ...component!, railId: targetRailId });
                    return {
                        ...rail,
                        components: newComponents
                    };
                }
                return rail;
            })
        };
    }),

    updateRailOrder: (railIds) => set((state) => {
        const newRails = [...state.rails].sort((a, b) => {
            return railIds.indexOf(a.id) - railIds.indexOf(b.id);
        });
        return { rails: newRails.map((r, index) => ({ ...r, yPosition: index })) };
    }),

    addWire: (wire) => set((state) => {
        // Validation 1: Prevent duplicate wires (same source/target)
        const isDuplicate = state.wires.some(w =>
            (w.sourceComponentId === wire.sourceComponentId && w.sourceTerminal === wire.sourceTerminal &&
                w.targetComponentId === wire.targetComponentId && w.targetTerminal === wire.targetTerminal) ||
            (w.sourceComponentId === wire.targetComponentId && w.sourceTerminal === wire.targetTerminal &&
                w.targetComponentId === wire.sourceComponentId && w.targetTerminal === wire.sourceTerminal)
        );
        if (isDuplicate) return state;

        // Validation 2: Prevent connecting same terminal type (IN-IN or OUT-OUT)
        if (wire.sourceTerminal === wire.targetTerminal) {
            console.warn("Cannot connect same terminal types (IN-IN or OUT-OUT)");
            return state;
        }

        // Validation 3: Prevent self-connection
        if (wire.sourceComponentId === wire.targetComponentId) return state;

        // Validation 4: Max 2 wires per terminal
        const sourceRef = `${wire.sourceComponentId}-${wire.sourceTerminal}`;
        const targetRef = `${wire.targetComponentId}-${wire.targetTerminal}`;

        const countConnections = (componentId: string, terminal: 'IN' | 'OUT') => {
            return state.wires.filter(w =>
                (w.sourceComponentId === componentId && w.sourceTerminal === terminal) ||
                (w.targetComponentId === componentId && w.targetTerminal === terminal)
            ).length;
        };

        if (countConnections(wire.sourceComponentId, wire.sourceTerminal) >= 2 ||
            countConnections(wire.targetComponentId, wire.targetTerminal) >= 2) {
            console.warn("Terminal limit reached (max 2 wires)");
            return state;
        }

        return {
            wires: [...state.wires, { ...wire, id: uuidv4() }]
        };
    }),

    removeWire: (wireId) => set((state) => ({
        wires: state.wires.filter(w => w.id !== wireId)
    }))

}));
