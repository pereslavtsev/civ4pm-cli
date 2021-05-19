import {Command} from '@oclif/command'
import Conf from 'conf'
import fs from 'fs'
import {cli} from 'cli-ux'
import {Mod} from '../../classes/mod.class'

export default class Index extends Command {
  static aliases = ['bts']

  static config = new Conf()

  async run() {

  }
}
