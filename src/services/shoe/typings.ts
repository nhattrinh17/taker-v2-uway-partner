export interface AcceptShoeBookingRequest {
  deliveryLocation: string; // "lat, lng"
  deliveryAddress: string;
}

export interface ResponseProvinces {
  id: string;
  name: string;
}

export interface ShoeBooking {
  id: string;
  orderId: string;
  bookingDate: string;            // ISO datetime
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  customerId: string;
  customerVoucherId: string | null;

  deliveryAddress: string;
  deliveryLocation: string;       // "lat,lng"
  deliveryVehicleId: string | null;

  expectedDeliveryTime: string;

  finalPrice: number;
  originalPrice: number;
  totalPrice: number;
  partnerRevenue: number;

  note: string;
  imageUrls: string[];              // dạng JSON string ["file1.jpeg"]
  processingImages: string[] ;
  completedImages: string[] | null;

  pickupAddress: string;
  pickupLocation: string;         // "lat,lng"

  returnAddress: string;
  returnLocation: string;         // "lat,lng"
  returnVehicleId: string | null;

  status: 'CANCELLED' | 'COMPLETED' | string;
  transactionId: string | null;

  customer: Customer;
  partner: Partner;
  shoeService: ShoeService;
  shoeServiceDes: string;
  shoeServiceId: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;

  appleId: string | null;
  appleName: string | null;
  facebookId: string | null;
  facebookName: string | null;
  googleId: string | null;
  googleName: string | null;

  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;

  dateOfBirth: string | null;
  status: string;
  step: string;

  isLogin: boolean;
  isVerified: boolean;
  lastLoginDate: string | null;

  referralCode: string | null;
  refreshToken: string | null;
  fcmToken: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  phone: string;

  avatar: string | null;
  email: string | null;

  appleId: string | null;
  appleName: string | null;
  facebookId: string | null;
  facebookName: string | null;
  googleId: string | null;
  googleName: string | null;

  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;

  isLogin: boolean;
  isVerified: boolean;
  status: string;
  step: string;

  operatingHours: string; // JSON string {"monday":null,...}
  activeSince: number;

  referralCode: string | null;
  refreshToken: string | null;
  fcmToken: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ShoeService {
  id: string;
  name: string;
  description: string;
  simpleDes: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Order {
  avatar: string | null;          
  bookingTime: string;       
  customerId: string;
  deliveryAddress: string;        
  event: string;                  
  finalPrice: number;              
  fullName: string;
  imageUrls: string[] | null;       
  message: string;                
  note: string;                    
  paymentMethod: string;
  phone: string;
  pickupAddress: string;
  returnAddress: string;
  screen:  string;     
  shoeBookingId: string;
  shoeServiceDes: string;  
  shoeServiceName: string;  
  status:  string;     
  totalPrice: number;
  expectedDeliveryTime: string;  
  name: string;      
}