handlebars = require "handlebars"
_ = require "lodash"
moment = require "moment"

require "./i18n_helpers"

handlebars.registerHelper "helperMissing", ->
  "missing helper"

handlebars.registerHelper "equals", (a, b, options) ->
  if a?.toString() == b?.toString()
    options.fn @
  else
    options.inverse @

handlebars.registerHelper "lt", (a, b, options) ->
  if a < b
    options.fn(this)
  else
    options.inverse(this)

handlebars.registerHelper "gt", (a, b, options) ->
  if parseFloat(a) > parseFloat(b)
    options.fn @
  else
    options.inverse @

handlebars.registerHelper "and", (a, b, options) ->
  if a? and b?
    options.fn @
  else
    options.inverse @

handlebars.registerHelper "neither", (a, b, options) ->
  if !a and !b
    options.fn @
  else
    options.inverse @

handlebars.registerHelper "mod", (a, b, options) ->
  if (a + 1) % b != 0
    options.inverse @
  else
    options.fn @

handlebars.registerHelper 'of', (a, b, options)->
  if a == undefined
    options.inverse(this)
    return
  values = b.split(",")
  if _.contains values, a.toString()
    options.fn(this)
  else
    options.inverse(this)

handlebars.registerHelper "formatDate", (date, type, options) ->
  return unless date
  switch type
    when "gmt" then moment(parseInt date).format("EEE MMM dd HH:mm:ss Z yyyy")
    when "day" then moment(parseInt date).format("yyyy-MM-dd")
    when "minute" then moment(parseInt date).format("yyyy-MM-dd HH:mm")
    else
      if typeof(type) is "string"
        moment(parseInt date).format(type)
      else
        moment(parseInt date).format("yyyy-MM-dd HH:mm:ss")

handlebars.registerHelper "pp", (options) ->
  JSON.stringify @

handlebars.registerHelper "json", (json, options) ->
  JSON.stringify(json or @)

handlebars.registerHelper "size", (a, options) ->
  return 0 if a is undefined
  if a.length
    return if _.isFunction(a.length) then a.length() else a.length
  if a.size
    return if _.isFunction(a.size) then a.size() else a.size
  0

handlebars.registerHelper "ifCond", (v1, operator, v2, options) ->
  isTrue = switch operator
    when "==" then `v1 == v2`
    when "!=" then `v1 != v2`
    when "===" then v1 == v2
    when "!==" then v1 != v2
    when "&&" then v1 && v2
    when "||" then v1 || v2
    when "<" then v1 < v2
    when "<=" then v1 <= v2
    when ">" then v1 > v2
    when ">=" then v1 >= v2
    else eval("#{v1}#{operator}#{v2}")
  if isTrue then options.fn(@) else options.inverse(@)
