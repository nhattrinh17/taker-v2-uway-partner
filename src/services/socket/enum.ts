export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECTION_ERROR = 'connect_error',
  CONNECTION_TIMEOUT = 'connect_timeout',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECTING = 'reconnecting',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed',
  RECONNECT_ABORTED = 'reconnect_aborted',

  //Shoe
  SHOE_BOOKING_UPDATE=  'shoe_booking_update',
  MESSAGE_UPDATE = 'message_update',

  //chat
  JOIN_ROOM = 'join-room',
  SEND_MESSAGE = 'send-message',
  MESSAGE_SEND = 'message-send',
  RECEIVE_MESSAGE = 'message',
  // call
  START_CALL = 'start-call',
  ACCEPT_CALL = 'accept-call',
  STATUS_CALL = 'status_Call',
  STOP_CALL = 'stop-call',

  NEW_MESSAGE = 'new_notification',
}

export const SOCKET_EVENT = {
  SHOE_BOOKING_UPDATE: 'shoe_booking_update',
  MESSAGE_UPDATE: 'message_update',
};

export const SCREEN_PARTNER = {
  CALL: "CALL",
  SHOE_BOOKING: "SHOE_BOOKING",
};

export const SHOE_BOOKING_UPDATE_STATUS = {
  FIND_SHOP: 'find-shop',
  SHOP_ACCEPTED: 'shop-accepted',
  FIND_SHOP_TIMEOUT: 'find-shop-timeout',
  DRIVER_ACCEPTED: 'driver-accepted',
  FIND_DRIVER: 'find-driver',
  CANCELLED: 'cancelled',
  DRIVER_NOTIFIED: 'driver-notified',
  CODE_EXPIRED: 'code-expired',
  IN_PROGRESS: 'in-progress',
  PICKUP_SOON: 'pickup-soon',
  PICKUP_NOW: 'pickup-now',
  PENDING_PAYMENT: 'pending-payment',
  PENDING_PAYMENT_COMPLETION: 'pending-payment-completion',
  COMPLETED: 'completed',
  DRIVER_ARRIVING: 'driver-arriving',
};
