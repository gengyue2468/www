type Canteen = {
  name: string;
  remaining: string;
  imgUrl?: string;
};

type kaifanStatus = {
  name: string;
  isOpen: boolean;
  status: string;
};

export type { Canteen, kaifanStatus };
