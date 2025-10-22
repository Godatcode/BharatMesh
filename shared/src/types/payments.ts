/**
 * Payments Types - UPI Reconciliation
 */

export type MatchStatus = 'auto' | 'manual' | 'unidentified';

export type PaymentMode = 'upi' | 'cash' | 'card' | 'credit' | 'cheque';

export interface Payment {
  id: string;
  invoiceId?: string; // Linked invoice
  amount: number;
  mode: PaymentMode;
  upiRef?: string; // UPI transaction ID
  senderVpa?: string; // sender@bank
  receiverVpa?: string; // receiver@bank
  ts: number;
  smsBodyEnc?: string; // Encrypted SMS body for audit
  match: MatchStatus;
  matchedAt?: number;
  matchedBy?: string; // userId who manually matched
  deviceId: string;
  bankName?: string;
  notes?: string;
}

export interface UPIReconciliationRule {
  id: string;
  amountTolerance: number; // ±₹ tolerance for matching
  timeWindowMinutes: number; // Match window (e.g., ±10 min)
  autoMatchEnabled: boolean;
  senderWhitelist?: string[]; // Trusted VPAs for auto-match
}

export interface PaymentStats {
  todayCash: number;
  todayUpi: number;
  todayCard: number;
  todayCredit: number;
  unidentifiedCount: number;
  unidentifiedAmount: number;
}

