import { s3Url } from '../services/APIConfig';
import { format, parseISO } from 'date-fns';

export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@([A-Za-z0-9-]+\.)+(com|vn)$/i;
  return re.test(email.trim());
};

export const isValidPhone = (phone: string): boolean => {
  return /^0\d{9}$/.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  // Password must be at least 6 characters and contain no spaces
  return password.length >= 6;
};

export const isStrongPassword = (password: string): boolean => {
  // Password must be at least 8 characters, contain at least one uppercase letter,
  // one lowercase letter, one number, and one special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

export const isValidVietnamesePhone = (phone: string): boolean => {
  // Vietnamese phone numbers start with 0, followed by 9 digits
  // This is the same as the existing isValidPhone function
  return /^0\d{9}$/.test(phone);
};

export const checkAvatarGoogle = (avatar: string) => {
  if (!avatar) return s3Url + '1748591960001.jpeg';
  if (avatar.includes('https')) return avatar;
  return s3Url + avatar;
};

export const checkShoeImage = (image: string) => {
  if (image.includes('https')) return image;
  return s3Url + image;
};

export const extractTime = (iso: string | null | undefined): string => {
  if (!iso) return '';
  return format(parseISO(iso), 'HH:mm');
};

export const convertToDate = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const date = parseISO(iso);
  return format(date, 'dd/MM/yyyy');
};

export function truncateString(str: string, maxLength = 30) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const removeDots = (str: string): string => {
  return str.replace(/\./g, '');
};

export const isSpace = (str: string): boolean => {
  return /^\S+$/.test(str);
};

export function formatCurrencyRoundedToHundred(amount: number): string {
  if (!amount) return '0₫';
  const discounted = Math.floor(amount);
  return discounted.toLocaleString('vi-VN') + '₫';
}

export const formatCustomDatetimeV2 = (isoDateString: string) => {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${hours}:${minutes}, ${day}/${month}/${year}`;
};