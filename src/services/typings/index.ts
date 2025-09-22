export enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface WithDraw {
  id: number;
  date: string;
  time: string;
  number: string;
  status: string;
  type: string;
  money: string;
}
