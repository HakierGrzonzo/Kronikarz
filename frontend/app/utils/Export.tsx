export class ExportHandler {
  private static instance: ExportHandler;
  private shouldExport = false;
  private exportType = "";

  private constructor() {}

  public static getInstance(): ExportHandler {
    if (!ExportHandler.instance) {
      ExportHandler.instance = new ExportHandler();
    }
    return ExportHandler.instance;
  }

  public getShouldExport(): boolean {
    return this.shouldExport;
  }

  public setShouldExport(value: boolean): void {
    this.shouldExport = value;
  }

  public getExportType(): string {
    return this.exportType;
  }

  public setExportType(value: string): void {
    this.exportType = value;
  }
}
