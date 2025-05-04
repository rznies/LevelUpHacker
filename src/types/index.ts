// TypeScript interfaces for Hacker News API data

export interface HNItem {
  id: number;
  deleted?: boolean;
  type?: 'job' | 'story' | 'comment' | 'poll' | 'pollopt';
  by?: string;
  time?: number; // Unix time
  text?: string; // HTML
  dead?: boolean;
  parent?: number;
  poll?: number;
  kids?: number[];
  kidsData?: HNItem[]; // Added to store fetched child comments
  url?: string;
  score?: number;
  title?: string; // HTML
  parts?: number[];
  descendants?: number; // Total comment count for stories/polls
}