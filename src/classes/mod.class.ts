export class Mod {
  protected readonly folder: string;

  constructor(folder: string) {
    this.folder = folder
  }

  get name() {
    return this.folder
  }
}
