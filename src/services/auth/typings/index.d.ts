declare namespace auth {
  interface ParamsLogin {
    accessToken: string;
  }
  interface ParamsLoginPhone {
    phone: string;
    password: string;
  }
  interface ResponeLogin {
    type: string;
    data: {
      accessToken: string;
      user: any;
    };
  }
  interface ParamsForgotPassword {
    phone: string;
  }
  interface ParamsSignUp {
    name: string;
    password: string;
    address: string;
    phone: string;
    type?: string;
    email?: string;
    referralCode?: string;
  }
  interface ParamsOtp {
    id: string;
    status?: string;
  }
  interface ParamsOtpVerify {
    otp: string;
    phone: string;
  }
  interface ResponeSignUp {
    type: string;
    data: {
      id: string;
    };
  }
  interface ResponeForgotPassword {
    type: string;
    data: string;
  }
  interface Error {
    type: string;
    code: string;
  }
  interface ParamsResetPassword {
    phone: string;
    password: string;
  }
}
