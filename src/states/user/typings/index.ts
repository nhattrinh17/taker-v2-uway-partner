export interface userInfo {
  // --- Thông tin cơ bản ---
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  avatar?: string | null; // Cập nhật: API có thể trả về null
  dateOfBirth?: string | null;

  operatingHours: OperatingHours;
  type?: string;
 

  // --- Thông tin xác thực và trạng thái ---
  password?: string | null;
  isLogin?: boolean;
  isVerified?: boolean;
  status?: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  step?: string; // Thêm mới: ví dụ 'COMPLETED'
  lastLoginDate?: string | null;
  
  // --- Mã và Token ---
  fcmToken?: string | null;
  referralCode?: string | null;
  refreshToken?: string | null; // Thêm mới

  // --- Thông tin liên kết mạng xã hội ---
  facebookId?: string | null;
  facebookName?: string | null; // Thêm mới
  googleId?: string | null;
  googleName?: string | null; // Thêm mới
  appleId?: string | null; // Thêm mới
  appleName?: string | null; // Thêm mới

  // --- Thông tin ngân hàng ---
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  // --- Dấu vết thời gian ---
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
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