export interface ResponeGetStatus {
  type: string;
  data: {
    status: 'PENDING' | 'ACTIVE' | 'BLOCKED';
    step: 'OTP' | 'NEW_PASSWORD' | 'REGISTER_INFO' | 'REGISTER_SOCIAL_MEDIA' | 'REGISTER_INFO_SUCCESS' | 'COMPLETED' | 'COMPLETED';
    isPassword: boolean;
  };
}
export interface OperatingHours {
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
  sunday: string | null;
}

export interface IDayOperatingHours {
  open: string; // 'HH:mm'
  close: string; // 'HH:mm'
}

export interface IOperatingHours {
  monday?: IDayOperatingHours | null;
  tuesday?: IDayOperatingHours | null;
  wednesday?: IDayOperatingHours | null;
  thursday?: IDayOperatingHours | null;
  friday?: IDayOperatingHours | null;
  saturday?: IDayOperatingHours | null;
  sunday?: IDayOperatingHours | null;
}

interface PartnerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  operatingHours: IOperatingHours;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  avatar: string;
  activeSince: string; // ISO format date string
  type: string;
}

export interface ChangePhoneRequest {
  phone: string;
  otp: string;
  referralCode?: string; // optional nếu backend cho phép bỏ
}

// Change Password request body
export interface ChangePasswordRequest {
  id: string;
  oldPassword: string;
  newPassword: string;
}

export interface ResponseGetProfile {
  data: any;
  type: string;
}
export interface ParamsGetSignedUrl {
  fileName: string;
}

export interface ParamsSetFCMToken {
  fcmToken: string;
}

export interface ParamsGetReferral {
  page: number;
  limit: number;
  offset: number;
}

export interface UserReferral {
  avatar: string;
  createdAt: string;
  email: string | null;
  fullName: string;
  id: string;
  phone: string;
}
export interface ResponseGetReferral {
  type: string;
  data: {
    data: UserReferral[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  };
}

export interface ResponseSetFCMToken {
  data: string;
  type: string;
}

export interface Response {
  type: string;
  data: any;
}