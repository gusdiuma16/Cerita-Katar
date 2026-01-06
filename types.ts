
export interface JourneyEntry {
  id: string;
  text: string;
  timestamp: number;
  aiResponse?: string;
  category?: 'red' | 'yellow' | 'green';
}

export enum AppView {
  LANDING = 'LANDING',
  INPUT = 'INPUT',
  RECAP = 'RECAP'
}
