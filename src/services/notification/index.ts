import { fetcher } from '../fetcher';
import useSWRMutation from 'swr/mutation';
import { Methods } from '../typings';
import Endpoint from '../Endpoind';

export const useGetNotifications = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Notification.GET_NOTIFICATION}`,
    (url: string, { arg }: { arg: any }) => {
      // arg có thể chứa query params: { page, limit, ... }
      return fetcher(`${url}${new URLSearchParams(arg).toString()}`, Methods.GET);
    }
  );
  return { triggerGetNotifications: trigger, errorGetNotifications: error };
};

// UPDATE (read notification/{id})
export const useReadNotification = () => {
  const { trigger, error } = useSWRMutation<any, any, string, { id: string }>(
    `${Endpoint.Notification.UPDATE}`,
    (url: string, { arg }: { arg: { id: string } }) => {
      return fetcher(`${url}/${arg.id}`, Methods.PATCH);
    }
  );
  return { triggerReadNotification: trigger, errorReadNotification: error };
};

// DELETE notification/{id}
export const useDeleteNotification = () => {
  const { trigger, error } = useSWRMutation<any, any, string, { id: string }>(
    `${Endpoint.Notification.DELETE}`,
    (url: string, { arg }: { arg: { id: string } }) => {
      return fetcher(`${url}/${arg.id}`, Methods.DELETE);
    }
  );
  return { triggerDeleteNotification: trigger, errorDeleteNotification: error };
};