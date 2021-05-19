import {Command} from '@oclif/command'
import Conf from 'conf'
import {cli} from 'cli-ux'
import fs from 'fs'
import {Mod} from '../../../classes/mod.class'

export default class Index extends Command {
  static aliases = ['bts:mods']

  static config = new Conf()

  async run() {
    const btsDir = Index.config.get('btsDir') as string
    if (!btsDir) {
      this.error('Sid Meier’s: Beyond the Sword folder is not set')
      this.exit(1)
    }
    cli.action.start('Retrieving installed modifications')
    const files = await fs.promises.readdir(`${btsDir}\\mods`)
    cli.action.stop()
    const mods = files.map(file => new Mod(file))
    cli.table(mods, {name: {
      minWidth: 7,
    }})
  }
}
