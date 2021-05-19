import {Command} from '@oclif/command'
import fg from 'fast-glob'
import os from 'os'
import path from 'path'
import {Executable} from '../classes/executable.class'
import chalk from 'chalk'

export default class Scan extends Command {
  static description = 'scanning for Sid Meier\'s Civilization IV executable files'

  static examples = [
    '$ civ4pm scan',
  ]

  static patterns = [
    'Program Files*/**/Civilization4.exe',
    'Program Files*/**/Civ4BeyondSword.exe',
  ]

  async run() {
    this.log('Scanning for Sid Meier\'s Civilization IV executable files ...')
    const root = os.platform() === 'win32' ? `${process.cwd().split(path.sep)[0]}\\` : '/'
    const stream = fg.stream(Scan.patterns, {
      dot: true,
      cwd: root,
      suppressErrors: true,
    })
    for await (const entry of stream) {
      const exe = Executable.create(root + entry)
      const version = await exe.detectVersion()
      exe.registerAsDefault()
      this.log(`* ${chalk.whiteBright(exe.title)} version ${chalk.whiteBright(version)} (${chalk.cyan(exe.fullPath)})`)
    }
  }
}
