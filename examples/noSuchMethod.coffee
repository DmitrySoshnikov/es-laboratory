#
# Object.new with handling noSuchMethod and noSuchProperty
#
# @see also http://github.com/DmitrySoshnikov/es-laboratory/blob/master/src/hook.js
# @author Dmitry A. Soshnikov
#
# (C) 2010 Mit Style License
#

# require "src/es6.js"

( ->
  # an activator of noSuchMethod;
  # to have only one function and do not
  # create every time new (to keep === invariant),
  # for that a missed property name is kept as a
  # property of `activator` function and set on `get`
  activator = (args...) ->
    @noSuchMethod.call(activator.name, args) if typeof @noSuchMethod == "function"

  # Object.new creates objects with possible
  # noSuchMethod and noSuchProperty hooks
  Object.defineProperty Object, "new"
    value: (proto, desc) ->

      # a trapped object
      object = Object.create proto, desc

      # a handler of the proxy for `object`
      handler = Proxy.noopHandler object
      handler.get = (r, name) ->
        # if a property exists,
        # just return it
        return object[name] if object[name]

        # else, activate noSuchProperty first
        object.noSuchProperty name if typeof object.noSuchProperty is "function"

        # we do not have `isCall` flag, so for every
        # non-existing property return the activator;
        # Invariant issues: foo.bar (always) === foo.baz,
        # where both `bar` and `baz` are non-existing props
        activator

      # a proxy with handling noSuchMethod
      Proxy.create handler, proto
)()

# tests: create an object
# which inherit from missedHook object

foo = Object.new Object.prototype,
  x:
    value: 10
    writable: true
  bar:
    value: (args...) -> @baz.apply @, args
    writable: true
  noSuchProperty:
    value: (name) -> console.log "noSuchProperty: ", name
  noSuchMethod:
    value: (name, args) -> console.log "noSuchMethod: ", name, args

# existing property
console.log foo.x # 10

# noSuchProperty:
# activator is returned
foo.baz # noSuchProperty baz

# noSuchMethod:
# activator is returned and
# call noSuchMethod hook of foo
foo.baz 10, 20, 30 # noSuchMethod baz 10 20 30

# existing method which calls
# non-existing method `baz`
# with using apply invariant
foo.bar 1, 2, 3 # bar OK -> noSuchMethod baz 1 2 3
