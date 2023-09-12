export class Gateway {
    public hasProcessedHi: boolean = false;
    public hasSentDevices: boolean = false;
    public lastPing: number = Date.now();
}
