export interface AddressCreateRequest {
  address: string;
  location: string;
  isDefault: boolean;
  label: string;
  fullName: string;
  phone: string;
  isBranchAddress: boolean;
  isPickupAddress: boolean;
  isReturnAddress: boolean;
}
