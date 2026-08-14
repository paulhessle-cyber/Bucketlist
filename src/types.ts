export type ListKind = 'personal' | 'travel';

export interface BucketItem {
  id: string;
  kind: ListKind;
  title: string;
  emoji: string;
  location?: string;
  targetDate?: string; // ISO date string, optional
  status: 'active' | 'achieved';
  achievedDate?: string; // ISO date string, set when marked achieved
  description?: string;
  photos: string[]; // data URLs
  createdAt: string;
}

export interface VisitedCountry {
  id: string; // topojson numeric id as string
  name: string;
  visitedAt: string;
}
