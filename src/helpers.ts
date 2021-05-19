// @ts-ignore
import wmic from 'wmic'

export const getExecVersion: (execPath: string) => Promise<string> = (
  execPath: string
) =>
  new Promise((resolve, reject) => {
    const cmd = ['datafile', 'where', `name='${execPath}'`].join(' ')
    wmic.get_value(cmd, 'Version', null, (err: Error, value: string) => {
      if (err) {
        reject(err)
      }
      resolve(value)
    })
  })
