/**
 * BharatMesh Shared Types - Central Export
 */
export * from './types/billing';
export * from './types/inventory';
export * from './types/orders';
export * from './types/payments';
export * from './types/attendance';
export * from './types/user';
export * from './types/sync';
export * from './types/business';
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
export declare const LanguageNames: Record<Language, {
    native: string;
    english: string;
}>;
//# sourceMappingURL=index.d.ts.map