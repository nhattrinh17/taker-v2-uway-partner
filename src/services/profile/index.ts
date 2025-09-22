import { fetcher } from '../fetcher';
import useSWRMutation from 'swr/mutation';
import { Methods } from '../typings';
import Endpoint from '../Endpoind';
import { ParamsGetReferral, ChangePasswordRequest, ChangePhoneRequest ,ParamsGetSignedUrl, ParamsSetFCMToken, PartnerProfile,  ResponseGetReferral, ResponseSetFCMToken, Response } from './typings';



export const useGetInfo = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(`${Endpoint.Partner.GET_PROFILE}`, (url: string, { arg }: { arg: any }) => {
    return fetcher(url, Methods.GET, arg);
  });
  return { triggerGetInfo: trigger, errorGetInfo: error };
};

export const useUpdateInfo = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(`${Endpoint.Partner.UPDATE_PROFILE}`, (url: string, { arg }: { arg: any }) => {
    return fetcher(url, Methods.PATCH, arg);
  });
  return { triggerUpdateInfo: trigger, errorUpdateInfo: error };
};

export const useChangePhone = () => {
  const { trigger, error } = useSWRMutation<any, any, string, ChangePhoneRequest>(
    `${Endpoint.Partner.CHANGE_PHONE}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(`${url}/${arg.id}`, Methods.PATCH, arg.data);
    }
  );
  return { triggerChangePhone: trigger, errorChangePhone: error };
};

// CHANGE_PASSWORD
export const useChangePassword = () => {
  const { trigger, error } = useSWRMutation<any, any, string,ChangePasswordRequest>(
    `${Endpoint.Partner.CHANGE_PASSWORD}`,
    (url: string, { arg }: { arg: ChangePasswordRequest }) => {
      return fetcher(url, Methods.PATCH, arg);
    }
  );
  return { triggerChangePassword: trigger, errorChangePassword: error };
};

export const useGetSignedUrl = () => {
  const { trigger } = useSWRMutation<Response, any, string, ParamsGetSignedUrl>(Endpoint.Partner.SIGNED_URL, (url: string, { arg }: { arg: ParamsGetSignedUrl }) => {
    return fetcher(`${url}?fileName=${arg}`, Methods.GET);
  });
  return {
    triggerGetSignedUrl: trigger,
  };
};
