
export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  title: string;
  category: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed' | 'recovery_active';
  isWrongTransfer?: boolean;
  remark?: string; // New: Narration for the payment
}

export interface DebtInfo {
  isBlacklisted: boolean;
  totalOwed: number;
  owedToId: string; // The PayMoment ID of the person who sent the wrong transfer
  owedToName: string;
}

export interface VerificationStatus {
  bvn: boolean;
  bvnValue?: string;
  nin: boolean;
  ninValue?: string;
  address: boolean;
  facialMatch: boolean;
}

export interface PaymentLink {
  id: string;
  slug: string;
  title: string;
  amount: number | null;
  visits: number;
  completions: number;
  createdAt: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  type: 'local' | 'global';
  details: {
    bank?: string;
    accountNumber?: string;
    countryName?: string;
    countryIcon?: string;
    iban?: string;
    swift?: string;
    currency?: string;
  };
}

export interface Investment {
  id: string;
  assetName: string;
  assetIcon: string;
  amountInvested: number;
  currentValue: number;
  returns: number;
  type: 'stock' | 'crypto' | 'etf';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface User {
  name: string;
  phoneNumber: string;
  profilePicture?: string;
  balances: { [key: string]: number };
  accountNumber: string;
  tier: 1 | 2 | 3;
  verification: VerificationStatus;
  payMomentId: string;
  beneficiaries: Beneficiary[];
  transactions: Transaction[];
  paymentLinks: PaymentLink[];
  momentPoints: number;
  investments: Investment[];
  badges: Badge[];
  debtInfo?: DebtInfo; // New: Tracking for wrong transfer resolution
}

export interface BillCategory {
  id: string;
  name: string;
  icon: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
