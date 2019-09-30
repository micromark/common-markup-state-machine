var slugs = require('github-slugger')()
var visit = require('unist-util-visit-parents')

module.exports = linkSelf

function linkSelf() {
  return transform

  function transform(tree) {
    visit(tree, 'linkReference', onlink)

    function onlink(node) {
      slugs.reset()
      node.label = slugs.slug(node.identifier, true)
      node.identifier = node.label.toLowerCase()
      node.referenceType = 'full'
    }
  }
}
