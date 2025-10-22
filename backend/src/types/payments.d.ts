/**
 * Payments Types - UPI Reconciliation
 */
export type MatchStatus = 'auto' | 'manual' | 'unidentified';
export type PaymentMode = 'upi' | 'cash' | 'card' | 'credit' | 'cheque';
export interface Payment {
    id: string;
    invoiceId?: string;
    amount: number;
    mode: PaymentMode;
    upiRef?: string;
    senderVpa?: string;
    receiverVpa?: string;
    ts: number;
    smsBodyEnc?: string;
    match: MatchStatus;
    matchedAt?: number;
    matchedBy?: string;
    deviceId: string;
    bankName?: string;
    notes?: string;
}
export interface UPIReconciliationRule {
    id: string;
    amountTolerance: number;
    timeWindowMinutes: number;
    autoMatchEnabled: boolean;
    senderWhitelist?: string[];
}
export interface PaymentStats {
    todayCash: number;
    todayUpi: number;
    todayCard: number;
    todayCredit: number;
    unidentifiedCount: number;
    unidentifiedAmount: number;
}
//# sourceMappingURL=payments.d.ts.map