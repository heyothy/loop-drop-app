var NodeArray = require('observ-node-array')
var NodeVarhash = require('observ-node-array/varhash')
var lookup = require('observ-node-array/lookup')
var extendParams = require('lib/extend-params')
var BaseChunk = require('lib/base-chunk')
var Property = require('observ-default')
var ExternalRouter = require('lib/external-router')
var computed = require('@mmckegg/mutant/computed')
var destroyAll = require('lib/destroy-all')

module.exports = TriggersChunk

function TriggersChunk (parentContext) {
  var context = Object.create(parentContext)
  context.output = context.audio.createGain()
  context.output.connect(parentContext.output)

  var slots = NodeArray(context)
  context.slotLookup = lookup(slots, 'id')

  var volume = Property(1)
  var overrideVolume = Property(1)

  var obs = BaseChunk(context, {
    slots: slots,
    inputs: Property([]),
    outputs: Property([]),
    routes: ExternalRouter(context, {output: '$default'}, computed([volume, overrideVolume], multiply)),
    params: Property([]),
    volume: volume,
    paramValues: NodeVarhash(parentContext),
    selectedSlotId: Property()
  })

  obs.overrideVolume = overrideVolume

  context.chunk = obs
  obs.params.context = context

  obs.output = context.output
  slots.onUpdate(obs.routes.refresh)

  obs.destroy = function () {
    destroyAll(obs)
  }

  extendParams(obs)

  return obs
}

function multiply (a, b) {
  return a * b
}
