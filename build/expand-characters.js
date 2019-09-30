var find = require('./mdast-util-find-and-replace')

module.exports = expandCharacters

var {characters, names} = init()

function expandCharacters() {
  return transform

  function transform(tree) {
    find(tree, /c:([A-Z]+|.)/g, replace)
  }

  function replace(all, c) {
    var pos = characters.indexOf(c)
    var message = []
    var value
    var name

    if (pos === -1) {
      name = c === 'VS' ? 'Virtual space' : c === 'EOF' ? 'EOF' : null

      if (!name) {
        throw new Error('Cannot expand character `' + all + '`')
      }
    } else {
      message = [
        'U+' +
          pos
            .toString(16)
            .toUpperCase()
            .padStart(4, '0')
      ]
      value = characters[pos]
      name = names[value]
    }

    if (name) {
      message.push(name.toUpperCase())
    }

    if (value) {
      message = [
        {type: 'text', value: message.join(' ') + ' ('},
        {type: value.length > 1 ? 'text' : 'inlineCode', value: value},
        {type: 'text', value: ')'}
      ]
    } else {
      message = message.join(' ')
    }

    return message
  }
}

function init() {
  return {
    characters: [
      'NUL',
      'SOH',
      'STX',
      'ETX',
      'EOT',
      'ENQ',
      'ACK',
      'BEL',
      'BS',
      'HT',
      'LF',
      'VT',
      'FF',
      'CR',
      'SO',
      'SI',
      'DLE',
      'DC1',
      'DC2',
      'DC3',
      'DC4',
      'NAK',
      'SYN',
      'ETB',
      'CAN',
      'EM',
      'SUB',
      'ESC',
      'FS',
      'GS',
      'RS',
      'US',
      'SP',
      '!',
      '"',
      '#',
      '$',
      '%',
      '&',
      "'",
      '(',
      ')',
      '*',
      '+',
      ',',
      '-',
      '.',
      '/',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      ':',
      ';',
      '<',
      '=',
      '>',
      '?',
      '@',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
      '[',
      '\\',
      ']',
      '^',
      '_',
      '`',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
      '{',
      '|',
      '}',
      '~',
      'DEL'
    ],
    names: {
      NUL: 'Null',
      HT: 'Character tabulation',
      LF: 'Line feed',
      CR: 'Carriage return',
      SP: 'Space',
      '!': 'Exclamation mark',
      '"': 'Quotation mark',
      '#': 'Number sign',
      $: 'Dollar sign',
      '%': 'Percent sign',
      '&': 'Ampersand',
      "'": 'Apostrophe',
      '(': 'Left parenthesis',
      ')': 'Right parenthesis',
      '*': 'Asterisk',
      '+': 'Plus sign',
      ',': 'Comma',
      '-': 'Dash',
      '.': 'Dot',
      '/': 'Slash',
      ':': 'Colon',
      ';': 'Semicolon',
      '<': 'Less than',
      '=': 'Equals to',
      '>': 'Greater than',
      '?': 'Question mark',
      '@': 'At sign',
      '[': 'Left square bracket',
      '\\': 'Backslash',
      ']': 'Right square bracket',
      '^': 'Caret',
      _: 'Underscore',
      '`': 'Grave accent',
      '{': 'Left curly brace',
      '|': 'Vertical bar',
      '}': 'Right curly brace',
      '~': 'Tilde'
    }
  }
}
