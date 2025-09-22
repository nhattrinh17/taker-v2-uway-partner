import { fetcher } from '../fetcher';
import useSWRMutation from 'swr/mutation';
import { Methods } from '../typings';
import Endpoint from '../Endpoind';

export const useGetRatingDetail = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Rating.GET_DETAIL}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.GET, arg);
    }
  );
  return { triggerGetRatingDetail: trigger, errorGetRatingDetail: error };
};

export const useGetRatingAverage = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Rating.GET_AVG}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.GET, arg);
    }
  );
  return { triggerGetRatingAverage: trigger, errorGetRatingAverage: error };
};