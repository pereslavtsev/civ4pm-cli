export class CFPackage {
  protected readonly id: number;

  protected readonly version: number;

  constructor(id: number, version: number) {
    this.id = id
    this.version = version
  }

  get downloadUrl() {
    return `https://forums.civfanatics.com/resources/${this.id}/download?version=${this.version}`
  }
}
