import * as path from 'path'
import { Stats } from 'fs'
import * as fsx from 'fs-extra'

export type Tree<Other> = Tree.Read<Other>

export namespace Tree {
  export type Read<Other> = Read.Node<Other>

  export namespace Read {
    export type Node<Other> =
      FileContent |
      Object<Other> |
      FileSystemRepresentation.Symlink |
      Other

    export type FileContent = string

    export interface Object<Other> {
      [name: string]: Node<Other>
    }
  }

  export type Write = Write.Node

  export namespace Write {
    export type Node = FileContent | Function | FileSystemRepresentation | Object
    export type FileContent = Read.FileContent | Buffer
    export type Function = (name: string, param: CreateSecondParam) => Promise<void> | void

    export interface Object {
      [name: string]: Node
    }
  }
}

export interface CreateSecondParam {
  readonly create: CreateSecondParam.CreateFunc
}

export namespace CreateSecondParam {
  export type CreateFunc = (tree: Tree.Write, container: string) => Promise<void>
}

export interface NestedReadOptions<Error, Unknown> {
  readonly stat?: NestedReadOptions.StatFunc
  readonly filter?: NestedReadOptions.Filter
  readonly onerror?: NestedReadOptions.ErrorHandler<Error>
  readonly onunknown?: NestedReadOptions.Unknown<Unknown>
}

export namespace NestedReadOptions {
  export type StatFunc = utils.StatFunc
  export type Filter = (param: Filter.Param) => boolean
  export type ErrorHandler<Y> = (error: Error) => Y
  export type Unknown<Y> = (param: Unknown.Param) => Y

  export namespace Unknown {
    export interface Param {
      readonly name: string
      readonly stats: Stats
    }
  }

  export namespace Filter {
    export interface Param {
      readonly container: Param.Container
      readonly item: Param.Item
    }

    export namespace Param {
      export interface Container {
        readonly name: string
        readonly stats: Stats
      }

      export interface Item {
        readonly name: string
      }
    }
  }
}

export namespace Traverse {
  export interface Options {
    readonly deep?: Options.DeepFunc
    readonly level?: Options.Level
    readonly stat?: Options.StatFunc
  }

  export namespace Options {
    export type DeepFunc = (x: DeepFunc.Param) => DeepFunc.Result

    export namespace DeepFunc {
      export interface Param {
        readonly container: string
        readonly item: string
        readonly path: string
        readonly stats: fsx.Stats
        readonly level: Level
      }

      export type Result = boolean
    }

    export type Level = number

    export type StatFunc = utils.StatFunc
  }

  export type Result = Promise<Result.Value>

  export namespace Result {
    export type Item = Options.DeepFunc.Param
    export type Value = ReadonlyArray<Item>
  }
}

/**
 * This class allows to extends `fsTreeUtils.create`'s functionality.
 *
 * This class is an abstract class that is meant to be extended upon,
 * don't instantiated this class directly!
 */
export abstract class FileSystemRepresentation {
  /**
   * Turn `FileSystemRepresentation` object into a real filesystem entity.
   * @param target Name of filesystem entity that needs to be created or written upon.
   * @param param An object contains `create` function
   * @returns Undefined or promise of undefined.
   */
  abstract write (target: string, param: CreateSecondParam): Promise<void> | void
}

export namespace FileSystemRepresentation {
  /**
   * Represents a file.
   */
  export class File extends FileSystemRepresentation {
    private readonly content: File.Content

    /**
     * @param content A string of Buffer which is content of represented file.
     */
    constructor (content: File.Content) {
      super()
      this.content = content
    }

    async write (filename: string) {
      await fsx.writeFile(filename, this.content)
    }
  }

  export namespace File {
    export type Content = Tree.Write.FileContent
  }

  /**
   * Represent a directory.
   */
  export class Directory extends FileSystemRepresentation {
    private readonly content: Directory.Content

    /**
     * @param content An object whose every property represent a child item of represented directory.
     */
    constructor (content?: Directory.Content | null) {
      super()
      this.content = content || {}
    }

    async write (dirname: string, { create }: CreateSecondParam) {
      if (fsx.existsSync(dirname)) {
        const stats = await fsx.stat(dirname)
        if (!stats.isDirectory()) {
          throw new Error(`Entity ${dirname} exists but is not directory`)
        }
      } else {
        await fsx.mkdir(dirname)
      }

      await Promise.all(
        Object
          .entries(this.content)
          .map(([key, val]): [string, Tree.Write] => [path.join(dirname, key), val])
          .map(([newContainer, newTree]) => create(newTree, newContainer))
      )
    }
  }

  export namespace Directory {
    export type Content = Tree.Write.Object
  }

  /**
   * Represents a symbolic link
   */
  export class Symlink extends FileSystemRepresentation {
    private readonly linkTarget: string
    private readonly type?: Symlink.Options.Type

    /**
     * @param linkTarget Where symlink points to.
     *   * 🗈 Relative to the represented symlink.
     * @param options Optional.
     *   * Property `type`: Optional. Either 'file', 'dir' or 'junction'. Only matters in Windows.
     * @see https://nodejs.org/api/fs.html#fs_fs_symlink_target_path_type_callback
     */
    constructor (linkTarget: string, options: Symlink.Options = {}) {
      super()
      this.linkTarget = linkTarget
      Object.assign(this, options)
    }

    async write (linkName: string) {
      await fsx.symlink(this.linkTarget, linkName, this.type)
    }
  }

  export namespace Symlink {
    export interface Options {
      readonly type?: Options.Type
    }

    export namespace Options {
      export type Type = 'dir' | 'file' | 'junction'
    }
  }

  /**
   * Use this to copy files and/or clone directories.
   */
  export class Clone extends FileSystemRepresentation {
    private readonly source: string
    private readonly options?: Clone.Options

    /**
     * @param source Path to source.
     * @param options Options to pass to [`fsExtra.copy`](https://git.io/vh3WC).
     */
    constructor (source: string, options?: Clone.Options) {
      super()
      this.source = source
      this.options = options
    }

    async write (destination: string) {
      await fsx.copy(this.source, destination, this.options)
    }
  }

  export namespace Clone {
    export type Options = fsx.CopyOptions
  }
}

export namespace utils {
  export type StatFunc = (name: string) => Promise<Stats> | Stats
}
