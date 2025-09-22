import { fetcher } from '../fetcher';
import useSWRMutation from 'swr/mutation';
import { Methods } from '../typings';
import Endpoint from '../Endpoind';
import { AddressCreateRequest } from './typings';

// GET_ADDRESS
export const useGetAddress = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Address.GET_ADDRESS}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.GET, arg);
    }
  );
  return { triggerGetAddress: trigger, errorGetAddress: error };
};

// CREATE_ADDRESS
export const useCreateAddress = () => {
  const { trigger, error } = useSWRMutation<any, any, string, AddressCreateRequest>(
    `${Endpoint.Address.CREATE_ADDRESS}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.POST, arg);
    }
  );
  return { triggerCreateAddress: trigger, errorCreateAddress: error };
};

// UPDATE_ADDRESS
export const useUpdateAddress = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Address.UPDATE_ADDRESS}`,
    (url: string, { arg }: { arg: { id: string; } }) => {
      return fetcher(`${url}/${arg.id}`, Methods.PATCH, arg);
    }
  );
  return { triggerUpdateAddress: trigger, errorUpdateAddress: error };
};

// DELETE_ADDRESS
export const useDeleteAddress = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Address.DELETE_ADDRESS}`,
    (url: string, { arg }: { arg: { id: string; } }) => {
      return fetcher(`${url}/${arg.id}`, Methods.DELETE, arg);
    }
  );
  return { triggerDeleteAddress: trigger, errorDeleteAddress: error };
};