import Command from '@oclif/command'
import {Presets, SingleBar} from 'cli-progress'
import request, {Response} from 'request'
import contentDisposition from 'content-disposition'
import fs from 'fs'
import Url from 'url-parse'
import querystring from 'querystring'
import {CFPackage} from './classes/cf-package.class'
import {cli} from 'cli-ux'
import {file} from 'tmp-promise'
import Conf from 'conf'

export default abstract class BaseInstall extends Command {
  static args = [
    {name: 'pkg', required: true},
  ]

  protected readonly downloadBar = new SingleBar({}, Presets.shades_classic)

  protected onDownloadStart(res: Response) {
    this.debug('data headers', res.headers)
    const disposition = contentDisposition.parse(res.headers['content-disposition']as string)
    this.debug('contentDisposition', disposition)
    this.log(`Downloading package (${disposition.parameters?.filename}) ...`)
    const totalBytes = parseInt(res.headers['content-length'] as string, 10)
    this.downloadBar.start(totalBytes, 0)
  }

  protected download(uri: string, out: fs.WriteStream) {
    return new Promise((resolve, reject) => {
      let receivedBytes = 0
      request({method: 'GET',  uri})
      .on('response', this.onDownloadStart)
      .on('data', (chunk: any) => {
        receivedBytes += chunk.length
        this.downloadBar.update(receivedBytes)
      })
      .on('end', resolve)
      .on('error', reject)
      .pipe(out)
    })
  }

  protected createPackageObj(param: string) {
    const url = new Url(param)
    if (!url.hostname.includes('civfanatics.com')) {
      throw new Error()
    }
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
    this.debug('pkg obj', pkg)
    return pkg
  }

  protected init(): Promise<any> {
    return super.init()
  }

  protected finally(_: Error | undefined): Promise<any> {
    cli.action.stop()
    return super.finally(_)
  }

  async run() {
    const config = new Conf()
    const {args} = this.parse(BaseInstall)
    const btsDir = config.get('btsDir') as string
    if (!btsDir) {
      this.error('Sid Meier’s: Beyond the Sword folder is not set')
      this.exit(1)
    }

    try {
      this.debug('package arg', args.pkg)
      const pkg = this.createPackageObj(args.pkg)
      const {path, cleanup} = await file()
      this.debug('temp file path', path)
      this.log('Created temporary file:', path)
      const out = fs.createWriteStream(path)

      try {
        await this.download(pkg.downloadUrl, out)
      } catch (error) {
        this.error(error)
        this.exit(1)
      } finally {
        this.downloadBar.stop() // stop the progress bar in any case
      }

      // Cleanup temporary file
      cli.action.start('Cleanup temporary file ...')
      await cleanup()
      cli.action.stop()
    } catch (error) {
      this.error(error)
      this.exit(1)
    }
  }
}
