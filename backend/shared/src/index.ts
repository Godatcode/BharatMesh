/**
 * BharatMesh Shared Types - Central Export
 */

// Billing
export * from './types/billing';

// Inventory
export * from './types/inventory';

// Orders
export * from './types/orders';

// Payments
export * from './types/payments';

// Attendance
export * from './types/attendance';

// User & Auth
export * from './types/user';

// Sync & P2P
export * from './types/sync';

// Business & Templates
export * from './types/business';

// Utility Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    timestamp: number;
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query: string;
  filters?: Record<string, any>;
}

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml';

export const LanguageNames: Record<Language, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  hi: { native: 'हिंदी', english: 'Hindi' },
  ta: { native: 'தமிழ்', english: 'Tamil' },
  te: { native: 'తెలుగు', english: 'Telugu' },
  bn: { native: 'বাংলা', english: 'Bengali' },
  mr: { native: 'मराठी', english: 'Marathi' },
  gu: { native: 'ગુજરાતી', english: 'Gujarati' },
  kn: { native: 'ಕನ್ನಡ', english: 'Kannada' },
  ml: { native: 'മലയാളം', english: 'Malayalam' }
};

