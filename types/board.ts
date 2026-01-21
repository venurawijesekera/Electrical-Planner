export type ComponentType =
  | 'MCB'
  | 'RCCB'
  | 'RCD'
  | 'RCBO'
  | 'ISOLATOR'
  | 'SURGE_PROTECTOR'
  | 'NEUTRAL_BAR'
  | 'COMB_BUS_BAR'
  | 'BLANK';

export interface ComponentSpecs {
  poles?: number;
  amps?: number;
  voltage?: number;
  curve?: 'B' | 'C' | 'D'; // For MCBs
  rating?: number; // mA for RCDs
  label?: string;
}

export interface Component {
  id: string;
  type: ComponentType;
  width: number; // Width in modules (1 module = ~17.5mm)
  railId: string;
  specs: ComponentSpecs;
}

export interface DinRail {
  id: string;
  components: Component[];
  yPosition: number; // Vertical sorting index
}

export interface Wire {
  id: string;
  sourceComponentId: string;
  sourceTerminal: 'IN' | 'OUT'; // Simplified for now
  targetComponentId: string;
  targetTerminal: 'IN' | 'OUT';
  color: 'red' | 'blue' | 'green'; // Phase, Neutral, Earth
}

export interface Board {
  rails: DinRail[];
  wires: Wire[];
}
