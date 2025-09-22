import { fetcher } from '../fetcher';
import useSWRMutation from 'swr/mutation';
import { Methods } from '../typings';
import Endpoint from '../Endpoind';
import { AcceptShoeBookingRequest } from './typings';

export const useGetShoeBooking = () => {
  const url = `${Endpoint.ShoeBooking.GET_SHOE}`;

  // log URL mỗi khi hook được khởi tạo
  console.log('useGetShoeBooking URL:', url);

  const { trigger, error } = useSWRMutation<any, any, string, any>(
    url,
    (key: string, { arg }: { arg: any }) => {
      // log khi thực hiện trigger
      console.log('Trigger fetch with URL:', key, 'and arg:', arg);
      return fetcher(key, Methods.GET, arg);
    }
  );

  return {
    triggerGetShoeBooking: trigger,
    errorGetStatus: error,
  };
};


export const useGetShoeBookingTimeline = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(`${Endpoint.ShoeBooking.GET_TIMELINE}`, (url: string, { arg }: { arg: any }) => {
      return fetcher(`${url}/${arg.id}`, Methods.GET, arg);
    }
  );
  return { triggerGetShoeBookingTimeline: trigger, errorGetStatus: error };
};

export const useAcceptShoeBooking = () => {
  const { trigger, error } = useSWRMutation<any, any, string, { id: string; data: AcceptShoeBookingRequest }>(
    `${Endpoint.ShoeBooking.ACCEPT}`,
    (url: string, { arg }: { arg: { id: string; data: AcceptShoeBookingRequest } }) => {
      return fetcher(`${url}/${arg.id}`, Methods.PATCH, arg.data);
    }
  );
  return { triggerAcceptShoeBooking: trigger, errorGetStatus: error };
};

export const useRejectShoeBooking = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.ShoeBooking.REJECT}`,
    (url: string, { arg }: { arg: { id: string;} }) => {
      return fetcher(`${url}/${arg.id}`, Methods.PATCH, arg);
    }
  );
  return { triggerRejectShoeBooking: trigger, errorRejectShoeBooking: error };
};

export const useUpdateShoeBookingStatus = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.ShoeBooking.UPDATE_STATUS}`,
    (url: string, { arg }: { arg: { id: string; data: any} }) => {
      return fetcher(`${url}/${arg.id}/status`, Methods.PATCH, arg.data);
    }
  );
  return { triggerUpdateShoeBookingStatus: trigger, errorUpdateShoeBookingStatus: error};
};

export const useUploadProcessImages= () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.ShoeBooking.UPLOAD_IMAGE}`,
    (url: string, { arg }: { arg: { id: string; data: any} }) => {
      return fetcher(`${url}/${arg.id}`, Methods.PATCH, arg.data);
    }
  );
  return { triggerUploadProcessImages: trigger, errorUploadProcessImages: error };
};