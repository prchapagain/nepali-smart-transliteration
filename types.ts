
export interface UserWordEntry {
  frequency: number;
  lastUsed: number; // timestamp
}

export interface UserDictionary {
  [nepaliWord: string]: UserWordEntry; 
}
