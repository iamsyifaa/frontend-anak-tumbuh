export interface QRCodeMatrix {
  modules: boolean[][];
  getModuleCount(): number;
  addData(data: string): void;
  make(): void;
}

export declare const QRCode: new (
  typeNumber: number,
  errorCorrectLevel: number,
) => QRCodeMatrix;
