var slugs = require('github-slugger')()
var visit = require('unist-util-visit-parents')
var toString = require('mdast-util-to-string')

module.exports = linkSelf

function linkSelf() {
  return transform

  function transform(tree) {
    slugs.reset()
    visit(tree, 'link', onlink)

    function onlink(node, parents) {
      var parent = parents[parents.length - 1]
      var siblings = parent.children
      var pos = siblings.indexOf(node)

      if (node.url !== '#') {
        return
      }

      var id = slugs.slug(toString(node))

      tree.children.push({
        type: 'definition',
        identifier: id,
        url: '#' + id
      })

      parent.children = siblings
        .slice(0, pos)
        .concat(
          {type: 'html', value: '<a id="' + id + '" href="#' + id + '">'},
          {type: 'strong', children: node.children},
          {type: 'html', value: '</a>'}
        )
        .concat(siblings.slice(pos + 1))
    }
  }
}
