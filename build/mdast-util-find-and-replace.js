var visit = require('unist-util-visit-parents')

module.exports = findAndReplace

function findAndReplace(tree, find, replace) {
  visit(tree, 'text', ontext)

  function ontext(node, parents) {
    var parent = parents[parents.length - 1]
    var siblings = parent.children
    var pos = siblings.indexOf(node)
    var value = node.value
    var lastIndex = 0
    var match = find.exec(value)
    var index
    var subvalue
    var result = []

    while (match) {
      index = match.index
      subvalue = value.slice(lastIndex, index)

      if (subvalue) {
        result.push({type: 'text', value: subvalue})
      }

      subvalue = replace.apply(null, match)

      if (subvalue) {
        if (typeof subvalue === 'string') {
          subvalue = {type: 'text', value: subvalue}
        }

        result = result.concat(subvalue)
      }

      lastIndex = index + match[0].length

      match = find.exec(value)
    }

    if (index === undefined) {
      result = [node]
    } else {
      subvalue = value.slice(lastIndex)

      if (subvalue) {
        result.push({type: 'text', value: subvalue})
      }

      parent.children = siblings
        .slice(0, pos)
        .concat(result)
        .concat(siblings.slice(pos + 1))
    }
  }
}
