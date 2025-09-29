import { fetcher } from '../fetcher';
import useSWRMutation from 'swr/mutation';
import { Methods } from '../typings';
import Endpoint from '../Endpoind';

export const useLoginGoogle = () => {
  const { trigger, error } = useSWRMutation<auth.ResponeLogin, auth.Error, string, auth.ParamsLogin>(`${Endpoint.Auth.LOGIN_GG}`, (url: string, { arg }: { arg: auth.ParamsLogin }) => {
    return fetcher(url, Methods.POST, arg);
  });
  return { triggerLoginGG: trigger, error };
};

export const useLoginFacebook = () => {
  const { trigger, error } = useSWRMutation<auth.ResponeLogin, auth.Error, string, auth.ParamsLogin>(`${Endpoint.Auth.LOGIN_FB}`, (url: string, { arg }: { arg: auth.ParamsLogin }) => {
    return fetcher(url, Methods.POST, arg);
  });
  return { triggerLoginFB: trigger, error };
};

export const useSignUp = () => {
  const { trigger, error } = useSWRMutation<auth.ResponeSignUp, auth.Error, string, auth.ParamsSignUp>(`${Endpoint.Auth.SIGN_UP}`, (url: string, { arg }: { arg: auth.ParamsSignUp }) => {
    return fetcher(url, Methods.POST, arg);
  });
  return { triggerSignUp: trigger, error };
};

// Lấy OTP
// Lấy OTP (gọn giống verify)
// Lấy OTP
export const useOtp = () => {
  const { trigger, error } = useSWRMutation<any, auth.Error, string, { phone: string; type: string }>(
    `${Endpoint.Auth.OTP}`, // ví dụ: "v1/auth/otp"
    (url: string, { arg }) => {
      // type trước, rồi tới id (số điện thoại)
      const path = `${url}/${encodeURIComponent(arg.type)}/${encodeURIComponent(arg.phone)}`;
      console.log('[useOtp] POST:', path, '| arg:', arg);
      return fetcher(path, Methods.PATCH, arg);
    }
  );
  return { triggerOtp: trigger, error };
};

export const useOtpVerify = () => {
  const { trigger, error } = useSWRMutation<any, auth.Error, string, auth.ParamsOtpVerify>(`${Endpoint.Auth.OTP_VERIFY}`, (url: string, { arg }: { arg: auth.ParamsOtpVerify }) => {
    return fetcher(`${url}/${arg.otp}/${arg.phone}`, Methods.PATCH, arg);
  });
  return { triggerOtpVerify: trigger, error };
};

export const useLoginPhone = () => {
  const { trigger, error } = useSWRMutation<any, auth.Error, string, auth.ParamsLoginPhone>(`${Endpoint.Auth.LOGIN}`, (url: string, { arg }: { arg: auth.ParamsLoginPhone }) => {
    return fetcher(url, Methods.POST, arg);
  });
  return { triggerLoginPhone: trigger, error };
};

export const useForgotPassword = () => {
  const { trigger, error } = useSWRMutation<auth.ResponeForgotPassword, auth.Error, string, auth.ParamsForgotPassword>(`${Endpoint.Auth.FORGOT_PASSWORD}`, (url: string, { arg }: { arg: auth.ParamsForgotPassword }) => {
    return fetcher(`${url}/${arg.phone}`, Methods.POST, arg);
  });
  return { triggerForgotPassword: trigger, error };
};

export const useResetPassword = () => {
  const { trigger, error } = useSWRMutation<any, auth.Error, string, auth.ParamsResetPassword>(`${Endpoint.Auth.RESET_PASSWORD}`, (url: string, { arg }: { arg: auth.ParamsResetPassword }) => {
    return fetcher(`${url}/${arg.phone}`, Methods.POST, arg);
  });
  return { triggerResetPassword: trigger, error };
};

