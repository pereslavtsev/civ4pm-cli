import {getExecVersion} from '../helpers'
import {ExecutableType} from '../enums/executable-type.enum'
import Conf from 'conf'

export class Executable {
  protected static config = new Conf()

  protected readonly type: ExecutableType;

  protected readonly path: string;

  protected constructor(path: string, type: ExecutableType) {
    this.path = path
    this.type = type
  }

  static create(path: string) {
    const fixedPath = path.replace(/\//g, '\\')
    const sections = fixedPath.split('\\')
    const filename = sections.pop()
    const folderPath = sections.join('\\')
    switch (filename) {
    case 'Civilization4.exe':
    default:
      return new Executable(folderPath, ExecutableType.Vanilla)
    case 'Civ4BeyondSword.exe':
      return new Executable(folderPath, ExecutableType.BeyondTheSword)
    }
  }

  get filename() {
    switch (this.type) {
    case ExecutableType.BeyondTheSword:
      return 'Civ4BeyondSword.exe'
    case ExecutableType.Vanilla:
      return 'Civilization4.exe'
    }
  }

  get title() {
    const title = 'Sid Meier’s Civilization IV'
    switch (this.type) {
    case ExecutableType.BeyondTheSword:
      return `${title}: Beyond the Sword`
    case ExecutableType.Vanilla:
      return title
    case ExecutableType.Warlords:
      return `${title}: Warlords`
    }
  }

  get fullPath(): string {
    return this.path
  }

  registerAsDefault(): void {
    switch (this.type) {
    case ExecutableType.Vanilla:
      Executable.config.set('civ4Dir', this.path)
      return
    case ExecutableType.Warlords:
      Executable.config.set('wlDir', this.path)
      return
    case ExecutableType.BeyondTheSword:
      Executable.config.set('btsDir', this.path)
    }
  }

  detectVersion(): Promise<string> {
    const execPath = `${this.path}\\${this.filename}`
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    return getExecVersion(execPath)
  }
}
