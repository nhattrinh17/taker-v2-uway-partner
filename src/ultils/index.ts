// export all utils
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';
import { Colors } from '../assets/Colors';

const { width } = Dimensions.get('window');
export const scale = (size: number) => (width / 375) * size;
/**
 * Hiển thị thông báo lỗi.
 * Có thể nhận vào một chuỗi (string) hoặc một đối tượng lỗi (error object).
 * @param error Lỗi cần hiển thị
 */
export const showMessageError = (error: any) => {
  let message = 'Đã có lỗi xảy ra. Vui lòng thử lại.'; // Tin nhắn mặc định

  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    // Ưu tiên hiển thị message từ đối tượng lỗi nếu có
    message = error.message;
  } else if (error?.data?.message) {
    // Xử lý cấu trúc lỗi phổ biến từ API
    message = error.data.message;
  }

  Toast.show({
    type: 'error',
    text1: 'Thất bại', // Thêm tiêu đề cho rõ ràng
    text2: message,
  });
};

/**
 * Hiển thị thông báo thành công.
 * @param desc Nội dung thông báo
 */
export const showMessageSuccess = (desc: string) => {
  Toast.show({
    type: 'success',
    text1: 'Thành công', // Thêm tiêu đề
    text2: desc,
  });
};

/**
 * Hiển thị thông báo cảnh báo/thông tin.
 * @param desc Nội dung thông báo
 */
export const showMessageWarning = (desc: string) => {
  Toast.show({
    type: 'info',
    text1: 'Thông báo', // Thêm tiêu đề
    text2: desc,
  });
};

/**
 * Định dạng một số thành chuỗi tiền tệ có dấu chấm ngăn cách hàng nghìn.
 * @param amount Số tiền cần định dạng
 * @returns Chuỗi đã định dạng (ví dụ: 1.000.000)
 */
export function formatCurrency(amount: any): string {
  let numericAmount = 0;
  if (typeof amount === 'number' && !isNaN(amount)) {
    numericAmount = amount;
  } else if (typeof amount === 'string') {
    const parsed = parseFloat(amount.replace(/\\./g, ''));
    numericAmount = isNaN(parsed) ? 0 : parsed;
  }

  const integerPart = numericAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return integerPart;
}

/**
 * Định dạng số lớn theo kiểu rút gọn (K cho nghìn, M cho triệu).
 * @param value Số cần định dạng
 * @returns Chuỗi đã định dạng (ví dụ: 1.5K, 2M)
 */
export const formatCompactCurrency = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return formatCurrency(value);
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  // PENDING: 'Chờ xác nhận',
  // PENDING_PAYMENT: 'Chờ thanh toán',
  // FIND_SHOP: 'Đang tìm cửa hàng',
  SHOP_ACCEPTED: 'Cửa hàng đã nhận',
  // WAITING: 'Đang chờ',
  FIND_DRIVER: 'Đang tìm tài xế',
  PICKUP_INCOMING: 'Tài xế sắp đến',
  ARRIVING_AT_SHOP: 'Đang đến cửa hàng',
  IN_PROGRESS: 'Đang xử lý',
  // PAUSED: 'Tạm dừng',
  RETURN_FIND_DRIVER: 'Đang tìm tài xế hoàn trả',
  // RETURN_PICKUP: 'Đang lấy hàng hoàn trả',
  // RETURNING: 'Đang hoàn trả',
  PENDING_PAYMENT_COMPLETION: 'Chờ hoàn tất thanh toán',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const WALLET_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  SUCCESS: 'Thành công',
  FAIL: 'Thất bại',
  REFUND: 'Hoàn tiền',
}

export const renderTypePayment = (paymentMethod: string) => {
  switch (paymentMethod) {
    case 'DIGITAL_WALLET':
      return 'Ví Taker';
    case 'OFFLINE_PAYMENT':
      return 'Tiền mặt';
    case 'CREDIT_CARD':
      return 'Qr Code/Thẻ Visa/Master/Nội địa';
    default:
      return 'Tiền mặt';
  }
};

export const TRANSACTION_STATUS = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ duyệt';
    case 'SUCCESS':
      return 'Thành công';
    case 'FAILED':
      return 'Thất bại';
    case 'REFUND':
      return 'Hoàn tiền';
    default:
      return 'Không xác định';
  }
};

