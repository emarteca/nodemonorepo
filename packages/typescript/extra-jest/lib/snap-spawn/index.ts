import { SpawnSyncOptions } from 'child_process'
import * as xsnap from '../snap'
import spawn, { SpawnFunc, Argv, createSpawnFunc } from './lib/spawn'

export * from './lib/spawn'

export function snap (
  fn: SpawnFunc,
  argv?: Argv,
  options?: SpawnSyncOptions,
  snap = xsnap.safe
) {
  return snap(spawn(fn, argv, options))
}

export namespace snap {
  export const withCommand = (
    command: string,
    argv?: Argv,
    options?: SpawnSyncOptions,
    fsnap = xsnap.safe
  ) => snap(createSpawnFunc(command), argv, options, fsnap)
}

export default snap
