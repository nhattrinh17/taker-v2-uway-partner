

const Endpoint = {
  Auth: {
    LOGIN_GG: 'v1/auth/google',
    LOGIN_FB: 'v1/auth/facebook',
    SIGN_UP: 'v1/auth/signup',
    OTP: 'v1/auth/get-otp',
    OTP_VERIFY: 'v1/auth/verify-otp',
    LOGIN: 'v1/auth/login',
    LOGOUT: 'v1/auth/logout',
    FORGOT_PASSWORD: 'v1/auth/forgot-password',
    RESET_PASSWORD: 'v1/auth/reset-password',
    REFRESH_TOKEN : 'v1/auth/refresh-token'
  },
   Partner: {
    //UPDATE_LAST_LOGIN: 'v1/partner/update-last-login',
    GET_PROFILE: 'v1/partner/profile',
    UPDATE_PROFILE: 'v1/partner/update-profile',
    CHANGE_PHONE: 'v1/partner/change-phone',
    CHANGE_PASSWORD: 'v1/partner/change-password',   
    SIGNED_URL: 'v1/partner/get-signed-url',
  },
  Address: {
    GET_ADDRESS: 'v1/address',
    CREATE_ADDRESS: 'v1/address',
    UPDATE_ADDRESS: 'v1/address',
    DELETE_ADDRESS: 'v1/address',
  },
  Notification: {
    GET_NOTIFICATION: 'notification?',
    UPDATE: 'notification/read',
    DELETE: 'notification',
  },
  Wallet: {
    HISTORY_WALLET: 'v1/wallet/history',
    DEPOSIT: 'v1/wallet/deposit',
    UP_BILL: 'v1/wallet/up-billing/wallet',
    GET_BALANCE: 'v1/wallet/balance',
    HISTORY_TRANSACTION: 'v1/wallet/transactions',
    GET_WALLET: 'v1/wallet',
    GET_ACCESS_CODE: 'v1/wallet/get-access-code',
    WITH_DRAW: 'v1/wallet/withdraw',
  },
  ShoeBooking:{
    GET_SHOE: 'v1/shoe-booking',
    GET_TIMELINE: 'v1/shoe-booking/timeline',
    ACCEPT: 'v1/shoe-booking/accept',
    REJECT: 'v1/shoe-booking/cancel',
    UPDATE_STATUS: 'v1/shoe-booking',
    UPLOAD_IMAGE: 'v1/shoe-booking/upload-processing-images'
  },
  Rating: {
    GET_DETAIL: 'v1/rating/details',
    GET_AVG: 'v1/rating/average'
  },

};

export default Endpoint;
