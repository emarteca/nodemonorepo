import { splitAt } from '@tsfun/array'

export type Action<X> = (x?: X) => X | Promise<X>

const INITIAL_PROMISE = Promise.resolve()

export function throttledConcurrentActions<X> (
  count: number,
  list: ReadonlyArray<Action<X>>
): Promise<ReadonlyArray<X>> {
  return Promise.all(main(list, []))

  function main (
    list: ReadonlyArray<Action<X>>,
    past: ReadonlyArray<Promise<X | undefined>>
  ): ReadonlyArray<Promise<X>> {
    const [current, next] = splitAt(list, count)

    const nextPast = current.map(
      (fn, i) => (past[i] || INITIAL_PROMISE).then(fn)
    )

    return current.length
      ? nextPast.concat(main(next, nextPast))
      : nextPast
  }
}

export default throttledConcurrentActions
