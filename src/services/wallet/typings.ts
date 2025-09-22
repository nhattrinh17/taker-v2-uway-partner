export interface VehicleData {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  partnerId: string;
  licensePlate: string;
  licenseImage: string;
  licenseImageBack: string;
  image: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  seat: number;
  status: string;
  type:string;
}

export type DataTransaction = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  walletId: string;
  orderId: string;
  amount: number;
  description: string;
  transactionDate: string;
  transactionType: string; 
  transactionSource: string;
  status: string;          
  vnPayData: string | null;
  ipRequest: string;
  ipIpn: string | null;
  isManual: boolean;
  evidence: string | null;
};

export interface ParamsVehicle {
  licensePlate?: string;
  licenseImage?: string;
  licenseImageBack?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  seat?: number;
  image?: string;
}
export interface Transaction {
  id: string;
  amount: number;
  status: string;             // Ví dụ: "PENDING"
  description: string;        // Ví dụ: "Nap tien vao vi XIMI"
  transactionType: string;    // Ví dụ: "DEPOSIT"
  transactionDate: string;    
  createdAt: string;          
  updatedAt: string;          
  deletedAt: string | null;
  evidence: string | null;
  walletId: string;
  orderId: string;
  transactionSource: string;
  vnPayData: string | null;
  ipRequest: string;
  ipIpn: string | null;
  isManual: boolean;
}
export interface ParamsUpBill {
  transactionId: string;
  evidence: string;
}
export interface ParamsTotalIncome {
  startTs: string;
  endTs: string;
}
export interface ParamsAccessCode {
  password: string;
}
export interface ResponseWithDraw {
  amount: number;
  accessCode: number;
}
export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUND = 'REFUND',
}
export enum TransactionType {
  WITHDRAW = 'WITHDRAW',
  DEPOSIT = 'DEPOSIT',
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}
