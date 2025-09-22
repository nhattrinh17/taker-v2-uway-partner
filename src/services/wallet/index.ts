import { fetcher } from '../fetcher';
import useSWRMutation from 'swr/mutation';
import { Methods } from '../typings';
import Endpoint from '../Endpoind';
import { ParamsAccessCode, ParamsUpBill, ParamsTotalIncome, ParamsVehicle } from './typings'
import { omit } from 'lodash';

// HISTORY_WALLET
export const useGetWalletHistory = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Wallet.HISTORY_WALLET}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.GET, arg);
    }
  );
  return { triggerGetWalletHistory: trigger, errorGetWalletHistory: error };
};

// DEPOSIT
export const useDepositWallet = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Wallet.DEPOSIT}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.POST, arg);
    }
  );
  return { triggerDepositWallet: trigger, errorDepositWallet: error };
};

// UP_BILL
export const useUpBill = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(`${Endpoint.Wallet.UP_BILL}`, (url: string, { arg }: { arg: ParamsUpBill }) => {
    return fetcher(`${url}/${arg.transactionId}`, Methods.PATCH, omit(arg, 'transactionId'));
  });
  return { triggerUpBill: trigger, errorGetStatus: error };
};

// GET_BALANCE
export const useGetWalletBalance = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Wallet.GET_BALANCE}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.GET, arg);
    }
  );
  return { triggerGetWalletBalance: trigger, errorGetWalletBalance: error };
};

// HISTORY_TRANSACTION
export const useGetWalletTransactionHistory = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Wallet.HISTORY_TRANSACTION}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.GET, arg);
    }
  );
  return {
    triggerGetWalletTransactionHistory: trigger,
    errorGetWalletTransactionHistory: error,
  };
};

// GET_WALLET
export const useGetWallet = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Wallet.GET_WALLET}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.GET, arg);
    }
  );
  return { triggerGetWallet: trigger, errorGetWallet: error };
};

// GET_ACCESS_CODE
export const useGetWalletAccessCode = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Wallet.GET_ACCESS_CODE}`,
    (url: string, { arg }: { arg: ParamsAccessCode }) => {
      return fetcher(url, Methods.POST, arg);
    }
  );
  return {
    triggerGetWalletAccessCode: trigger,
    errorGetWalletAccessCode: error,
  };
};

// WITH_DRAW
export const useWithdrawWallet = () => {
  const { trigger, error } = useSWRMutation<any, any, string, any>(
    `${Endpoint.Wallet.WITH_DRAW}`,
    (url: string, { arg }: { arg: any }) => {
      return fetcher(url, Methods.POST, arg);
    }
  );
  return { triggerWithdrawWallet: trigger, errorWithdrawWallet: error };
};