export const TRANSACTION_STATUS_COLOR = (status: string) => {
  switch (status) {
    case 'FAILED':
      return '#FF3B30';
    case 'SUCCESS':
      return '#34C759';
    case 'REFUND':
      return '#0B96DF';
      case 'PENDING':
      return Colors.gray;
    default:
      return '#0B96DF';
  }
}

export const USER_STATUS = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ duyệt';
    case 'ACTIVE':
      return 'Đang hoạt động';
    case 'BLOCKED':
      return 'Bị khoá';
    default:
      return 'Không xác định';
  }
};

export const TRANSACTION_TYPE = (status: string) => {
  switch (status) {
    case 'DEPOSIT':
      return 'Nạp tiền';
    case 'WITHDRAW':
      return 'Rút tiền';
    default:
      return 'Không xác định';
  }
};

export const STATUS_BOOKING = (status: string) => {
  switch (status) {
    case 'FIND_SHOP':
      return 'Đang tìm cửa hàng phù hợp';
    case 'PICKUP_INCOMING':
      return 'CHờ tài xế đang tới lấy đơn';
    case 'SHOP_ACCEPTED':
      return 'Cửa hàng đã chấp nhận đơn';
    case 'FIND_SHOP_TIMEOUT':
      return 'Không tìm thấy cửa hàng, vui lòng thử lại';
    case 'DRIVER_ACCEPTED':
      return 'Tài xế đã nhận đơn';
    case 'FIND_DRIVER':
      return 'Đang tìm tài xế';
    case 'CANCELLED':
      return 'Đơn hàng đã bị hủy';
    case 'DRIVER_NOTIFIED':
      return 'Đã thông báo cho tài xế';
    case 'CODE_EXPIRED':
      return 'Mã xác nhận đã hết hạn';
    case 'IN_PROGRESS':
      return 'Đơn hàng đang được xử lý';
    case 'PICKUP_SOON':
      return 'Tài xế sắp tới lấy hàng';
    case 'PICKUP_NOW':
      return 'Tài xế đang đến lấy hàng';
    case 'PENDING_PAYMENT':
      return 'Chờ thanh toán';
    case 'PENDING_PAYMENT_COMPLETION':
      return 'Đang xử lý thanh toán';
    case 'COMPLETED':
      return 'Đơn hàng đã hoàn thành';
    case 'DRIVER_ARRIVING':
      return 'Tài xế đang tới';
    case 'RETURN_FIND_DRIVER':
      return 'Chờ bàn giao cho tài xế';
    case 'ARRIVING_AT_SHOP':
      return 'Đơn hàng đã được giao tới';
    default:
      return 'Trạng thái đơn hàng không xác định';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'CANCELLED':
      return '#FF3B30';
    case 'COMPLETED':
      return '#34C759';
    default:
      return '#0B96DF';
  }
}

export const getStatusBackground = (status: string) => {
  switch (status) {
    case 'CANCELLED':
      return '#FBDCDD';
    case 'COMPLETED':
      return '#DCFBEA';
    default:
      return '#C7E7FF';
  }
}

export const convertTime = (
  expectedDeliveryTime: string,
  bookingDate: string
): string => {
  const start = new Date(bookingDate); // ngày đặt
  const end = new Date(start);         // clone để cộng ngày

  switch (expectedDeliveryTime) {
    case 'HOUR_0_24':
      end.setDate(start.getDate());       // +0 ngày
      break;
    case 'HOUR_24_48':
      end.setDate(start.getDate() + 1);   // +1 ngày
      break;
    case 'HOUR_48_72':
      end.setDate(start.getDate() + 2);   // +2 ngày
      break;
    default:
      return 'Không xác định';
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  // Trả về: "ngày đặt - ngày giao muộn nhất"
  return `${formatDate(start)} - ${formatDate(end)}`;
};


export const AUTH_ERROR = (message: string) => {
  switch (message) {
    case 'phone_or_password_wrong':
      return 'Số điện thoại hoặc mật khẩu không được để trống';
    case 'phone_already_exists':
      return 'Số điện thoại đã tồn tại';
    case 'otp_expired':
      return 'Mã OTP đã hết hạn';
    case 'user_not_found':
      return 'Tài khoản không tồn tại';
    case 'otp_limit_exceeded':
      return 'Mã OTP đã vượt quá số lần gửi';
    case 'otp_invalid':
      return 'Mã OTP không đúng';
    case 'otp_already_sent':
      return 'Mã OTP đã gửi';
    default:
      return 'Lỗi hệ thống vui lòng thử lại sau';
  }
};