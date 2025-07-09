export interface TimerState {
  workDuration: number; // en minutes
  breakDuration: number; // en minutes
  currentSession: 'work' | 'break';
  timeRemaining: number; // en secondes
  isRunning: boolean;
  isConfiguring: boolean;
}

export interface TimerSettings {
  workDuration: number;
  breakDuration: number;
} 