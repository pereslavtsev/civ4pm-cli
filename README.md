civ4pm-cli
==========



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/civ4pm-cli.svg)](https://npmjs.org/package/civ4pm-cli)
[![CircleCI](https://circleci.com/gh/pereslavtsev/civ4pm-cli/tree/master.svg?style=shield)](https://circleci.com/gh/pereslavtsev/civ4pm-cli/tree/master)
[![Codecov](https://codecov.io/gh/pereslavtsev/civ4pm-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/pereslavtsev/civ4pm-cli)
[![Downloads/week](https://img.shields.io/npm/dw/civ4pm-cli.svg)](https://npmjs.org/package/civ4pm-cli)
[![License](https://img.shields.io/npm/l/civ4pm-cli.svg)](https://github.com/pereslavtsev/civ4pm-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g civ4pm-cli
$ civ4pm COMMAND
running command...
$ civ4pm (-v|--version|version)
civ4pm-cli/0.1.0 win32-x64 node-v16.0.0
$ civ4pm --help [COMMAND]
USAGE
  $ civ4pm COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`civ4pm hello [FILE]`](#civ4pm-hello-file)
* [`civ4pm help [COMMAND]`](#civ4pm-help-command)

## `civ4pm hello [FILE]`

describe the command here

```
USAGE
  $ civ4pm hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ civ4pm hello
  hello world from ./src/index.ts!
```

_See code: [src/commands/index.ts](https://github.com/pereslavtsev/civ4pm-cli/blob/v0.1.0/src/commands/hello.ts)_

## `civ4pm help [COMMAND]`

display help for civ4pm

```
USAGE
  $ civ4pm help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_
<!-- commandsstop -->
