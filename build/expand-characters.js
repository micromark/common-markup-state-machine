var find = require('./mdast-util-find-and-replace')

module.exports = expandCharacters

var {characters, names} = init()

// .
// characters[0xfffd] = '�'
// names['�'] = 'Replacement character'

var conceptual = {
  VS: 'Virtual space',
  EOF: 'EOF',
  EOL: 'EOL'
}

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
      name = conceptual[c]

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
      'DEL',
      'PAD',
      'HOP',
      'BPH',
      'NBH',
      'IND',
      'NEL',
      'SSA',
      'ESA',
      'HTS',
      'HTJ',
      'LTS',
      'PLD',
      'PLU',
      'RI',
      'SS2',
      'SS3',
      'DCS',
      'PU1',
      'PU2',
      'STS',
      'CCH',
      'MW',
      'SPA',
      'EPA',
      'SOS',
      'SGCI',
      'SCI',
      'CSI',
      'ST',
      'OSC',
      'PM',
      'APC'
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
      '~': 'Tilde',
      PAD: 'Padding Character',
      HOP: 'High Octet Preset',
      BPH: 'Break Permitted Here',
      NBH: 'No Break Here',
      IND: 'Index',
      NEL: 'Next Line',
      SSA: 'Start of Selected Area',
      ESA: 'End of Selected Area',
      HTS: 'Character (Horizontal) Tabulation Set',
      HTJ: 'Character (Horizontal) Tabulation with Justification',
      LTS: 'Line (Vertical) Tabulation Set',
      PLD: 'Partial Line Forward (Down)',
      PLU: 'Partial Line Backward (Up)',
      RI: 'Reverse Line Feed (Index)',
      SS2: 'Single-Shift Two',
      SS3: 'Single-Shift Three',
      DCS: 'Device Control String',
      PU1: 'Private Use One',
      PU2: 'Private Use Two',
      STS: 'Set Transmit State',
      CCH: 'Cancel character',
      MW: 'Message Waiting',
      SPA: 'Start of Protected Area',
      EPA: 'End of Protected Area',
      SOS: 'Start of String',
      SGCI: 'Single Graphic Character Introducer',
      SCI: 'Single Character Introducer',
      CSI: 'Control Sequence Introducer',
      ST: 'String Terminator',
      OSC: 'Operating System Command',
      PM: 'Private Message',
      APC: 'Application Program Command'
    }
  }
}
