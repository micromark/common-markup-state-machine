var toString = require('mdast-util-to-string')

module.exports = numberHeadings

function numberHeadings() {
  return transform

  function transform(tree) {
    var children = tree.children
    var length = children.length
    var index = -1
    var numbers = []
    var node
    var pos

    while (++index < length) {
      node = children[index]

      if (
        node.type !== 'heading' ||
        node.depth === 1 ||
        /table of contents/i.test(toString(node))
      ) {
        continue
      }

      pos = node.depth - 2
      numbers.length = pos + 1
      numbers[pos] = numbers[pos] ? numbers[pos] + 1 : 1

      node.children.unshift({type: 'text', value: numbers.join('.') + ' '})
    }
  }
}
