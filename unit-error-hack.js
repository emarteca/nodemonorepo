let warn = console.warn

console.error = function (message) {
  warn.apply(console, arguments) // keep default behaviour
  throw (message instanceof Error ? message : new Error(message))
}

