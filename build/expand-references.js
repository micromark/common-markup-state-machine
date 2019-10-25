var visit = require('unist-util-visit-parents')
var toString = require('mdast-util-to-string')
var find = require('./mdast-util-find-and-replace')

module.exports = expandStates

function expandStates() {
  return transform

  function transform(tree) {
    var slugs = {}
    var types = ['state', 'label', 'token', 'group']
    var re = new RegExp(
      '(' + types.map(d => d.charAt(0)).join('|') + '):([a-z-]+)',
      'g'
    )

    visit(tree, 'heading', onheading)

    find(tree, re, replace)

    Object.keys(slugs).forEach(s => {
      tree.children.push({
        type: 'definition',
        identifier: s,
        url: '#' + slugs[s].slug
      })
    })

    function onheading(node) {
      var id = node.data && node.data.id

      if (!id) {
        return
      }

      types.forEach(d => {
        var key

        if (new RegExp('^\\d+(?:-[a-z]+)+-' + d + '$').test(id)) {
          key =
            d.charAt(0) +
            '-' +
            id.replace(/^\d+-/, '').replace(new RegExp('-' + d + '$'), '')

          slugs[key] = {
            label: toString(node).replace(/^\d+(\.\d+)*\s/, ''),
            slug: id
          }
        }
      })
    }

    function replace(all) {
      var ref = all.replace(':', '-')

      if (!slugs[ref]) {
        throw new Error('Cannot expand `' + all + '`')
      }

      return {
        type: 'linkReference',
        label: ref,
        identifier: ref,
        referenceType: 'full',
        children: [
          {
            type: 'emphasis',
            children: [{type: 'text', value: slugs[ref].label}]
          }
        ]
      }
    }
  }
}
