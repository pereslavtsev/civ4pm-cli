import {Command} from '@oclif/command'
import Conf from 'conf'
import cliProgress from 'cli-progress'
import request from 'request'
import fs from 'fs'
import Url from 'url-parse'
import {CFPackage} from '../../classes/cf-package.class'
import querystring from 'querystring'
import {file} from 'tmp-promise'
import {cli} from 'cli-ux'
import contentDisposition from 'content-disposition'

export default class Index extends Command {
  static aliases = ['bts:install', 'bts:i']

  static config = new Conf()

  static args = [
    {name: 'pkg', required: true},
  ]

  async run() {
    const {args} = this.parse(Index)
    const btsDir = Index.config.get('btsDir') as string
    if (!btsDir) {
      this.error('Sid Meier’s: Beyond the Sword folder is not set')
      this.exit(1)
    }
    this.debug('package arg', args.pkg)
    const url = new Url(args.pkg)
    let downloadUrl: string
    if (url.hostname.includes('civfanatics.com')) {
      this.debug('url related to civfanatics.com')

      // Package ID extraction
      const [,, name] = url.pathname.split('/')
      this.debug('package name', name)
      this.debug('extracting package id...')
      const id = Number(name.replace(/^\D+/g, ''))
      this.debug('extracted package id is', id)

      if (!id) {
        this.error('CivFanatics package ID can not be extracted from the url')
        this.exit(1)
      }

      // Package version extraction
      const query = querystring.parse(String(url.query).replace(/\?/, ''))
      const version = Number(query.version)
      this.debug('extracted version', version)

      if (!version) {
        this.error('CivFanatics package version can not be extracted from the url')
        this.exit(1)
      }
      const pkg = new CFPackage(id, version)
      downloadUrl = pkg.downloadUrl
      this.debug('pkg obj', pkg)
    }

    const {path, cleanup} = await file()
    try {
      this.debug('temp file path', path)
      this.log('Created temporary file:', path)
      const out = fs.createWriteStream(path)
      const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

      const req = request({
        method: 'GET',
        uri: downloadUrl,
      })

      let receivedBytes = 0

      req
      .on('error', async (err: Error) => {
        bar.stop()
        await cleanup()
        this.error(err)
        this.exit(1)
      })
      .on('data', (chunk: any) => {
        receivedBytes += chunk.length
        bar.update(receivedBytes)
      })
      .on('response', (data: any) => {
        this.debug('data headers', data.headers)
        const disposition = contentDisposition.parse(data.headers['content-disposition'])
        this.log('contentDisposition', disposition)
        this.log(`Downloading package (${disposition.parameters?.filename}) ...`)
        const totalBytes = parseInt(data.headers['content-length'], 10)
        bar.start(totalBytes, 0)
      })
      .on('end', async () => {
        bar.stop()
        cli.action.start('Cleanup temporary file ...')
        await cleanup()
        cli.action.stop()
      })
      .pipe(out)
    } catch (error) {
      await cleanup()
      this.error(error)
      this.exit(1)
    }
  }
}
