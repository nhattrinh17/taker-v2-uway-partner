import { create } from 'zustand';
import { PlaceData } from '../../services/typings';

export enum PackageStatus {
  DEFAULT = 'default',
  PENDING = 'pending',
  FINDING = 'finding',
  SUCCESS = 'success',
  FAIL = 'fail',
  CANCEL = 'cancel',
  ERROR = 'error',
}


type ServicePackagesState = {
  packageStatus: PackageStatus;
  setPackageStatus: (status: PackageStatus) => void;

  evidenceImage: string;
  setEvidenceImage: (evidenceImage: string) => void;
 
};

export const useServicePackagesStore = create<ServicePackagesState>(set => ({
  tripLocation: {
    coordinatesOrigin: {} as PlaceData,
    coordinatesDestination: {} as PlaceData,
  },
  vehicleLocation: {
    coordinatesOrigin: {} as PlaceData,
    coordinatesDestination: {} as PlaceData,
  },
  packageStatus: PackageStatus.DEFAULT,
  setPackageStatus: status => set({ packageStatus: status }),
  evidenceImage: '',
  setEvidenceImage: evidenceImage => set({ evidenceImage }),
  
}));
