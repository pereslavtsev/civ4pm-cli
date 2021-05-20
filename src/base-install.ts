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
import StreamZip from 'node-stream-zip'
import prompts from 'prompts'
import execa from 'execa'

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
      .on('response', this.onDownloadStart.bind(this))
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

      // Try to find mod config
      // eslint-disable-next-line new-cap
      const zip = new StreamZip.async({file: path})
      // const zip = new StreamZip.async({file: 'C:\\Users\\pstra\\Downloads\\0171\\Europe.zip'})
      const entries = await zip.entries()
      cli.action.start('Reading zip-archive')
      let packagePath
      let packageName
      for (const entry of Object.keys(entries)) {
        cli.action.start(`Matching ${entry}`)
        const match = entry.match(/(\S+\/)?(\S+)(\.ini$)/)
        if (match) {
          packagePath = match[1]
          packageName = match[2]
          cli.action.stop()
          break
        }
      }

      this.debug('packagePath', packagePath)
      this.debug('packageName', packageName)

      let counter = 0
      this.log('is exists?', `${btsDir}\\Mods\\${packageName}`)
      const isExists = fs.existsSync(`${btsDir}\\Mods\\${packageName}`)
      if (isExists) {
        do {
          counter++
        } while (fs.existsSync(`${btsDir}\\Mods\\${packageName} (${counter})`))
      }
      this.debug('counter', counter)
      this.debug('isExists', isExists)
      if (isExists) {
        const {value} = await prompts({
          type: 'confirm',
          name: 'value',
          message: `Folder "${packageName}" is already exists. Do you want to install mod to folder "${packageName} (${counter})" ?`,
          initial: true,
        })
        this.debug(value)
        if (!value) {
          this.exit(1)
        }
      }
      const outPath = `${btsDir}\\mods\\${packageName}${counter ? ` (${counter})` : ''}`
      await fs.promises.mkdir(outPath, {recursive: true})
      zip.on('extract', entry => {
        cli.action.start(`Extracting ${entry.name}`)
      })
      await zip.extract(packagePath as string, outPath)
      cli.action.stop('Archive has been successfully extracted')
      await zip.close()

      // Cleanup temporary file
      cli.action.start('Cleanup temporary file ...')
      await cleanup()
      cli.action.stop()

      const {value} = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Do you want to run the game with the installed mod (${'packageName'}) ?`,
        initial: true,
      })

      if (value) {
        const r = await execa('cmd', ['/c', `${btsDir}\\Civ4BeyondSword.exe`], {detached: true})
        console.log('r', r)
        // await execa(`cmd /K "${btsDir}\\Civ4BeyondSword.exe" mod=\\${packageName}`)
      }
    } catch (error) {
      this.error(error)
      this.exit(1)
    }
  }
}
