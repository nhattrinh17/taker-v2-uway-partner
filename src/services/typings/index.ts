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

export interface PlaceData {
  place_id: string;
  formatted_address: string;
  geometry: Geometry;
  plus_code: PlusCode;
  compound: Compound;
  name: string;
  url: string;
  types: string[];
}

interface PlusCode {
  compound_code: string;
  global_code: string;
}

interface Compound {
  district: string;
  commune: string;
  province: string;
}

export interface Geometry {
  location: Location;
  viewport?: Viewport;
}

interface Location {
  lat: number;
  lng: number;
}

interface Viewport {
  northeast: Location;
  southwest: Location;
}
