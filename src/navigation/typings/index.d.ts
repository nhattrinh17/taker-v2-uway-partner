// export all types
import { ShoeBooking } from "../../services/shoe/typings";

export type RootNavigatorParamList = {
  //Splash screen
  Space: undefined;
  Test: undefined;
  Upcoming: undefined;
  //Auth stack
  AuthStack: { screen?: string; params?: any };
  Login: undefined;
  Otp: {
    phoneNumber: string;
    type?: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    referralCode?: string;
    checked?: boolean;
    typeService?: string;
    id?: string;
  };
  SignUp: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    referralCode?: string;
    type?: string;
    checked?: boolean;
    typeService?: string;
  };
  ForgotPassword: undefined;
  ChangePassword: { phone: string };
  Notification: undefined;
  PhoneUpdate: { id: string };

  ForgotPassword: undefined;

  OrderDetail: {
    item: ShoeBooking;
    screen?: string;
    id: string;
    orderId: string;
  };

  AcceptDetail: {
    item: any;
    screen?: string;
    onAccept: (order: Order) => void;
  };

  OrderProgress: {
    id: string;

    item: ShoeBooking;
    screen?: string;
  }

  InCome: undefined;

  Review: {
    id: string;
    screen?: string;
  };

  //Home stack
  HomeStack: { screen?: string };
  Home: undefined;
  AllServices: undefined;
  //Bottom stack
  BottomStack: { screen?: string };
  Person: undefined;
  Information: undefined;
  HistoryDetail: undefined;
  AddressSearchScreen: { returnScreen: "AddressForm" };
  //Profile stack
  ProfileStack: { screen?: string };
  Profile: undefined;
  Changepass: undefined;
  LocationManage: undefined;
  AddressForm: { address?: Address };
  Referral: undefined;
  //Chat stack
  ChatStack: { screen?: string };
  ListChat: undefined;
  Endow: undefined;
  Chat: {
    fullName: string;
    avatar: string;
    receiverId: string;
    groupId: string;
    createdAt: string;
    source: number;
    phone: string;
  };
  VoiceCall: {
    fullName?: string;
    avatar: string;
    isCaller: boolean;
    groupId: string;
    callerId: string;
    receiverId: string;
    tokenCaller: string;
    tokenReceiver: string;
    autoAccept: boolean;
    skipInitialCall?: boolean;
  };

  //Wallet stack
  WalletStack: { screen?: string };
  Wallet: undefined;
  Deposit: any;
  SupportCenter: undefined;
  Rating: {
    item: any;
  };
  //Order stack
  OrdersStack: { screen?: string };
  Orders: undefined;

  TransactionDetail: {
    item: Transaction
  };
  CashBack: undefined;
  WithDraw: any;
  //Common screens
  CommonWebView: { title: string; url: string };

  //Service stack
  ServiceStack: { screen?: string; params?: any };
  ChooseLocation: {
    origin?: string;
    destination?: string;
    type?: string;
  };
  MapLocationPicker: {
    voucher?: VoucherData | undefined;
    rebook?: RebookTrip;
    rebookInfor?: RebookInfor;
    type?: 'delivery' | 'carpool' | 'bike';
  };
  ChooseTypeCarpool: { item: ParamsGetCarpoolPackage };
  BookingTripScreen: {
    listCarpool: TypeCarpool[];
    rebook?: RebookTrip;
    note?: string;
    carrierCode?: string;
  };
  VehicleBooking: {
    listVehicle: TypeBike[];
    rebook?: RebookTrip;
    note?: string;
  }
  //Voucher stack
  Voucher: {
    packageItem: any;
    paymentMethod: 'WALLET' | 'BANK' | 'CASH';
    type: 'carpool' | 'delivery' | string;
  };
  VoucherDetail: {
    voucher: VoucherData;
  };

  //Activity
  Activity: undefined;

  //Delivery stack
  DeliveryStack: { screen?: string; params?: any };
  ChooseService: {
    rebook?: RebookTrip;
    note?: string;
    rebookInfor?: RebookInfor;
    delivery?: DeliveryService;
    carrierCode?: string;
  };
  OrderInfo: {
    originAddress: string;
    destinationAddress: string;
    rebookInfor?: RebookInfor;
  };
};

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  label: string;
  address: string;
  location: string;
  isBranchAddress: boolean;
  isDefault: boolean;
}
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;    // stack chính hiện đang dùng (MainStack)

};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}