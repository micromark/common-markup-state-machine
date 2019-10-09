# CMSM

> Common markup state machine.

Together, the parsing rules described below define what is referred to as a
Common Markup parser.

> This document is currently in progress.
> Some parts are still in progress:
>
> *   Phrasing
> *   List items
> *   Stack of continuation (`>` and `␠␠` for blockquote and list items)
> *   Extensions
> *   How to turn tokens into [*Content token*][t-content]
> *   Character references in fenced code metadata
> *   How to group escape and entity/character references
>
> It is developed jointly with a reference parser:
> [`micromark`](https://github.com/micromark/micromark).
>
> Contributions are welcome.

## Table of contents

*   [1 Background](#1-background)
*   [2 Overview](#2-overview)
*   [3 Characters](#3-characters)
    *   [3.1 Conceptual characters](#31-conceptual-characters)
    *   [3.2 Tabs](#32-tabs)
    *   [3.3 Character groups](#33-character-groups)
*   [4 Preprocessing the input stream](#4-preprocessing-the-input-stream)
*   [5 State](#5-state)
*   [6 Actions](#6-actions)
    *   [6.1 Consuming](#61-consuming)
    *   [6.2 Queueing](#62-queueing)
    *   [6.3 Emitting](#63-emitting)
    *   [6.4 Opening](#64-opening)
    *   [6.5 Closing](#65-closing)
*   [7 Tokenization](#7-tokenization)
    *   [7.1 Initial state](#71-initial-state)
    *   [7.2 Initial whitespace state](#72-initial-whitespace-state)
    *   [7.3 Line ending state](#73-line-ending-state)
    *   [7.4 Carriage return state](#74-carriage-return-state)
    *   [7.5 In line state](#75-in-line-state)
    *   [7.6 ATX heading opening sequence state](#76-atx-heading-opening-sequence-state)
    *   [7.7 ATX heading opening sequence after state](#77-atx-heading-opening-sequence-after-state)
    *   [7.8 ATX heading content state](#78-atx-heading-content-state)
    *   [7.9 ATX heading whitespace state](#79-atx-heading-whitespace-state)
    *   [7.10 ATX heading number sign sequence state](#710-atx-heading-number-sign-sequence-state)
    *   [7.11 Asterisk line asterisk after state](#711-asterisk-line-asterisk-after-state)
    *   [7.12 Asterisk line whitespace state](#712-asterisk-line-whitespace-state)
    *   [7.13 HTML block open state](#713-html-block-open-state)
    *   [7.14 HTML block open markup declaration state](#714-html-block-open-markup-declaration-state)
    *   [7.15 HTML block open comment inside state](#715-html-block-open-comment-inside-state)
    *   [7.16 HTML block open character data inside state](#716-html-block-open-character-data-inside-state)
    *   [7.17 HTML block open tag name inside state](#717-html-block-open-tag-name-inside-state)
    *   [7.18 HTML block open simple self closing tag state](#718-html-block-open-simple-self-closing-tag-state)
    *   [7.19 HTML block open complete attribute before state](#719-html-block-open-complete-attribute-before-state)
    *   [7.20 HTML block open complete attribute name state](#720-html-block-open-complete-attribute-name-state)
    *   [7.21 HTML block open complete attribute name after state](#721-html-block-open-complete-attribute-name-after-state)
    *   [7.22 HTML block open complete attribute value before state](#722-html-block-open-complete-attribute-value-before-state)
    *   [7.23 HTML block open complete double quoted attribute value state](#723-html-block-open-complete-double-quoted-attribute-value-state)
    *   [7.24 HTML block open complete single quoted attribute value state](#724-html-block-open-complete-single-quoted-attribute-value-state)
    *   [7.25 HTML block open complete unquoted attribute value state](#725-html-block-open-complete-unquoted-attribute-value-state)
    *   [7.26 HTML block open complete self closing tag state](#726-html-block-open-complete-self-closing-tag-state)
    *   [7.27 HTML block open complete tag after state](#727-html-block-open-complete-tag-after-state)
    *   [7.28 HTML block continuation line state](#728-html-block-continuation-line-state)
    *   [7.29 HTML block continuation close tag state](#729-html-block-continuation-close-tag-state)
    *   [7.30 HTML block continuation close tag name inside state](#730-html-block-continuation-close-tag-name-inside-state)
    *   [7.31 HTML block continuation comment inside state](#731-html-block-continuation-comment-inside-state)
    *   [7.32 HTML block continuation character data inside state](#732-html-block-continuation-character-data-inside-state)
    *   [7.33 HTML block continuation declaration before state](#733-html-block-continuation-declaration-before-state)
    *   [7.34 HTML block close line state](#734-html-block-close-line-state)
    *   [7.35 Setext heading underline equals to sequence state](#735-setext-heading-underline-equals-to-sequence-state)
    *   [7.36 Setext heading underline equals to after state](#736-setext-heading-underline-equals-to-after-state)
    *   [7.37 Fenced code grave accent opening fence state](#737-fenced-code-grave-accent-opening-fence-state)
    *   [7.38 Fenced code grave accent opening fence whitespace state](#738-fenced-code-grave-accent-opening-fence-whitespace-state)
    *   [7.39 Fenced code grave accent opening fence metadata state](#739-fenced-code-grave-accent-opening-fence-metadata-state)
    *   [7.40 Fenced code tilde opening fence state](#740-fenced-code-tilde-opening-fence-state)
    *   [7.41 Fenced code tilde opening fence whitespace state](#741-fenced-code-tilde-opening-fence-whitespace-state)
    *   [7.42 Fenced code tilde opening fence metadata state](#742-fenced-code-tilde-opening-fence-metadata-state)
    *   [7.43 Fenced code continuation line state](#743-fenced-code-continuation-line-state)
    *   [7.44 Fenced code close sequence state](#744-fenced-code-close-sequence-state)
    *   [7.45 Fenced code close whitespace state](#745-fenced-code-close-whitespace-state)
    *   [7.46 Indented code line state](#746-indented-code-line-state)
    *   [7.47 Content continuation state](#747-content-continuation-state)
*   [8 Tokens](#8-tokens)
    *   [8.1 Whitespace token](#81-whitespace-token)
    *   [8.2 Line ending token](#82-line-ending-token)
    *   [8.3 End-of-file token](#83-end-of-file-token)
    *   [8.4 Marker token](#84-marker-token)
    *   [8.5 Sequence token](#85-sequence-token)
    *   [8.6 Content token](#86-content-token)
*   [9 Groups](#9-groups)
    *   [9.1 Blank line group](#91-blank-line-group)
    *   [9.2 ATX heading group](#92-atx-heading-group)
    *   [9.3 ATX heading fence group](#93-atx-heading-fence-group)
    *   [9.4 ATX heading content group](#94-atx-heading-content-group)
    *   [9.5 Thematic break group](#95-thematic-break-group)
    *   [9.6 HTML group](#96-html-group)
    *   [9.7 HTML line group](#97-html-line-group)
    *   [9.8 Indented code group](#98-indented-code-group)
    *   [9.9 Indented code line group](#99-indented-code-line-group)
    *   [9.10 Blockquote group](#910-blockquote-group)
    *   [9.11 Fenced code group](#911-fenced-code-group)
    *   [9.12 Fenced code fence group](#912-fenced-code-fence-group)
    *   [9.13 Fenced code language group](#913-fenced-code-language-group)
    *   [9.14 Fenced code metadata group](#914-fenced-code-metadata-group)
    *   [9.15 Fenced code line group](#915-fenced-code-line-group)
    *   [9.16 Content group](#916-content-group)
    *   [9.17 Content line group](#917-content-line-group)
    *   [9.18 Setext heading group](#918-setext-heading-group)
    *   [9.19 Setext heading content group](#919-setext-heading-content-group)
    *   [9.20 Setext heading underline group](#920-setext-heading-underline-group)
    *   [9.21 Definition group](#921-definition-group)
    *   [9.22 Definition label group](#922-definition-label-group)
    *   [9.23 Definition label content group](#923-definition-label-content-group)
    *   [9.24 Definition destination quoted group](#924-definition-destination-quoted-group)
    *   [9.25 Definition destination unquoted group](#925-definition-destination-unquoted-group)
    *   [9.26 Definition title group](#926-definition-title-group)
    *   [9.27 Paragraph group](#927-paragraph-group)
*   [10 Processing](#10-processing)
    *   [10.1 Process as an ATX heading](#101-process-as-an-atx-heading)
    *   [10.2 Process as a Setext primary heading](#102-process-as-a-setext-primary-heading)
    *   [10.3 Process as an asterisk line](#103-process-as-an-asterisk-line)
    *   [10.4 Process as an asterisk line opening](#104-process-as-an-asterisk-line-opening)
    *   [10.5 Process as a Fenced code fence](#105-process-as-a-fenced-code-fence)
    *   [10.6 Process as Content](#106-process-as-content)
    *   [10.7 Process as Definitions](#107-process-as-definitions)
    *   [10.8 Process as a Paragraph](#108-process-as-a-paragraph)
    *   [10.9 Process as a String](#109-process-as-a-string)
    *   [10.10 Process as Phrasing](#1010-process-as-phrasing)
*   [11 WIP](#11-wip)
*   [12 References](#12-references)
*   [13 Appendix](#13-appendix)
    *   [13.1 Raw tags](#131-raw-tags)
    *   [13.2 Simple tags](#132-simple-tags)
    *   [13.3 Control replacements](#133-control-replacements)
    *   [13.4 Named character references](#134-named-character-references)
*   [14 Acknowledgments](#14-acknowledgments)
*   [15 License](#15-license)

## 1 Background

The common markup parser parses a markup language that is commonly known as
*Markdown*.

The first definition of this format gave several examples of how it worked,
showing input Markdown and output HTML, and came with a reference implementation
(known as Markdown.pl).
When new implementations followed, they mostly followed the first definition,
but deviated from the first implementation, thus making *Markdown* a family of
formats.

Some years later, an attempt was made to standardize the differences between the
Markdown implementations, by specifying how several edge cases should be
handled, through more input and output examples.
This attempt is known as CommonMark, and many implementations follow it.

This document defines a more formal format, based on CommonMark, by documenting
how to parse it, instead of documenting input and output examples.
This format is:

*   **strict**, as it defines a state machine, which leaves significantly less
    room for interpretation
*   **agnostic** of HTML, as it does not show examples of output, which lets
    the format be used in new ways
*   **streaming**, because coupling with HTML is what requires a whole stream to
    be buffered as references can resolve to later definitions
*   **complete**, as it defines different types of tokens and how they are
    grouped, which allows the format to be represented as a concrete syntax tree

The origin story of Markdown is similar to that of HTML, which at a time was
also a family of formats.
Through incredible efforts of the WHATWG, a Living Standard was created on how
to parse the format, by defining a state machine.

## 2 Overview

The common markup parser receives input, typically coming over the network or
from the local file system.
Depending on a character in the input stream, certain side effects occur, such
as that a new token is created, or one state is switched to another.
Each line is made up of tokens, such as whitespace, markers, sequences, and
content, that are queued.
At a certain point in a line, it is known what to do with the queue, which has
more effects: groups are closed, opened, or tokens are changed, for example
because it is known that a punctuation marker should be treated as content.
In some cases, it is not known what to do with a line until a certain point in a
later line.
One such exception is [*Content group*][g-content], which spans an arbitrary number of lines, and
can result in zero or more definitions, and optionally either a paragraph or a
Setext heading.

## 3 Characters

A character is a Unicode code point and is represented as a four to six digit
hexadecimal number, prefixed with `U+` (**\[UNICODE]**).

### 3.1 Conceptual characters

An <a id="ceof" href="#ceof">**EOF**</a> character is a conceptual character representing the end of the
input.

A <a id="cvs" href="#cvs">**VIRTUAL SPACE**</a> character is a conceptual character representing an expanded column
size of a U+0009 CHARACTER TABULATION (HT).

EOF and VIRTUAL SPACE are not real characters, but rather represent the lack of any
further characters, or a character increase the size of a character.

### 3.2 Tabs

Tabs (U+0009 CHARACTER TABULATION (HT)) are typically not expanded into spaces, but do behave as if they
were replaced by spaces with a tab stop of 4 characters.
These character increments are represented by a [VIRTUAL SPACE][cvs] characters.

Say we’d have the following markup (where `␉` represent a tab):

```markdown
>␉␉a
```

This is represented by the characters: U+003E GREATER THAN (`>`), U+0009 CHARACTER TABULATION (HT), VIRTUAL SPACE, VIRTUAL SPACE, U+0009 CHARACTER TABULATION (HT), VIRTUAL SPACE, VIRTUAL SPACE,
VIRTUAL SPACE, and U+0061 (`a`).

When transforming to an output format, tab characters that are not part of
syntax, should be present in the output format.
When the tab itself (and zero or more VIRTUAL SPACE characters) are part of syntax, but
some VIRTUAL SPACE characters are not, the remaining VIRTUAL SPACE characters should be considered
a prefix of the content.

### 3.3 Character groups

An <a id="ascii-digit" href="#ascii-digit">**ASCII digit**</a> is a character in the range U+0030 (`0`) to U+0039 (`9`), inclusive.

An <a id="ascii-upper-hex-digit" href="#ascii-upper-hex-digit">**ASCII upper hex digit**</a> is an [ASCII digit][ascii-digit] or a character in the range
U+0041 (`A`) to U+0046 (`F`), inclusive.

An <a id="ascii-lower-hex-digit" href="#ascii-lower-hex-digit">**ASCII lower hex digit**</a> is an [ASCII digit][ascii-digit] or a character in the range
U+0061 (`a`) to U+0066 (`f`), inclusive.

An <a id="ascii-hex-digit" href="#ascii-hex-digit">**ASCII hex digit**</a> is an [ASCII upper hex digit][ascii-upper-hex-digit] or an [ASCII lower hex
digit][ascii-lower-hex-digit]

An <a id="ascii-upper-alpha" href="#ascii-upper-alpha">**ASCII upper alpha**</a> is a character in the range U+0041 (`A`) to U+005A (`Z`), inclusive.

An <a id="ascii-lower-alpha" href="#ascii-lower-alpha">**ASCII lower alpha**</a> is a character in the range U+0061 (`a`) to U+007A (`z`), inclusive.

An <a id="ascii-alpha" href="#ascii-alpha">**ASCII alpha**</a> is an [ASCII upper alpha][ascii-upper-alpha] or [ASCII lower alpha][ascii-lower-alpha].

An <a id="ascii-alphanumeric" href="#ascii-alphanumeric">**ASCII alphanumeric**</a> is an [ASCII digit][ascii-digit] or [ASCII alpha][ascii-alpha].

An <a id="ascii-punctuation" href="#ascii-punctuation">**ASCII punctuation**</a> is a character in the ranges U+0021 EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`) to U+0040 AT SIGN (`@`),
U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`), inclusive.

An <a id="ascii-control" href="#ascii-control">**ASCII control**</a> is a character in the range U+0000 NULL (NUL) to U+001F (US), inclusive, or
U+007F (DEL).

To <a id="ascii-lowercase" href="#ascii-lowercase">**ASCII-lowercase**</a> a character, is to increase it by 0x20 if it is in the
range U+0041 (`A`) to U+005A (`Z`), inclusive.

A <a id="unicode-whitespace" href="#unicode-whitespace">**Unicode whitespace**</a> is a character in the Unicode `Zs` (Separator, Space)
category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF), U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).

A <a id="unicode-punctuation" href="#unicode-punctuation">**Unicode punctuation**</a> is a character in the Unicode `Pc` (Punctuation,
Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
(Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
(Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an [ASCII
punctuation][ascii-punctuation] (**\[UNICODE]**).

A <a id="surrogate" href="#surrogate">**surrogate**</a> is a character that is in the range U+D800 to U+DFFF,
inclusive.

A <a id="noncharacter" href="#noncharacter">**noncharacter**</a> is a character that is in the range U+FDD0 to U+FDEF,
inclusive, or U+FFFE, U+FFFF, U+1FFFE, U+1FFFF, U+2FFFE, U+2FFFF, U+3FFFE,
U+3FFFF, U+4FFFE, U+4FFFF, U+5FFFE, U+5FFFF, U+6FFFE, U+6FFFF, U+7FFFE, U+7FFFF,
U+8FFFE, U+8FFFF, U+9FFFE, U+9FFFF, U+AFFFE, U+AFFFF, U+BFFFE, U+BFFFF, U+CFFFE,
U+CFFFF, U+DFFFE, U+DFFFF, U+EFFFE, U+EFFFF, U+FFFFE, U+FFFFF, U+10FFFE, or
U+10FFFF.

> ❗️ Todo:
>
> *   [Unicode whitespace][unicode-whitespace] and [Unicode punctuation][unicode-punctuation] are used by emphasis
>     and importance
> *   [ASCII upper hex digit][ascii-upper-hex-digit], [ASCII lower hex digit][ascii-lower-hex-digit], and [ASCII hex
>     digit][ascii-hex-digit] are used by character references
> *   [Surrogate][surrogate] and [noncharacter][noncharacter] are used by invalid numeric character
>     references in HTML, CM does not define them

## 4 Preprocessing the input stream

The <a id="input-stream" href="#input-stream">**input stream**</a> consists of the characters pushed into it.

The <a id="input-character" href="#input-character">**input character**</a> is the first character in the [input stream][input-stream] that has
not yet been consumed.
Initially, the input character is the first character in the input.
Finally, if all character are consumed, the input character is a [EOF][ceof].

Any occurrences of U+0009 CHARACTER TABULATION (HT) in the [input stream][input-stream] is represented by that character
and 0-3 [VIRTUAL SPACE][cvs] characters.

## 5 State

Initially, the <a id="stack-of-open-groups" href="#stack-of-open-groups">**stack of open groups**</a> is empty.
The stack grows downwards; the topmost group on the stack is the first one
opened, and the bottommost group of the stack is the last group still open.

The <a id="current-group" href="#current-group">**current group**</a> is the bottommost group in this [stack of open groups][stack-of-open-groups].

The <a id="queue" href="#queue">**queue**</a> is a list of tokens.
The <a id="current-token" href="#current-token">**current token**</a> is the last token in the [queue][queue].

## 6 Actions

### 6.1 Consuming

To consume the [input character][input-character] affects the [current token][current-token].
Due to the nature of the state machine, it is not possible to consume if there
is no current token.
To consume the input character, first run the following steps based on the
type of the token:

*   ↪ **[*Marker token*][t-marker]**

    Set the marker to the [input character][input-character]
*   ↪ **[*Sequence token*][t-sequence]**

    Increment the size of the token.
    If the token has no marker, set the marker to the [input character][input-character]
*   ↪ **[*Whitespace token*][t-whitespace]**

    Increment the size of the token.
    Add the current [input character][input-character] to the token’s list of characters
*   ↪ **Anything else**

    Do nothing

### 6.2 Queueing

To queue a token is to add it to the [queue][queue].

Queueing tokens may have side effects, based on the type of the token, and given
labelled parameters:

*   ↪ **[*Whitespace token*][t-whitespace]**

    Set the size and used size of the token to zero (0).
    Set the list of characters of the token to an empty list.
    If a used size is given, set the used size of the token to the given value
*   ↪ **[*Sequence token*][t-sequence]**

    Set the size of the token to zero (0)
*   ↪ **[*Content token*][t-content]**

    Set the prefix of the token to the empty string.
    If characters are given, perform the following steps:

    *   Let `seen` be `false`
    *   For each `character` of the given characters:

        *   ↪ **U+0009 CHARACTER TABULATION (HT)**

            Append `character` to the prefix, let `seen` be `true`
        *   ↪ **U+0020 SPACE (SP)**

            Append `character` to the prefix
        *   ↪ **[VIRTUAL SPACE][cvs]**

            *   If `seen` is `true`, do nothing
            *   Otherwise, append a U+0020 SPACE (SP) character to the prefix
*   ↪ **Anything else**

    Do nothing

### 6.3 Emitting

To emit a token is to add it to the [current group][current-group].
It is possible to emit a token directly, but it is more common to emit the
tokens the [queue][queue].
The queue is cleared after emitting.
Emitting tokens may have side effects, based on their types:

*   ↪ **[*End-of-file token*][t-end-of-file]**

    Close all groups in the [stack of open groups][stack-of-open-groups], by repeatedly closing the
    [current group][current-group]) while there is one
*   ↪ **Anything else**

    Do nothing

### 6.4 Opening

To open a group is to add it to the [current group][current-group] and the [stack of open
groups][stack-of-open-groups].
Opening groups may have side effects, based on their type:

*   ↪ **[*Blank line group*][g-blank-line]**

    If the [current group][current-group] is a [*Content group*][g-content], or an [*HTML group*][g-html] of kind `6` or `7`,
    close it.

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[*ATX heading group*][g-atx-heading]**\
    ↪ **[*Fenced code group*][g-fenced-code]**\
    ↪ **[*HTML group*][g-html]**\
    ↪ **[*Thematic break group*][g-thematic-break]**

    If the [current group][current-group] is a [*Content group*][g-content] or a [*Indented code group*][g-indented-code], close it.

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Do nothing

### 6.5 Closing

To close a group is to continue on in its parent group and to pop it off the
[stack of open groups][stack-of-open-groups].
Closing groups may have side effects, based on their type:

*   ↪ **[*Content group*][g-content]**

    [Process as Content][process-as-content] without a hint
*   ↪ **Anything else**

    Do nothing

## 7 Tokenization

Implementations must act as if they use the following state machine to tokenize
common markup.
The state machine must start in the [*Initial state*][s-initial].
Most states consume a single character, which may have various side effects, and
either switch the state machine to a new state to reconsume the [input
character][input-character], or switch it to a new state to consume the next character, or
stays in the same state to consume the next character.

The exact behavior of certain states depends on state, such as the [stack of
open groups][stack-of-open-groups] and the [queue][queue].

### 7.1 Initial state

*   ↪ **[EOF][ceof]**

    Queue a [*End-of-file token*][t-end-of-file] and emit
*   ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Blank line group*][g-blank-line], close, and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Queue a [*Whitespace token*][t-whitespace], consume, and switch to the [*Initial whitespace state*][s-initial-whitespace]
*   ↪ **Anything else**

    Reconsume in the [*In line state*][s-in-line]

### 7.2 Initial whitespace state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Blank line group*][g-blank-line], emit, close, and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **Anything else**

    Reconsume in the [*In line state*][s-in-line]

### 7.3 Line ending state

*   ↪ **[EOF][ceof]**

    Queue a [*End-of-file token*][t-end-of-file] and emit
*   ↪ **U+000A LINE FEED (LF)**

    Queue a [*Line ending token*][t-line-ending], consume, emit, and switch to the [*Initial state*][s-initial]
*   ↪ **U+000D CARRIAGE RETURN (CR)**

    Queue a [*Line ending token*][t-line-ending], consume, and switch to the [*Carriage return state*][s-carriage-return]
*   ↪ **Anything else**

    > ❗️ Note: Impossible!

    Reconsume in the [*Initial state*][s-initial]

### 7.4 Carriage return state

*   ↪ **U+000A LINE FEED (LF)**

    Consume, emit, and switch to the [*Initial state*][s-initial]
*   ↪ **Anything else**

    Emit and reconsume in the [*Initial state*][s-initial]

### 7.5 In line state

If the [stack of continuation][stack-of-continuation] matches all open groups:

*   And if the [current group][current-group] is an [*HTML group*][g-html], queue a [*Content token*][t-content] with the unused
    characters of the previous [*Whitespace token*][t-whitespace] if there is one, and reconsume in
    the [*HTML block continuation line state*][s-html-block-continuation-line]
*   And otherwise, if the [current group][current-group] is a [*Fenced code group*][g-fenced-code], and either the
    [current token][current-token] is not a [*Whitespace token*][t-whitespace], or it is a [*Whitespace token*][t-whitespace] and its
    unused size is less than four (4), and the [input character][input-character] is the
    [current group][current-group]’s marker, queue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code close sequence state*][s-fenced-code-close-sequence]
*   And otherwise, if the [current group][current-group] is a [*Fenced code group*][g-fenced-code], queue a
    [*Content token*][t-content] with the unused characters of the previous [*Whitespace token*][t-whitespace] if there
    is one, consume, and switch to the [*Fenced code continuation line state*][s-fenced-code-continuation-line].

Otherwise, if the [current group][current-group] is not a [*Content group*][g-content], the previous token is a
[*Whitespace token*][t-whitespace], and its unused size is greater than or equal to four (4), add four
to the previous token’s used size, queue a [*Content token*][t-content] with the unused characters
of the previous [*Whitespace token*][t-whitespace], consume, and switch to the [*Indented code line state*][s-indented-code-line].

Otherwise, perform the following steps based on the [input character][input-character]:

*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Queue a [*Sequence token*][t-sequence], consume, and switch to the
    [*ATX heading opening sequence state*][s-atx-heading-opening-sequence]
*   ↪ **U+002A ASTERISK (`*`)**

    Queue a [*Marker token*][t-marker], consume, and switch to the [*Asterisk line asterisk after state*][s-asterisk-line-asterisk-after]
*   ↪ **U+002B PLUS SIGN (`+`)**

    > ❗️ Todo: Could be a list item or content
*   ↪ **U+002D DASH (`-`)**

    > ❗️ Todo: Could be a list item, thematic break, setext underline secondary,
    > or content
*   ↪ **[ASCII digit][ascii-digit]**

    > ❗️ Todo: Could be a list item or content
*   ↪ **U+003C LESS THAN (`<`)**

    Queue a [*Content token*][t-content] with the unused characters of the previous [*Whitespace token*][t-whitespace] if
    there is one, consume, and switch to the [*HTML block open state*][s-html-block-open]
*   ↪ **U+003D EQUALS TO (`=`)**

    If the [current group][current-group] is a [*Content group*][g-content], queue a [*Sequence token*][t-sequence], consume, and
    switch to the [*Setext heading underline equals to sequence state*][s-setext-heading-underline-equals-to-sequence].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    Open a [*Blockquote group*][g-blockquote], consume, emit, and switch to the [*Initial state*][s-initial]
*   ↪ **U+005F UNDERSCORE (`_`)**

    > ❗️ Todo: Could be a thematic break or content
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Queue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code grave accent opening fence state*][s-fenced-code-grave-accent-opening-fence]
*   ↪ **U+007E TILDE (`~`)**

    Queue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code tilde opening fence state*][s-fenced-code-tilde-opening-fence]
*   ↪ **Anything else**

    Otherwise, queue a [*Content token*][t-content] with the unused characters of the previous
    [*Whitespace token*][t-whitespace] if there is one, consume, and switch to the
    [*Content continuation state*][s-content-continuation]

### 7.6 ATX heading opening sequence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open an [*ATX heading group*][g-atx-heading], open an [*ATX heading fence group*][g-atx-heading-fence], emit, close twice, and
    reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Queue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*ATX heading opening sequence after state*][s-atx-heading-opening-sequence-after]
*   ↪ **U+0023 NUMBER SIGN (`#`)**

    If the current token’s size is less than six (6), consume.

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Change the [current token][current-token] into a [*Content token*][t-content], consume, and switch to the
    [*Content continuation state*][s-content-continuation]

### 7.7 ATX heading opening sequence after state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open an [*ATX heading group*][g-atx-heading], open an [*ATX heading fence group*][g-atx-heading-fence], emit, close twice, and
    reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Open an [*ATX heading group*][g-atx-heading], open an [*ATX heading fence group*][g-atx-heading-fence], emit, close, queue a
    [*Sequence token*][t-sequence], consume, and switch to the [*ATX heading number sign sequence state*][s-atx-heading-number-sign-sequence]
*   ↪ **Anything else**

    Open an [*ATX heading group*][g-atx-heading], open an [*ATX heading fence group*][g-atx-heading-fence], emit, close, queue a
    [*Content token*][t-content], consume, and switch to the [*ATX heading content state*][s-atx-heading-content]

### 7.8 ATX heading content state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an ATX heading][process-as-an-atx-heading] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Queue a [*Whitespace token*][t-whitespace], consume, and switch to the [*ATX heading whitespace state*][s-atx-heading-whitespace]
*   ↪ **Anything else**

    Consume

### 7.9 ATX heading whitespace state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an ATX heading][process-as-an-atx-heading] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Queue a [*Sequence token*][t-sequence], consume, and switch to the
    [*ATX heading number sign sequence state*][s-atx-heading-number-sign-sequence]
*   ↪ **Anything else**

    Queue a [*Content token*][t-content], consume, and switch to the [*ATX heading content state*][s-atx-heading-content]

### 7.10 ATX heading number sign sequence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an ATX heading][process-as-an-atx-heading] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Queue a [*Whitespace token*][t-whitespace], consume, and switch to the [*ATX heading whitespace state*][s-atx-heading-whitespace]
*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Consume
*   ↪ **Anything else**

    Queue a [*Content token*][t-content], consume, and switch to the [*ATX heading content state*][s-atx-heading-content]

### 7.11 Asterisk line asterisk after state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an Asterisk line][process-as-an-asterisk-line] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Queue a [*Whitespace token*][t-whitespace], consume, and switch to the [*Asterisk line whitespace state*][s-asterisk-line-whitespace]
*   ↪ **U+002A ASTERISK (`*`)**

    Queue a [*Marker token*][t-marker] and consume
*   ↪ **Anything else**

    > ❗️ Todo: handle the input character, reconsume somewhere.

    [Process as an Asterisk line opening][process-as-an-asterisk-line-opening].

### 7.12 Asterisk line whitespace state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an Asterisk line][process-as-an-asterisk-line] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+002A ASTERISK (`*`)**

    Queue a [*Marker token*][t-marker], consume, and switch to the [*Asterisk line asterisk after state*][s-asterisk-line-asterisk-after]
*   ↪ **Anything else**

    > ❗️ Todo: handle the input character, reconsume somewhere.

    [Process as an Asterisk line opening][process-as-an-asterisk-line-opening].

### 7.13 HTML block open state

*   ↪ **U+0021 EXCLAMATION MARK (`!`)**

    Consume and switch to the [*HTML block open markup declaration state*][s-html-block-open-markup-declaration]
*   ↪ **U+002F SLASH (`/`)**

    > ❗️ Bug: this allows tag names to start with `-` and numbers, we need a
    > state between these two.
    >
    > ❗️ Todo: Define shared space: `endTag`

    Let `endTag` be `true`, consume, and switch to the
    [*HTML block open tag name inside state*][s-html-block-open-tag-name-inside]
*   ↪ **U+003F QUESTION MARK (`?`)**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `3`, open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation declaration before state*][s-html-block-continuation-declaration-before]
*   ↪ **[ASCII alpha][ascii-alpha]**

    > ❗️ Todo: Define shared space: `tagName`

    Append the [ASCII-lowercase][ascii-lowercase]d character to `tagName`, consume, and switch
    to the [*HTML block open tag name inside state*][s-html-block-open-tag-name-inside]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.14 HTML block open markup declaration state

*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML block open comment inside state*][s-html-block-open-comment-inside]
*   ↪ **[ASCII upper alpha][ascii-upper-alpha]**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `4`, open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation line state*][s-html-block-continuation-line]
*   ↪ **U+005B LEFT SQUARE BRACKET (`[`)**

    Consume and switch to the [*HTML block open character data inside state*][s-html-block-open-character-data-inside]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.15 HTML block open comment inside state

*   ↪ **U+002D DASH (`-`)**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `2`, open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation declaration before state*][s-html-block-continuation-declaration-before]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.16 HTML block open character data inside state

If the next few characters are:

*   ↪ **`[CDATA[` (the five upper letters “CDATA” with a U+005B LEFT SQUARE BRACKET (`[`) before and
    after)**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `5`, open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation line state*][s-html-block-continuation-line]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.17 HTML block open tag name inside state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    > ❗️ Todo: Define shared space: `tagName`, `endTag`, `kind`

    If `tagName` is a [raw tag][raw-tag] and `endTag` is not `true`, let `kind` be `1`,
    open an [*HTML group*][g-html], and reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line].

    Otherwise, if `tagName` is a [simple tag][simple-tag], let `kind` be `6`, open an
    [*HTML group*][g-html], and reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+002D DASH (`-`)**\
    ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    > ❗️ Todo: Define shared space: `tagName`

    Append the [ASCII-lowercase][ascii-lowercase]d character to `tagName` and consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    > ❗️ Todo: Define shared space: `tagName`, `endTag`, `kind`

    If `tagName` is a [raw tag][raw-tag] and `endTag` is not `true`, let `kind` be `1`,
    open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation line state*][s-html-block-continuation-line].

    Otherwise, if `tagName` is not a [raw tag][raw-tag], and the [current group][current-group] is
    not a [*Content group*][g-content], consume, and switch to the
    [*HTML block open complete attribute before state*][s-html-block-open-complete-attribute-before].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+002F SLASH (`/`)**

    > ❗️ Todo: Define shared space: `tagName`, `endTag`

    If `tagName` is a [simple tag][simple-tag], consume, and switch to the
    [*HTML block open simple self closing tag state*][s-html-block-open-simple-self-closing-tag].

    Otherwise, if `tagName` is not a [simple tag][simple-tag], `endTag` is not `true`, and
    the [current group][current-group] is not a [*Content group*][g-content], consume, and switch to the
    [*HTML block open complete self closing tag state*][s-html-block-open-complete-self-closing-tag].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    > ❗️ Todo: Define shared space: `tagName`, `endTag`, `kind`

    If `tagName` is a [raw tag][raw-tag] and `endTag` is not `true`, let `kind` be `1`,
    open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation line state*][s-html-block-continuation-line].

    Otherwise, if `tagName` is a [simple tag][simple-tag], let `kind` be `6`, open an
    [*HTML group*][g-html], and reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line].

    Otherwise, if `tagName` is not a [raw tag][raw-tag], and the [current group][current-group] is
    not a [*Content group*][g-content], consume, and switch to the
    [*HTML block open complete tag after state*][s-html-block-open-complete-tag-after].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.18 HTML block open simple self closing tag state

*   ↪ **U+003E GREATER THAN (`>`)**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `6`, open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation line state*][s-html-block-continuation-line]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.19 HTML block open complete attribute before state

*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    > ❗️ Todo: Define shared space: `endTag`

    If `endTag` is not `true`, consume, and switch to the
    [*HTML block open complete self closing tag state*][s-html-block-open-complete-self-closing-tag].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003A COLON (`:`)**\
    ↪ **[ASCII alpha][ascii-alpha]**\
    ↪ **U+005F UNDERSCORE (`_`)**

    > ❗️ Todo: Define shared space: `endTag`

    If `endTag` is not `true`, consume, and switch to the
    [*HTML block open complete attribute name state*][s-html-block-open-complete-attribute-name].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `7`, open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation line state*][s-html-block-continuation-line]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.20 HTML block open complete attribute name state

*   ↪ **U+002D DASH (`-`)**\
    ↪ **U+002E DOT (`.`)**\
    ↪ **U+003A COLON (`:`)**\
    ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+005F UNDERSCORE (`_`)**

    Consume
*   ↪ **Anything else**

    Reconsume in the [*HTML block open complete attribute name after state*][s-html-block-open-complete-attribute-name-after]

### 7.21 HTML block open complete attribute name after state

*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    > ❗️ Todo: Define shared space: `endTag`

    If `endTag` is not `true`, consume, and switch to the
    [*HTML block open complete self closing tag state*][s-html-block-open-complete-self-closing-tag].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003D EQUALS TO (`=`)**

    Consume and switch to the [*HTML block open complete attribute value before state*][s-html-block-open-complete-attribute-value-before]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*HTML block open complete tag after state*][s-html-block-open-complete-tag-after]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.22 HTML block open complete attribute value before state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**\
    ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003D EQUALS TO (`=`)**\
    ↪ **U+003E GREATER THAN (`>`)**\
    ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Consume and switch to the
    [*HTML block open complete double quoted attribute value state*][s-html-block-open-complete-double-quoted-attribute-value]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Consume and switch to the
    [*HTML block open complete single quoted attribute value state*][s-html-block-open-complete-single-quoted-attribute-value]
*   ↪ **Anything else**

    Consume and switch to the
    [*HTML block open complete unquoted attribute value state*][s-html-block-open-complete-unquoted-attribute-value]

### 7.23 HTML block open complete double quoted attribute value state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Consume and switch to the [*HTML block open complete attribute before state*][s-html-block-open-complete-attribute-before]
*   ↪ **Anything else**

    Consume

### 7.24 HTML block open complete single quoted attribute value state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Consume and switch to the [*HTML block open complete attribute before state*][s-html-block-open-complete-attribute-before]
*   ↪ **Anything else**

    Consume

### 7.25 HTML block open complete unquoted attribute value state

*   ↪ **[EOF][ceof]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **U+0022 QUOTATION MARK (`"`)**\
    ↪ **U+0027 APOSTROPHE (`'`)**\
    ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003D EQUALS TO (`=`)**\
    ↪ **U+003E GREATER THAN (`>`)**\
    ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Reconsume in the [*HTML block open complete attribute name after state*][s-html-block-open-complete-attribute-name-after]
*   ↪ **Anything else**

    Consume

### 7.26 HTML block open complete self closing tag state

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*HTML block open complete tag after state*][s-html-block-open-complete-tag-after]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.27 HTML block open complete tag after state

*   ↪ **[EOF][ceof]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**\
    ↪ **U+0020 SPACE (SP)**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `7`, open an [*HTML group*][g-html], and reconsume in the
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 7.28 HTML block continuation line state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open an [*HTML line group*][g-html-line], emit, close, and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+002D DASH (`-`)**

    > ❗️ Todo: Define shared space: `kind`

    If `kind` is `7`, consume, and switch to the
    [*HTML block continuation comment inside state*][s-html-block-continuation-comment-inside].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003C LESS THAN (`<`)**

    > ❗️ Todo: Define shared space: `kind`

    If `kind` is `1`, consume, and switch to the
    [*HTML block continuation close tag state*][s-html-block-continuation-close-tag].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    > ❗️ Todo: Define shared space: `kind`

    If `kind` is `4`, consume, and switch to the
    [*HTML block close line state*][s-html-block-close-line].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003F QUESTION MARK (`?`)**

    > ❗️ Todo: Define shared space: `kind`

    If `kind` is `3`, consume, and switch to the
    [*HTML block continuation declaration before state*][s-html-block-continuation-declaration-before].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    > ❗️ Todo: Define shared space: `kind`

    If `kind` is `5`, consume, and switch to the
    [*HTML block continuation character data inside state*][s-html-block-continuation-character-data-inside].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Consume

### 7.29 HTML block continuation close tag state

*   ↪ **U+002F SLASH (`/`)**

    Consume and switch to the [*HTML block continuation close tag name inside state*][s-html-block-continuation-close-tag-name-inside]
*   ↪ **Anything else**

    Reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]

### 7.30 HTML block continuation close tag name inside state

*   ↪ **[ASCII alpha][ascii-alpha]**

    > ❗️ Todo: Define shared space: `tagName`

    Append the [ASCII-lowercase][ascii-lowercase]d character to `tagName` and consume
*   ↪ **U+003E GREATER THAN (`>`)**

    > ❗️ Todo: Define shared space: `tagName`

    If `tagName` is a [raw tag][raw-tag], consume, and switch to the
    [*HTML block close line state*][s-html-block-close-line].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]

### 7.31 HTML block continuation comment inside state

*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML block continuation declaration before state*][s-html-block-continuation-declaration-before]
*   ↪ **Anything else**

    Reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]

### 7.32 HTML block continuation character data inside state

*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Consume and switch to the [*HTML block continuation declaration before state*][s-html-block-continuation-declaration-before]
*   ↪ **Anything else**

    Reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]

### 7.33 HTML block continuation declaration before state

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*HTML block close line state*][s-html-block-close-line]
*   ↪ **Anything else**

    Reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]

### 7.34 HTML block close line state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open an [*HTML line group*][g-html-line], emit, close twice, and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **Anything else**

    Consume

### 7.35 Setext heading underline equals to sequence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as a Setext primary heading][process-as-a-setext-primary-heading] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+003D EQUALS TO (`=`)**

    Consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Queue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Setext heading underline equals to after state*][s-setext-heading-underline-equals-to-after]
*   ↪ **Anything else**

    Turn the [current token][current-token] into a [*Content token*][t-content], consume, and switch to the
    [*Content continuation state*][s-content-continuation]

### 7.36 Setext heading underline equals to after state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as a Setext primary heading][process-as-a-setext-primary-heading] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **Anything else**

    Turn the previous and  [current token][current-token] into a [*Content token*][t-content], consume, and
    switch to the [*Content continuation state*][s-content-continuation]

### 7.37 Fenced code grave accent opening fence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    If the [current token][current-token]’s size is greater than or equal to three (3),
    Open a [*Fenced code group*][g-fenced-code], [process as a Fenced code fence][process-as-a-fenced-code-fence] and reconsume in
    the [*Line ending state*][s-line-ending]

    Otherwise, this is not fenced code.
    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Content continuation state*][s-content-continuation]
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    If the [current token][current-token]’s size is greater than or equal to three (3), queue
    a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code grave accent opening fence whitespace state*][s-fenced-code-grave-accent-opening-fence-whitespace]

    Otherwise, this is not fenced code.
    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Content continuation state*][s-content-continuation]
*   ↪ **Anything else**

    If the [current token][current-token]’s size is greater than or equal to three (3), queue
    a [*Content token*][t-content], consume, and switch to the
    [*Fenced code grave accent opening fence metadata state*][s-fenced-code-grave-accent-opening-fence-metadata]

    Otherwise, this is not fenced code.
    Turn the queue, except for the first token if it is a [*Whitespace token*][t-whitespace], into a
    [*Content token*][t-content] and reconsume in the [*Content continuation state*][s-content-continuation]

### 7.38 Fenced code grave accent opening fence whitespace state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Fenced code group*][g-fenced-code], [process as a Fenced code fence][process-as-a-fenced-code-fence] and reconsume in
    the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    This is not fenced code.
    Turn the queue, except for the first token if it is a [*Whitespace token*][t-whitespace], into a
    [*Content token*][t-content] and reconsume in the [*Content continuation state*][s-content-continuation]
*   ↪ **Anything else**

    Queue a [*Content token*][t-content], consume, and switch to the
    [*Fenced code grave accent opening fence metadata state*][s-fenced-code-grave-accent-opening-fence-metadata]

### 7.39 Fenced code grave accent opening fence metadata state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Fenced code group*][g-fenced-code], [process as a Fenced code fence][process-as-a-fenced-code-fence] and reconsume in
    the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Queue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code grave accent opening fence whitespace state*][s-fenced-code-grave-accent-opening-fence-whitespace]
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    This is not fenced code.
    Turn the queue, except for the first token if it is a [*Whitespace token*][t-whitespace], into a
    [*Content token*][t-content] and reconsume in the [*Content continuation state*][s-content-continuation]
*   ↪ **Anything else**

    Consume

### 7.40 Fenced code tilde opening fence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    If the [current token][current-token]’s size is greater than or equal to three (3), open
    a [*Fenced code group*][g-fenced-code], [process as a Fenced code fence][process-as-a-fenced-code-fence] and reconsume in the
    [*Line ending state*][s-line-ending]

    Otherwise, this is not fenced code.
    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Content continuation state*][s-content-continuation]
*   ↪ **U+007E TILDE (`~`)**

    Consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    If the [current token][current-token]’s size is greater than or equal to three (3), queue
    a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code tilde opening fence whitespace state*][s-fenced-code-tilde-opening-fence-whitespace]

    Otherwise, this is not fenced code.
    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Content continuation state*][s-content-continuation]
*   ↪ **Anything else**

    If the [current token][current-token]’s size is greater than or equal to three (3), queue
    a [*Content token*][t-content], consume, and switch to the
    [*Fenced code tilde opening fence metadata state*][s-fenced-code-tilde-opening-fence-metadata]

    Otherwise, this is not fenced code.
    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Content continuation state*][s-content-continuation]

### 7.41 Fenced code tilde opening fence whitespace state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Fenced code group*][g-fenced-code], [process as a Fenced code fence][process-as-a-fenced-code-fence] and reconsume in
    the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **Anything else**

    Queue a [*Content token*][t-content], consume, and switch to the
    [*Fenced code tilde opening fence metadata state*][s-fenced-code-tilde-opening-fence-metadata]

### 7.42 Fenced code tilde opening fence metadata state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Fenced code group*][g-fenced-code], [process as a Fenced code fence][process-as-a-fenced-code-fence] and reconsume in
    the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Queue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code tilde opening fence whitespace state*][s-fenced-code-tilde-opening-fence-whitespace]
*   ↪ **Anything else**

    Consume

### 7.43 Fenced code continuation line state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Fenced code line group*][g-fenced-code-line], emit, close, and reconsume in the
    [*Line ending state*][s-line-ending]
*   ↪ **Anything else**

    Consume

### 7.44 Fenced code close sequence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    > ❗️ Todo: Define shared space: `openingSize`

    If the [current token][current-token]’s size is greater than or equal to `openingSize`,
    [process as a Fenced code fence][process-as-a-fenced-code-fence], close, and reconsume in the
    [*Line ending state*][s-line-ending]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    > ❗️ Todo: Define shared space: `openingSize`

    If the [current token][current-token]’s size is greater than or equal to `openingSize`,
    queue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code close whitespace state*][s-fenced-code-close-whitespace].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**\
    ↪ **U+007E TILDE (`~`)**

    If the [input character][input-character] is the [current token][current-token]’s marker, consume.

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Fenced code continuation line state*][s-fenced-code-continuation-line]

### 7.45 Fenced code close whitespace state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as a Fenced code fence][process-as-a-fenced-code-fence], close, and reconsume in the
    [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **Anything else**

    Turn the queue, except for the first token if it is a [*Whitespace token*][t-whitespace], into a
    [*Content token*][t-content] and reconsume in the [*Fenced code continuation line state*][s-fenced-code-continuation-line]

### 7.46 Indented code line state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    If the current open block is not an [*Indented code group*][g-indented-code], open an
    [*Indented code group*][g-indented-code].

    Open an [*Indented code line group*][g-indented-code-line], emit, close, and reconsume in the
    [*Line ending state*][s-line-ending]
*   ↪ **Anything else**

    Consume

### 7.47 Content continuation state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    If the current open block is not a [*Content group*][g-content], open a [*Content group*][g-content].

    Open a [*Content line group*][g-content-line], emit, close, and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **Anything else**

    Consume

## 8 Tokens

### 8.1 Whitespace token

A [*Whitespace token*][t-whitespace] represents inline whitespace that is part of syntax instead
of content.

```idl
interface Whitespace <: Token {
  size: number
  used: number
  characters: [Character]
}
```

```js
{
  type: 'whitespace',
  characters: [9],
  size: 3,
  used: 0
}
```

### 8.2 Line ending token

A [*Line ending token*][t-line-ending] represents a line break in the syntax.

```idl
interface LineEnding <: Token {}
```

```js
{type: 'lineEnding'}
```

### 8.3 End-of-file token

An [*End-of-file token*][t-end-of-file] represents the end of the syntax.

```idl
interface EndOfFile <: Token {}
```

```js
{type: 'endOfFile'}
```

### 8.4 Marker token

A [*Marker token*][t-marker] represents one punctuation character that is part of syntax instead
of content.

```idl
interface Marker <: Token {}
```

```js
{type: 'marker'}
```

### 8.5 Sequence token

A [*Sequence token*][t-sequence] represents one or more of the same punctuation characters that are
part of syntax instead of content.

```idl
interface Sequence <: Token {
  size: number
}
```

```js
{type: 'sequence', size: 3}
```

### 8.6 Content token

A [*Content token*][t-content] represents content.

```idl
interface Content <: Token {
  prefix: string
}
```

```js
{type: 'content', prefix: '  '}
```

## 9 Groups

Groups are named groups of tokens and other blocks.

### 9.1 Blank line group

A [*Blank line group*][g-blank-line] represents an empty line.

```idl
interface BlankLine <: Group {
  children: [Whitespace]
}
```

### 9.2 ATX heading group

An [*ATX heading group*][g-atx-heading] represents a heading for a section.

```idl
interface AtxHeading <: Group {
  children: [ATXHeadingFenceGroup | ATXHeadingContentGroup]
}
```

### 9.3 ATX heading fence group

An [*ATX heading fence group*][g-atx-heading-fence] represents a fence of a heading.

```idl
interface AtxHeadingFence <: Group {
  children: [Whitespace | Sequence]
}
```

### 9.4 ATX heading content group

An [*ATX heading content group*][g-atx-heading-content] represents the phrasing of a heading.

```idl
interface AtxHeadingContent <: Group {
  children: [Phrasing]
}
```

### 9.5 Thematic break group

A [*Thematic break group*][g-thematic-break] represents a thematic break in a section.

```idl
interface ThematicBreak <: Group {
  children: [Sequence | Whitespace]
}
```

### 9.6 HTML group

An [*HTML group*][g-html] represents embedded HTML.

```idl
interface HTML <: Group {
  children: [HTMLineGroup | BlankLineGroup | LineEnding]
}
```

### 9.7 HTML line group

An [*HTML line group*][g-html-line] represents a line of HTML.

```idl
interface HTMLLine <: Group {
  children: [Whitespace | Content]
}
```

### 9.8 Indented code group

An [*Indented code group*][g-indented-code] represents preformatted text.

```idl
interface IndentedCode <: Group {
  children: [IndentedCodeLineGroup | BlankLineGroup | LineEnding]
}
```

### 9.9 Indented code line group

An [*Indented code line group*][g-indented-code-line] represents a line of indented code.

```idl
interface IndentedCodeLine <: Group {
  children: [Whitespace | Content]
}
```

### 9.10 Blockquote group

A [*Blockquote group*][g-blockquote] represents paraphrased text.

```idl
interface Blockquote <: Group {
  children: [FencedCodeGroup | IndentedCodeGroup | ATXHeadingGroup | SetextHeadingGroup | ThematicBreakGroup | HTMLGroup | ContentGroup | LineEnding]
}
```

### 9.11 Fenced code group

A [*Fenced code group*][g-fenced-code] represents preformatted text.

```idl
interface FencedCode <: Group {
  children: [FencedCodeFenceGroup | FencedCodeLineGroup | BlankLineGroup | LineEnding]
}
```

### 9.12 Fenced code fence group

A [*Fenced code fence group*][g-fenced-code-fence] represents a fence of fenced code.

```idl
interface FencedCodeFence <: Group {
  children: [Whitespace | Sequence | FencedCodeLanguageGroup | FencedCodeMetadataGroup]
}
```

### 9.13 Fenced code language group

A [*Fenced code language group*][g-fenced-code-language] represents the programming language of fenced code.

```idl
interface FencedCodeLanguage <: Group {
  children: [Whitespace | Content]
}
```

### 9.14 Fenced code metadata group

A [*Fenced code metadata group*][g-fenced-code-metadata] represents the metadata about fenced code.

```idl
interface FencedCodeMetadata <: Group {
  children: [Whitespace | Content]
}
```

### 9.15 Fenced code line group

A [*Fenced code line group*][g-fenced-code-line] represents a line of fenced code.

```idl
interface FencedCodeLine <: Group {
  children: [Whitespace | Content]
}
```

### 9.16 Content group

A [*Content group*][g-content] represents content: definitions, paragraphs, and sometimes heading
content.

```idl
interface Content <: Group {
  children: [ContentLineGroup | LineEnding]
}
```

### 9.17 Content line group

A [*Content line group*][g-content-line] represents a line of content.

```idl
interface ContentLine <: Group {
  children: [Whitespace | Content]
}
```

### 9.18 Setext heading group

An [*Setext heading group*][g-setext-heading] represents a heading for a section.

```idl
interface SetextHeading <: Group {
  children: [SetextHeadingContentGroup | SetextHeadingUnderlineGroup | LineEnding]
}
```

### 9.19 Setext heading content group

> ❗️ Todo

### 9.20 Setext heading underline group

A [*Setext heading underline group*][g-setext-heading-underline] represents a fence of a heading.

```idl
interface SetextHeadingUnderline <: Group {
  children: [Whitespace | Sequence]
}
```

### 9.21 Definition group

A [*Definition group*][g-definition] represents a link reference definition.

```idl
interface Definition <: Group {
  children: [DefinitionLabelGroup | DefinitionLabelQuotedGroup | DefinitionLabelUnquotedGroup | DefinitionTitleGroup | Whitespace | LineEnding]
}
```

### 9.22 Definition label group

A [*Definition label group*][g-definition-label] represents the label of a definition.

```idl
interface DefinitionLabel <: Group {
  children: [DefinitionLabelContentGroup | Marker | Whitespace | LineEnding]
}
```

### 9.23 Definition label content group

A [*Definition label content group*][g-definition-label-content] represents the content of the label of a
definition.

```idl
interface DefinitionLabelContent <: Group {
  children: [Content | Whitespace | LineEnding]
}
```

### 9.24 Definition destination quoted group

A [*Definition destination quoted group*][g-definition-destination-quoted] represents an enclosed destination of a
definition.

```idl
interface DefinitionDestinationQuoted <: Group {
  children: [Content | Marker]
}
```

### 9.25 Definition destination unquoted group

A [*Definition destination unquoted group*][g-definition-destination-unquoted] represents an unclosed destination of a
definition.

```idl
interface DefinitionDestinationUnquoted <: Group {
  children: [Content]
}
```

### 9.26 Definition title group

A [*Definition title group*][g-definition-title] represents advisory information, such as a description of
the destination of the definition.

```idl
interface DefinitionTitle <: Group {
  children: [Content | Marker | Whitespace | LineEnding]
}
```

### 9.27 Paragraph group

> ❗️ Todo

## 10 Processing

### 10.1 Process as an ATX heading

To <a id="process-as-an-atx-heading" href="#process-as-an-atx-heading">**process as an ATX heading**</a> is to perform the following steps:

Let `index` be the number of tokens in the queue.

If the token in the queue before `index` is a [*Whitespace token*][t-whitespace], remove `1` from
`index`.

If the token in the queue before `index` is a [*Sequence token*][t-sequence], remove `1` from
`index`.

If the token in the queue before `index` is a [*Whitespace token*][t-whitespace], remove `1` from
`index`.

If `index` is not `0`, let `line` be a line where `start` is the start position
of the token at `0`, `end` is the end position of the token at `index` if there
is one or otherwise the last token in the queue, and without an ending, open a
[*ATX heading content group*][g-atx-heading-content], [process as Phrasing][process-as-phrasing] with `lines` set to a list with a
single entry `line`, and close.

If there is a token at `index` in queue, open an [*ATX heading fence group*][g-atx-heading-fence], emit the
tokens in the queue from `index`, and close.

Finally, close.

### 10.2 Process as a Setext primary heading

To <a id="process-as-a-setext-primary-heading" href="#process-as-a-setext-primary-heading">**process as a Setext primary heading**</a> is to perform the following steps:

Process the [current group][current-group]: [process as Content][process-as-content] with a *setext primary
heading* hint.

If the hint is used, open a [*Setext heading underline group*][g-setext-heading-underline], emit, and close
twice, and return.

Otherwise, let `index` be the position of the [current token][current-token] in the queue.

If the [current token][current-token] is a [*Whitespace token*][t-whitespace], remove `1` from `index`.

Open a [*Content group*][g-content], emit the tokens before `index`, emit the tokens in the queue
from `index` as a [*Content token*][t-content].

### 10.3 Process as an asterisk line

To <a id="process-as-an-asterisk-line" href="#process-as-an-asterisk-line">**process as an asterisk line**</a> is to perform the following steps:

Let `size` be `0` and iterate through each `token` in the queue, and perform the
following steps for its type:

*   ↪ **[*Marker token*][t-marker]**

    Increment `size` by `1`.
    If `size` is `3`, this is a thematic break, open a [*Thematic break group*][g-thematic-break], emit,
    close, break from the loop, abort from the state, and reconsume in the
    [*Line ending state*][s-line-ending]
*   ↪ **Anything else**

    Do nothing

> ❗️ Delay for reference parser: This may be list item markers, list items with
> code, or content.
> It’s easier to figure this out with a reference parser that is tested.

### 10.4 Process as an asterisk line opening

To <a id="process-as-an-asterisk-line-opening" href="#process-as-an-asterisk-line-opening">**process as an asterisk line opening**</a> is to perform the following steps:

> ❗️ Delay for reference parser: This may be list item markers, list items with
> code, or content.
> It’s easier to figure this out with a reference parser that is tested.

### 10.5 Process as a Fenced code fence

To <a id="process-as-a-fenced-code-fence" href="#process-as-a-fenced-code-fence">**process as a Fenced code fence**</a> is to perform the following steps:

Let `fenceEnd` be `1`.
Let `lineEnd` be the number of tokens in the queue.

If the token in the queue before `lineEnd` is a [*Whitespace token*][t-whitespace], remove `1` from
`lineEnd`.

If the token in the queue before `fenceEnd` is a [*Whitespace token*][t-whitespace], add `1` to
`fenceEnd`.

If `fenceEnd` is not `lineEnd`, and the token in the queue at `fenceEnd` is a
[*Whitespace token*][t-whitespace] , add `1` to `fenceEnd`.

If `fenceEnd` is not `lineEnd`, let `langEnd` be `fenceEnd` plus `1`.

If `langEnd` is defined and it is not `lineEnd`, let `metaStart` be `langEnd`
plus `1`.

Open a [*Fenced code fence group*][g-fenced-code-fence] and emit the tokens before `fenceEnd`.

If `langEnd` is defined, let `lang` be a line where `start` is the start
position of the token at `fenceEnd`, `end` is the end position of the token at
`langEnd`, and without an ending, open a [*Fenced code language group*][g-fenced-code-language], [process as a
String][process-as-a-string] with `lines` set to a list with a single entry `lang`, and close.

If `metaStart` is defined, emit the token at `langEnd`, let `meta` be a line
where `start` is the start position of the token at `metaStart`, `end` is the
end position of the token at `lineEnd`, and without an ending, open a
[*Fenced code metadata group*][g-fenced-code-metadata], [process as a String][process-as-a-string] with `lines` set to a list with
a single entry `meta`, and close.

If there is a token at `lineEnd`, emit it.

Finally, close.

### 10.6 Process as Content

To <a id="process-as-content" href="#process-as-content">**process as Content**</a> is to perform the following steps on the characters
within the bounds of the tokens in the group.
Processing content can be given a hint, in which case the hint is either
*setext primary heading* or *setext secondary heading*.
Content consists of lines, where each line is a [*Content token*][t-content], optionally preceded
by a [*Whitespace token*][t-whitespace], and between each line is a [*Line ending token*][t-line-ending].
To create the boundaries of lines of content, perform the following steps:

*   Let `lines` be an empty list
*   Let `index` be `0`
*   *Loop*: let `start` be the start position of the token at `index` in the
    tokens
*   If the token after `index` in tokens is a [*Content token*][t-content], add `1` to `index`
*   Let `end` be the end position of the token at `index` in tokens
*   If the token after `index` in tokens is a [*Line ending token*][t-line-ending], add `1` to `index`,
    add a line to `lines` with `start`, `end`, and `ending` set the token at
    `index` in tokens
*   Otherwise, add a line to `lines` with `start`, `end`, and without a `ending`
*   Add `1` to `index`
*   If there is no token at `index` in tokens, return
*   Go to the step labeled *loop*.

With lines, now perform the following steps:

*   Let `pointer` be a pointer to the first line (`0`) and the start of the
    first line in lines
*   [Process as Definitions][process-as-definitions] with `lines` given `pointer`
*   If `pointer` is the last place in `lines`, return that hint is not used
*   Otherwise, [process as a Paragraph][process-as-a-paragraph] with `lines` given `pointer` and
    `hint`, and return that hint was used

### 10.7 Process as Definitions

Perform the following steps with the given pointer and lines:

*   Let `start` be a copy of `pointer`
*   Let `labelBeforeStart` be a copy of `pointer`
*   Skip whitespace and line endings within `lines` given `pointer`
*   Let `labelBeforeEnd` be a copy of `pointer`
*   If the character at `pointer` is not U+005B LEFT SQUARE BRACKET (`[`), let `pointer` be `start` and
    return
*   Move `pointer` one place forward
*   Let `labelOpenStart` be a copy of `pointer`
*   Skip whitespace and line endings within `lines` given `pointer`
*   If the character at `pointer` is U+005D RIGHT SQUARE BRACKET (`]`), let `pointer` be `start` and
    return
*   Let `labelOpenEnd` be a copy of `pointer`
*   Let `backslash` be a copy of `pointer`
*   Let `bracket` be a copy of `pointer`
*   *Look for label end*: scan for U+005D RIGHT SQUARE BRACKET (`]`) within `lines` given `bracket`
*   *Look for label escape*: scan for U+005C BACKSLASH (`\`) within `lines` given `backslash`
*   If `backslash` points to the place right before `bracket`, move `backslash`
    one place forward, move `bracket` one place forward, and go the step labeled
    *look for label end*
*   Otherwise, if `backslash` is before `bracket`, move `backslash` one place
    forward, and go the step labeled *look for label escape*
*   Otherwise, if `bracket` is not a place, let `pointer` be `start` and return
*   Let `pointer` be `bracket`
*   Let `labelCloseEnd` be a copy of `pointer`
*   Let `labelCloseStart` be a copy of `pointer`
*   Skip whitespace and line endings backwards within `lines` given
    `labelCloseStart`
*   If `pointer` points to the end of the line, let `pointer` be `start` and
    return
*   Move `pointer` one place forward
*   If the character at `pointer` is not U+003A COLON (`:`), let `pointer` be `start` and
    return
*   Move `pointer` one place forward
*   Let `destinationBeforeStart` be a copy of `pointer`
*   Skip whitespace and line endings within `lines` given `pointer`
*   Let `destinationBeforeEnd` be a copy of `pointer`
*   Let `quoted` be `false`, and perform either of the following substeps:

    *   If `pointer` is a U+003C LESS THAN (`<`):

        *   Let `quoted` be `true`
        *   Move `pointer` one place forward
        *   Let `destinationStart` be a copy of `pointer`
        *   *Quoted destination continuation*: if `pointer` points to the end of
            the line or the character U+003C LESS THAN (`<`), let `pointer` be `start` and return
        *   Otherwise, if the character at `pointer` is U+003E GREATER THAN (`>`), let
            `destinationEnd` be a copy of `pointer`, move `pointer` one place
            forward, and break
        *   Otherwise, if the character at `pointer` is U+005C BACKSLASH (`\`) and the character
            after `pointer` is U+003C LESS THAN (`<`) or U+003E GREATER THAN (`>`), move `pointer` two places forward,
            and go to the step labeled *quoted destination continuation*
        *   Otherwise, move `pointer` one place forward and go to the step
            labeled *quoted destination continuation*
    *   Otherwise:

        *   Let `balance` be `0`
        *   Let `destinationStart` be a copy of `pointer`
        *   *Quoted destination continuation*: if the character at `pointer` is
            an [ASCII control][ascii-control], let `pointer` be `start` and return
        *   Otherwise, if `pointer` points to the end of the line or a U+0009 CHARACTER TABULATION (HT) or
            U+0020 SPACE (SP), let `destinationEnd` be a copy of `pointer` and break
        *   Otherwise, if the character at `pointer` is U+0028 LEFT PARENTHESIS (`(`), increment `balance`
            by `1`, move `pointer` one place forward, and go to the step labeled
            *unquoted destination continuation*
        *   Otherwise, if the character at `pointer` is U+0029 RIGHT PARENTHESIS (`)`), and `balance` is
            `0`, let `pointer` be `start` and return
        *   Otherwise, if the character at `pointer` is U+0029 RIGHT PARENTHESIS (`)`), decrement `balance`
            by `1`, move `pointer` one place forward, and go to the step labeled
            *unquoted destination continuation*
        *   Otherwise, if the character at `pointer` is U+005C BACKSLASH (`\`) and the character
            after `pointer` is U+0028 LEFT PARENTHESIS (`(`) or U+0029 RIGHT PARENTHESIS (`)`), move `pointer` two places forward,
            and go to the step labeled *unquoted destination continuation*
        *   Otherwise, move `pointer` one place forward, and go to the step
            labeled *unquoted destination continuation*
*   Let `destinationAfterStart` be a copy of `pointer`
*   Skip whitespace (not line endings) within `lines` given `pointer`
*   Let `destinationAfterEnd` be a copy of `pointer`
*   If `pointer` is the end of the line, let `save` be a copy of `pointer`
*   Skip whitespace (not line endings) within `lines` given `pointer`
*   Let `titleBeforeEnd` be a copy of `pointer`
*   If the character at `pointer` is U+0022 QUOTATION MARK (`"`) or U+0027 APOSTROPHE (`'`), let `marker` be that character
*   Otherwise, if the character is U+0028 LEFT PARENTHESIS (`(`), let `marker` be U+0029 RIGHT PARENTHESIS (`)`)
*   Otherwise, if `save` is a place, create a definition without a title, let
    `pointer` be `save`, process as definitions with `lines` given `pointer`,
    and return
*   Otherwise, let `pointer` be `start` and return
*   Move `pointer` one place forward
*   Let `titleStart` be a copy of `pointer`
*   *Title continuation*: if the character at `pointer` is `marker`, let
    `titleEnd` be a copy of `pointer`, move `pointer` one place forward, and
    break
*   Otherwise, if the character at `pointer` is U+005C BACKSLASH (`\`) and the character after
    `pointer` is `marker`, move `pointer` two places forward, and go to the step
    labeled *title continuation*
*   Otherwise, move `pointer` one place forward, and go to the step labeled
    *title continuation*
*   Let `titleAfterStart` be a copy of `pointer`
*   Skip whitespace (not line endings) within `lines` given `pointer`
*   Let `titleAfterEnd` be a copy of `pointer`
*   If `pointer` is the end of the line, create a definition with a title,
    process as definitions with `lines` given `pointer`, and return
*   Otherwise, if `save` is a place, create a definition without a title, let
    `pointer` be `save`, process as definitions with `lines` given `pointer`,
    and return
*   Otherwise, let `pointer` be `start`, and return

#### 10.7.1 Create a definition

Open a [*Definition group*][g-definition].
If `labelBeforeStart` is not `labelBeforeEnd`, emit the whitespace between both
points.
Open a [*Definition label group*][g-definition-label].
Emit a [*Marker token*][t-marker] with the character at `labelBeforeEnd`.
If `labelOpenStart` is not `labelOpenEnd`, emit the whitespace and line
endings between both points.

Let `label` be a slice of the lines between `labelOpenEnd` and
`labelCloseStart`, open a [*Definition label content group*][g-definition-label-content], [process as a String][process-as-a-string]
with `lines` set to `label`, and close.

If `labelCloseStart` is not `labelCloseEnd`, emit the whitespace and line
endings between both points.

Close.

Emit a [*Marker token*][t-marker] with the character at `labelCloseEnd`.
Close.
Emit a [*Marker token*][t-marker] with the character after `labelCloseEnd`.

If `destinationBeforeStart` is not `destinationBeforeEnd`, emit the whitespace
and line endings between both points.

If `quoted` is `true`, emit a [*Marker token*][t-marker] with the character at
`destinationBeforeEnd`, let `destination` be a line where `start` is
`destinationStart`, `end` is `destinationEnd`, and without an ending, open a
[*Definition destination quoted group*][g-definition-destination-quoted], [process as a String][process-as-a-string] with `lines` set to a
list with a single entry `destination`, emit a [*Marker token*][t-marker] with the character at
`destinationEnd`, and close.

Otherwise, let `destination` be a line where `start` is `destinationStart`,
`end` is `destinationEnd`, and without an ending, open a
[*Definition destination quoted group*][g-definition-destination-quoted], [process as a String][process-as-a-string] with `lines` set to a
list with a single entry `destination`, and close.

If `destinationAfterStart` is not `destinationAfterEnd`, emit the whitespace
between both points.

If the destination is to be created with a title, then if `destinationAfterEnd`
is not `titleBeforeEnd`, emit the whitespace and line endings between both
points, open a [*Definition title group*][g-definition-title], emit a [*Marker token*][t-marker] with the character at
`titleBeforeEnd`, let `title` be a slice of the lines between `titleStart` and
`titleEnd`, [process as a String][process-as-a-string] with `lines` set to `title`, emit a [*Marker token*][t-marker]
with the character at `titleEnd`, then if `titleAfterStart` is not
`titleAfterEnd`, emit the whitespace between both points, and close

Finally, close.

### 10.8 Process as a Paragraph

To <a id="process-as-a-paragraph" href="#process-as-a-paragraph">**process as a Paragraph**</a> is to perform the following steps with the given
pointer, lines, and hint:

Processing content can be given a hint, in which case the hint is either
*setext primary heading* or *setext secondary heading*.

*   If a hint is given, open a [*Setext heading group*][g-setext-heading] and open a
    [*Setext heading content group*][g-setext-heading-content]
*   Otherwise, open a [*Paragraph group*][g-paragraph]
*   [Process as Phrasing][process-as-phrasing] given `lines`
*   Close (once, if there was a hint, the place that hinted has to close the
    setext heading)

### 10.9 Process as a String

To <a id="process-as-a-string" href="#process-as-a-string">**process as a String**</a> is to perform the following steps with the given
lines:

> ❗️ Todo: escapes and character references

### 10.10 Process as Phrasing

To <a id="process-as-phrasing" href="#process-as-phrasing">**process as Phrasing**</a> is to perform the following steps with the given
lines:

> ❗️ Todo: escapes, character references, code, emphasis, importance, links,
> link references, images, image references, autolinks, HTML, hard line breaks,
> soft line breaks.

## 11 WIP

Content, when it is closed, can result in zero or more [*Definition group*][g-definition]’s, and,
depending on whether it is closed by a construct that could be a Setext heading
underline, either a [*Setext heading group*][g-setext-heading] or [*Paragraph group*][g-paragraph].

Phrasing is found in [*ATX heading content group*][g-atx-heading-content], [*Setext heading content group*][g-setext-heading-content], and
[*Paragraph group*][g-paragraph].

Some constructs, namely [*Definition group*][g-definition], [*Setext heading content group*][g-setext-heading-content], and [*Paragraph group*][g-paragraph],
can span multiple lines.

The procedures of parsing content, definitions, and phrasing is similar to
tokenization, but operates on tokens instead of an input stream.

## 12 References

*   **\[HTML]**:
    [HTML Standard](https://html.spec.whatwg.org/multipage/).
    A. van Kesteren, et al.
    WHATWG.
*   **\[RFC20]**:
    [ASCII format for network interchange](https://tools.ietf.org/html/rfc20).
    V.G. Cerf.
    October 1969.
    Internet Standard.
*   **\[UNICODE]**:
    [The Unicode Standard](https://www.unicode.org/versions/).
    Unicode Consortium.

## 13 Appendix

### 13.1 Raw tags

A <a id="raw-tag" href="#raw-tag">**raw tag**</a> is one of: `script`, `pre`, and `style`.

### 13.2 Simple tags

A <a id="simple-tag" href="#simple-tag">**simple tag**</a> is one of: `address`, `article`, `aside`, `base`, `basefont`,
`blockquote`, `body`, `caption`, `center`, `col`, `colgroup`, `dd`, `details`,
`dialog`, `dir`, `div`, `dl`, `dt`, `fieldset`, `figcaption`, `figure`,
`footer`, `form`, `frame`, `frameset`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`,
`head`, `header`, `hr`, `html`, `iframe`, `legend`, `li`, `link`, `main`,
`menu`, `menuitem`, `nav`, `noframes`, `ol`, `optgroup`, `option`, `p`,
`param`, `section`, `source`, `summary`, `table`, `tbody`, `td`, `tfoot`, `th`,
`thead`, `title`, `tr`, `track`, and `ul`.

### 13.3 Control replacements

A <a id="control-replacement" href="#control-replacement">**control replacement**</a> is the character in the column “Replacement”, used
instead of a character in the column “Input”.

| Input | Replacement | Name                                             |
| ----- | ----------- | ------------------------------------------------ |
| 0x80  | 0x20AC      | EURO SIGN (`€`)                                  |
| 0x82  | 0x201A      | SINGLE LOW-9 QUOTATION MARK (`‚`)                |
| 0x83  | 0x0192      | LATIN SMALL LETTER F WITH HOOK (`ƒ`)             |
| 0x84  | 0x201E      | DOUBLE LOW-9 QUOTATION MARK (`„`)                |
| 0x85  | 0x2026      | HORIZONTAL ELLIPSIS (`…`)                        |
| 0x86  | 0x2020      | DAGGER (`†`)                                     |
| 0x87  | 0x2021      | DOUBLE DAGGER (`‡`)                              |
| 0x88  | 0x02C6      | MODIFIER LETTER CIRCUMFLEX ACCENT (`ˆ`)          |
| 0x89  | 0x2030      | PER MILLE SIGN (`‰`)                             |
| 0x8A  | 0x0160      | LATIN CAPITAL LETTER S WITH CARON (`Š`)          |
| 0x8B  | 0x2039      | SINGLE LEFT-POINTING ANGLE QUOTATION MARK (`‹`)  |
| 0x8C  | 0x0152      | LATIN CAPITAL LIGATURE OE (`Œ`)                  |
| 0x8E  | 0x017D      | LATIN CAPITAL LETTER Z WITH CARON (`Ž`)          |
| 0x91  | 0x2018      | LEFT SINGLE QUOTATION MARK (`‘`)                 |
| 0x92  | 0x2019      | RIGHT SINGLE QUOTATION MARK (`’`)                |
| 0x93  | 0x201C      | LEFT DOUBLE QUOTATION MARK (`“`)                 |
| 0x94  | 0x201D      | RIGHT DOUBLE QUOTATION MARK (`”`)                |
| 0x95  | 0x2022      | BULLET (`•`)                                     |
| 0x96  | 0x2013      | EN DASH (`–`)                                    |
| 0x97  | 0x2014      | EM DASH (`—`)                                    |
| 0x98  | 0x02DC      | SMALL TILDE (`˜`)                                |
| 0x99  | 0x2122      | TRADE MARK SIGN (`™`)                            |
| 0x9A  | 0x0161      | LATIN SMALL LETTER S WITH CARON (`š`)            |
| 0x9B  | 0x203A      | SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (`›`) |
| 0x9C  | 0x0153      | LATIN SMALL LIGATURE OE (`œ`)                    |
| 0x9E  | 0x017E      | LATIN SMALL LETTER Z WITH CARON (`ž`)            |
| 0x9F  | 0x0178      | LATIN CAPITAL LETTER Y WITH DIAERESIS (`Ÿ`)      |

### 13.4 Named character references

A <a id="character-reference-name" href="#character-reference-name">**character reference name**</a> is one of:
`AEli`, `AElig`, `AM`, `AMP`, `Aacut`, `Aacute`,
`Abreve`, `Acir`, `Acirc`, `Acy`, `Afr`, `Agrav`, `Agrave`, `Alpha`, `Amacr`,
`And`, `Aogon`, `Aopf`, `ApplyFunction`, `Arin`, `Aring`, `Ascr`, `Assign`,
`Atild`, `Atilde`, `Aum`, `Auml`, `Backslash`, `Barv`, `Barwed`, `Bcy`,
`Because`, `Bernoullis`, `Beta`, `Bfr`, `Bopf`, `Breve`, `Bscr`, `Bumpeq`,
`CHcy`, `COP`, `COPY`, `Cacute`, `Cap`, `CapitalDifferentialD`, `Cayleys`,
`Ccaron`, `Ccedi`, `Ccedil`, `Ccirc`, `Cconint`, `Cdot`, `Cedilla`, `CenterDot`,
`Cfr`, `Chi`, `CircleDot`, `CircleMinus`, `CirclePlus`, `CircleTimes`,
`ClockwiseContourIntegral`, `CloseCurlyDoubleQuote`, `CloseCurlyQuote`, `Colon`,
`Colone`, `Congruent`, `Conint`, `ContourIntegral`, `Copf`, `Coproduct`,
`CounterClockwiseContourIntegral`, `Cross`, `Cscr`, `Cup`, `CupCap`, `DD`,
`DDotrahd`, `DJcy`, `DScy`, `DZcy`, `Dagger`, `Darr`, `Dashv`, `Dcaron`, `Dcy`,
`Del`, `Delta`, `Dfr`, `DiacriticalAcute`, `DiacriticalDot`,
`DiacriticalDoubleAcute`, `DiacriticalGrave`, `DiacriticalTilde`, `Diamond`,
`DifferentialD`, `Dopf`, `Dot`, `DotDot`, `DotEqual`, `DoubleContourIntegral`,
`DoubleDot`, `DoubleDownArrow`, `DoubleLeftArrow`, `DoubleLeftRightArrow`,
`DoubleLeftTee`, `DoubleLongLeftArrow`, `DoubleLongLeftRightArrow`,
`DoubleLongRightArrow`, `DoubleRightArrow`, `DoubleRightTee`, `DoubleUpArrow`,
`DoubleUpDownArrow`, `DoubleVerticalBar`, `DownArrow`, `DownArrowBar`,
`DownArrowUpArrow`, `DownBreve`, `DownLeftRightVector`, `DownLeftTeeVector`,
`DownLeftVector`, `DownLeftVectorBar`, `DownRightTeeVector`, `DownRightVector`,
`DownRightVectorBar`, `DownTee`, `DownTeeArrow`, `Downarrow`, `Dscr`, `Dstrok`,
`ENG`, `ET`, `ETH`, `Eacut`, `Eacute`, `Ecaron`, `Ecir`, `Ecirc`, `Ecy`, `Edot`,
`Efr`, `Egrav`, `Egrave`, `Element`, `Emacr`, `EmptySmallSquare`,
`EmptyVerySmallSquare`, `Eogon`, `Eopf`, `Epsilon`, `Equal`, `EqualTilde`,
`Equilibrium`, `Escr`, `Esim`, `Eta`, `Eum`, `Euml`, `Exists`, `ExponentialE`,
`Fcy`, `Ffr`, `FilledSmallSquare`, `FilledVerySmallSquare`, `Fopf`, `ForAll`,
`Fouriertrf`, `Fscr`, `G`, `GJcy`, `GT`, `Gamma`, `Gammad`, `Gbreve`, `Gcedil`,
`Gcirc`, `Gcy`, `Gdot`, `Gfr`, `Gg`, `Gopf`, `GreaterEqual`, `GreaterEqualLess`,
`GreaterFullEqual`, `GreaterGreater`, `GreaterLess`, `GreaterSlantEqual`,
`GreaterTilde`, `Gscr`, `Gt`, `HARDcy`, `Hacek`, `Hat`, `Hcirc`, `Hfr`,
`HilbertSpace`, `Hopf`, `HorizontalLine`, `Hscr`, `Hstrok`, `HumpDownHump`,
`HumpEqual`, `IEcy`, `IJlig`, `IOcy`, `Iacut`, `Iacute`, `Icir`, `Icirc`, `Icy`,
`Idot`, `Ifr`, `Igrav`, `Igrave`, `Im`, `Imacr`, `ImaginaryI`, `Implies`, `Int`,
`Integral`, `Intersection`, `InvisibleComma`, `InvisibleTimes`, `Iogon`, `Iopf`,
`Iota`, `Iscr`, `Itilde`, `Iukcy`, `Ium`, `Iuml`, `Jcirc`, `Jcy`, `Jfr`, `Jopf`,
`Jscr`, `Jsercy`, `Jukcy`, `KHcy`, `KJcy`, `Kappa`, `Kcedil`, `Kcy`, `Kfr`,
`Kopf`, `Kscr`, `L`, `LJcy`, `LT`, `Lacute`, `Lambda`, `Lang`, `Laplacetrf`,
`Larr`, `Lcaron`, `Lcedil`, `Lcy`, `LeftAngleBracket`, `LeftArrow`,
`LeftArrowBar`, `LeftArrowRightArrow`, `LeftCeiling`, `LeftDoubleBracket`,
`LeftDownTeeVector`, `LeftDownVector`, `LeftDownVectorBar`, `LeftFloor`,
`LeftRightArrow`, `LeftRightVector`, `LeftTee`, `LeftTeeArrow`, `LeftTeeVector`,
`LeftTriangle`, `LeftTriangleBar`, `LeftTriangleEqual`, `LeftUpDownVector`,
`LeftUpTeeVector`, `LeftUpVector`, `LeftUpVectorBar`, `LeftVector`,
`LeftVectorBar`, `Leftarrow`, `Leftrightarrow`, `LessEqualGreater`,
`LessFullEqual`, `LessGreater`, `LessLess`, `LessSlantEqual`, `LessTilde`,
`Lfr`, `Ll`, `Lleftarrow`, `Lmidot`, `LongLeftArrow`, `LongLeftRightArrow`,
`LongRightArrow`, `Longleftarrow`, `Longleftrightarrow`, `Longrightarrow`,
`Lopf`, `LowerLeftArrow`, `LowerRightArrow`, `Lscr`, `Lsh`, `Lstrok`, `Lt`,
`Map`, `Mcy`, `MediumSpace`, `Mellintrf`, `Mfr`, `MinusPlus`, `Mopf`, `Mscr`,
`Mu`, `NJcy`, `Nacute`, `Ncaron`, `Ncedil`, `Ncy`, `NegativeMediumSpace`,
`NegativeThickSpace`, `NegativeThinSpace`, `NegativeVeryThinSpace`,
`NestedGreaterGreater`, `NestedLessLess`, `NewLine`, `Nfr`, `NoBreak`,
`NonBreakingSpace`, `Nopf`, `Not`, `NotCongruent`, `NotCupCap`,
`NotDoubleVerticalBar`, `NotElement`, `NotEqual`, `NotEqualTilde`, `NotExists`,
`NotGreater`, `NotGreaterEqual`, `NotGreaterFullEqual`, `NotGreaterGreater`,
`NotGreaterLess`, `NotGreaterSlantEqual`, `NotGreaterTilde`, `NotHumpDownHump`,
`NotHumpEqual`, `NotLeftTriangle`, `NotLeftTriangleBar`, `NotLeftTriangleEqual`,
`NotLess`, `NotLessEqual`, `NotLessGreater`, `NotLessLess`, `NotLessSlantEqual`,
`NotLessTilde`, `NotNestedGreaterGreater`, `NotNestedLessLess`, `NotPrecedes`,
`NotPrecedesEqual`, `NotPrecedesSlantEqual`, `NotReverseElement`,
`NotRightTriangle`, `NotRightTriangleBar`, `NotRightTriangleEqual`,
`NotSquareSubset`, `NotSquareSubsetEqual`, `NotSquareSuperset`,
`NotSquareSupersetEqual`, `NotSubset`, `NotSubsetEqual`, `NotSucceeds`,
`NotSucceedsEqual`, `NotSucceedsSlantEqual`, `NotSucceedsTilde`, `NotSuperset`,
`NotSupersetEqual`, `NotTilde`, `NotTildeEqual`, `NotTildeFullEqual`,
`NotTildeTilde`, `NotVerticalBar`, `Nscr`, `Ntild`, `Ntilde`, `Nu`, `OElig`,
`Oacut`, `Oacute`, `Ocir`, `Ocirc`, `Ocy`, `Odblac`, `Ofr`, `Ograv`, `Ograve`,
`Omacr`, `Omega`, `Omicron`, `Oopf`, `OpenCurlyDoubleQuote`, `OpenCurlyQuote`,
`Or`, `Oscr`, `Oslas`, `Oslash`, `Otild`, `Otilde`, `Otimes`, `Oum`, `Ouml`,
`OverBar`, `OverBrace`, `OverBracket`, `OverParenthesis`, `PartialD`, `Pcy`,
`Pfr`, `Phi`, `Pi`, `PlusMinus`, `Poincareplane`, `Popf`, `Pr`, `Precedes`,
`PrecedesEqual`, `PrecedesSlantEqual`, `PrecedesTilde`, `Prime`, `Product`,
`Proportion`, `Proportional`, `Pscr`, `Psi`, `QUO`, `QUOT`, `Qfr`, `Qopf`,
`Qscr`, `RBarr`, `RE`, `REG`, `Racute`, `Rang`, `Rarr`, `Rarrtl`, `Rcaron`,
`Rcedil`, `Rcy`, `Re`, `ReverseElement`, `ReverseEquilibrium`,
`ReverseUpEquilibrium`, `Rfr`, `Rho`, `RightAngleBracket`, `RightArrow`,
`RightArrowBar`, `RightArrowLeftArrow`, `RightCeiling`, `RightDoubleBracket`,
`RightDownTeeVector`, `RightDownVector`, `RightDownVectorBar`, `RightFloor`,
`RightTee`, `RightTeeArrow`, `RightTeeVector`, `RightTriangle`,
`RightTriangleBar`, `RightTriangleEqual`, `RightUpDownVector`,
`RightUpTeeVector`, `RightUpVector`, `RightUpVectorBar`, `RightVector`,
`RightVectorBar`, `Rightarrow`, `Ropf`, `RoundImplies`, `Rrightarrow`, `Rscr`,
`Rsh`, `RuleDelayed`, `SHCHcy`, `SHcy`, `SOFTcy`, `Sacute`, `Sc`, `Scaron`,
`Scedil`, `Scirc`, `Scy`, `Sfr`, `ShortDownArrow`, `ShortLeftArrow`,
`ShortRightArrow`, `ShortUpArrow`, `Sigma`, `SmallCircle`, `Sopf`, `Sqrt`,
`Square`, `SquareIntersection`, `SquareSubset`, `SquareSubsetEqual`,
`SquareSuperset`, `SquareSupersetEqual`, `SquareUnion`, `Sscr`, `Star`, `Sub`,
`Subset`, `SubsetEqual`, `Succeeds`, `SucceedsEqual`, `SucceedsSlantEqual`,
`SucceedsTilde`, `SuchThat`, `Sum`, `Sup`, `Superset`, `SupersetEqual`,
`Supset`, `THOR`, `THORN`, `TRADE`, `TSHcy`, `TScy`, `Tab`, `Tau`, `Tcaron`,
`Tcedil`, `Tcy`, `Tfr`, `Therefore`, `Theta`, `ThickSpace`, `ThinSpace`,
`Tilde`, `TildeEqual`, `TildeFullEqual`, `TildeTilde`, `Topf`, `TripleDot`,
`Tscr`, `Tstrok`, `Uacut`, `Uacute`, `Uarr`, `Uarrocir`, `Ubrcy`, `Ubreve`,
`Ucir`, `Ucirc`, `Ucy`, `Udblac`, `Ufr`, `Ugrav`, `Ugrave`, `Umacr`, `UnderBar`,
`UnderBrace`, `UnderBracket`, `UnderParenthesis`, `Union`, `UnionPlus`, `Uogon`,
`Uopf`, `UpArrow`, `UpArrowBar`, `UpArrowDownArrow`, `UpDownArrow`,
`UpEquilibrium`, `UpTee`, `UpTeeArrow`, `Uparrow`, `Updownarrow`,
`UpperLeftArrow`, `UpperRightArrow`, `Upsi`, `Upsilon`, `Uring`, `Uscr`,
`Utilde`, `Uum`, `Uuml`, `VDash`, `Vbar`, `Vcy`, `Vdash`, `Vdashl`, `Vee`,
`Verbar`, `Vert`, `VerticalBar`, `VerticalLine`, `VerticalSeparator`,
`VerticalTilde`, `VeryThinSpace`, `Vfr`, `Vopf`, `Vscr`, `Vvdash`, `Wcirc`,
`Wedge`, `Wfr`, `Wopf`, `Wscr`, `Xfr`, `Xi`, `Xopf`, `Xscr`, `YAcy`, `YIcy`,
`YUcy`, `Yacut`, `Yacute`, `Ycirc`, `Ycy`, `Yfr`, `Yopf`, `Yscr`, `Yuml`,
`ZHcy`, `Zacute`, `Zcaron`, `Zcy`, `Zdot`, `ZeroWidthSpace`, `Zeta`, `Zfr`,
`Zopf`, `Zscr`, `aacut`, `aacute`, `abreve`, `ac`, `acE`, `acd`, `acir`,
`acirc`, `acut`, `acute`, `acy`, `aeli`, `aelig`, `af`, `afr`, `agrav`,
`agrave`, `alefsym`, `aleph`, `alpha`, `am`, `amacr`, `amalg`, `amp`, `and`,
`andand`, `andd`, `andslope`, `andv`, `ang`, `ange`, `angle`, `angmsd`,
`angmsdaa`, `angmsdab`, `angmsdac`, `angmsdad`, `angmsdae`, `angmsdaf`,
`angmsdag`, `angmsdah`, `angrt`, `angrtvb`, `angrtvbd`, `angsph`, `angst`,
`angzarr`, `aogon`, `aopf`, `ap`, `apE`, `apacir`, `ape`, `apid`, `apos`,
`approx`, `approxeq`, `arin`, `aring`, `ascr`, `ast`, `asymp`, `asympeq`,
`atild`, `atilde`, `aum`, `auml`, `awconint`, `awint`, `bNot`, `backcong`,
`backepsilon`, `backprime`, `backsim`, `backsimeq`, `barvee`, `barwed`,
`barwedge`, `bbrk`, `bbrktbrk`, `bcong`, `bcy`, `bdquo`, `becaus`, `because`,
`bemptyv`, `bepsi`, `bernou`, `beta`, `beth`, `between`, `bfr`, `bigcap`,
`bigcirc`, `bigcup`, `bigodot`, `bigoplus`, `bigotimes`, `bigsqcup`, `bigstar`,
`bigtriangledown`, `bigtriangleup`, `biguplus`, `bigvee`, `bigwedge`, `bkarow`,
`blacklozenge`, `blacksquare`, `blacktriangle`, `blacktriangledown`,
`blacktriangleleft`, `blacktriangleright`, `blank`, `blk12`, `blk14`, `blk34`,
`block`, `bne`, `bnequiv`, `bnot`, `bopf`, `bot`, `bottom`, `bowtie`, `boxDL`,
`boxDR`, `boxDl`, `boxDr`, `boxH`, `boxHD`, `boxHU`, `boxHd`, `boxHu`, `boxUL`,
`boxUR`, `boxUl`, `boxUr`, `boxV`, `boxVH`, `boxVL`, `boxVR`, `boxVh`, `boxVl`,
`boxVr`, `boxbox`, `boxdL`, `boxdR`, `boxdl`, `boxdr`, `boxh`, `boxhD`, `boxhU`,
`boxhd`, `boxhu`, `boxminus`, `boxplus`, `boxtimes`, `boxuL`, `boxuR`, `boxul`,
`boxur`, `boxv`, `boxvH`, `boxvL`, `boxvR`, `boxvh`, `boxvl`, `boxvr`, `bprime`,
`breve`, `brvba`, `brvbar`, `bscr`, `bsemi`, `bsim`, `bsime`, `bsol`, `bsolb`,
`bsolhsub`, `bull`, `bullet`, `bump`, `bumpE`, `bumpe`, `bumpeq`, `cacute`,
`cap`, `capand`, `capbrcup`, `capcap`, `capcup`, `capdot`, `caps`, `caret`,
`caron`, `ccaps`, `ccaron`, `ccedi`, `ccedil`, `ccirc`, `ccups`, `ccupssm`,
`cdot`, `cedi`, `cedil`, `cemptyv`, `cen`, `cent`, `centerdot`, `cfr`, `chcy`,
`check`, `checkmark`, `chi`, `cir`, `cirE`, `circ`, `circeq`, `circlearrowleft`,
`circlearrowright`, `circledR`, `circledS`, `circledast`, `circledcirc`,
`circleddash`, `cire`, `cirfnint`, `cirmid`, `cirscir`, `clubs`, `clubsuit`,
`colon`, `colone`, `coloneq`, `comma`, `commat`, `comp`, `compfn`, `complement`,
`complexes`, `cong`, `congdot`, `conint`, `cop`, `copf`, `coprod`, `copy`,
`copysr`, `crarr`, `cross`, `cscr`, `csub`, `csube`, `csup`, `csupe`, `ctdot`,
`cudarrl`, `cudarrr`, `cuepr`, `cuesc`, `cularr`, `cularrp`, `cup`, `cupbrcap`,
`cupcap`, `cupcup`, `cupdot`, `cupor`, `cups`, `curarr`, `curarrm`,
`curlyeqprec`, `curlyeqsucc`, `curlyvee`, `curlywedge`, `curre`, `curren`,
`curvearrowleft`, `curvearrowright`, `cuvee`, `cuwed`, `cwconint`, `cwint`,
`cylcty`, `dArr`, `dHar`, `dagger`, `daleth`, `darr`, `dash`, `dashv`,
`dbkarow`, `dblac`, `dcaron`, `dcy`, `dd`, `ddagger`, `ddarr`, `ddotseq`, `de`,
`deg`, `delta`, `demptyv`, `dfisht`, `dfr`, `dharl`, `dharr`, `diam`, `diamond`,
`diamondsuit`, `diams`, `die`, `digamma`, `disin`, `div`, `divid`, `divide`,
`divideontimes`, `divonx`, `djcy`, `dlcorn`, `dlcrop`, `dollar`, `dopf`, `dot`,
`doteq`, `doteqdot`, `dotminus`, `dotplus`, `dotsquare`, `doublebarwedge`,
`downarrow`, `downdownarrows`, `downharpoonleft`, `downharpoonright`, `drbkarow`,
`drcorn`, `drcrop`, `dscr`, `dscy`, `dsol`, `dstrok`, `dtdot`, `dtri`, `dtrif`,
`duarr`, `duhar`, `dwangle`, `dzcy`, `dzigrarr`, `eDDot`, `eDot`, `eacut`,
`eacute`, `easter`, `ecaron`, `ecir`, `ecir`, `ecirc`, `ecolon`, `ecy`, `edot`,
`ee`, `efDot`, `efr`, `eg`, `egrav`, `egrave`, `egs`, `egsdot`, `el`,
`elinters`, `ell`, `els`, `elsdot`, `emacr`, `empty`, `emptyset`, `emptyv`,
`emsp`, `emsp13`, `emsp14`, `eng`, `ensp`, `eogon`, `eopf`, `epar`, `eparsl`,
`eplus`, `epsi`, `epsilon`, `epsiv`, `eqcirc`, `eqcolon`, `eqsim`, `eqslantgtr`,
`eqslantless`, `equals`, `equest`, `equiv`, `equivDD`, `eqvparsl`, `erDot`,
`erarr`, `escr`, `esdot`, `esim`, `et`, `eta`, `eth`, `eum`, `euml`, `euro`,
`excl`, `exist`, `expectation`, `exponentiale`, `fallingdotseq`, `fcy`,
`female`, `ffilig`, `fflig`, `ffllig`, `ffr`, `filig`, `fjlig`, `flat`, `fllig`,
`fltns`, `fnof`, `fopf`, `forall`, `fork`, `forkv`, `fpartint`, `frac1`,
`frac1`, `frac12`, `frac13`, `frac14`, `frac15`, `frac16`, `frac18`, `frac23`,
`frac25`, `frac3`, `frac34`, `frac35`, `frac38`, `frac45`, `frac56`, `frac58`,
`frac78`, `frasl`, `frown`, `fscr`, `g`, `gE`, `gEl`, `gacute`, `gamma`,
`gammad`, `gap`, `gbreve`, `gcirc`, `gcy`, `gdot`, `ge`, `gel`, `geq`, `geqq`,
`geqslant`, `ges`, `gescc`, `gesdot`, `gesdoto`, `gesdotol`, `gesl`, `gesles`,
`gfr`, `gg`, `ggg`, `gimel`, `gjcy`, `gl`, `glE`, `gla`, `glj`, `gnE`, `gnap`,
`gnapprox`, `gne`, `gneq`, `gneqq`, `gnsim`, `gopf`, `grave`, `gscr`, `gsim`,
`gsime`, `gsiml`, `gt`, `gtcc`, `gtcir`, `gtdot`, `gtlPar`, `gtquest`,
`gtrapprox`, `gtrarr`, `gtrdot`, `gtreqless`, `gtreqqless`, `gtrless`, `gtrsim`,
`gvertneqq`, `gvnE`, `hArr`, `hairsp`, `half`, `hamilt`, `hardcy`, `harr`,
`harrcir`, `harrw`, `hbar`, `hcirc`, `hearts`, `heartsuit`, `hellip`, `hercon`,
`hfr`, `hksearow`, `hkswarow`, `hoarr`, `homtht`, `hookleftarrow`,
`hookrightarrow`, `hopf`, `horbar`, `hscr`, `hslash`, `hstrok`, `hybull`,
`hyphen`, `iacut`, `iacute`, `ic`, `icir`, `icirc`, `icy`, `iecy`, `iexc`,
`iexcl`, `iff`, `ifr`, `igrav`, `igrave`, `ii`, `iiiint`, `iiint`, `iinfin`,
`iiota`, `ijlig`, `imacr`, `image`, `imagline`, `imagpart`, `imath`, `imof`,
`imped`, `in`, `incare`, `infin`, `infintie`, `inodot`, `int`, `intcal`,
`integers`, `intercal`, `intlarhk`, `intprod`, `iocy`, `iogon`, `iopf`, `iota`,
`iprod`, `iques`, `iquest`, `iscr`, `isin`, `isinE`, `isindot`, `isins`,
`isinsv`, `isinv`, `it`, `itilde`, `iukcy`, `ium`, `iuml`, `jcirc`, `jcy`,
`jfr`, `jmath`, `jopf`, `jscr`, `jsercy`, `jukcy`, `kappa`, `kappav`, `kcedil`,
`kcy`, `kfr`, `kgreen`, `khcy`, `kjcy`, `kopf`, `kscr`, `l`, `lAarr`, `lArr`,
`lAtail`, `lBarr`, `lE`, `lEg`, `lHar`, `lacute`, `laemptyv`, `lagran`,
`lambda`, `lang`, `langd`, `langle`, `lap`, `laqu`, `laquo`, `larr`, `larrb`,
`larrbfs`, `larrfs`, `larrhk`, `larrlp`, `larrpl`, `larrsim`, `larrtl`, `lat`,
`latail`, `late`, `lates`, `lbarr`, `lbbrk`, `lbrace`, `lbrack`, `lbrke`,
`lbrksld`, `lbrkslu`, `lcaron`, `lcedil`, `lceil`, `lcub`, `lcy`, `ldca`,
`ldquo`, `ldquor`, `ldrdhar`, `ldrushar`, `ldsh`, `le`, `leftarrow`,
`leftarrowtail`, `leftharpoondown`, `leftharpoonup`, `leftleftarrows`,
`leftrightarrow`, `leftrightarrows`, `leftrightharpoons`, `leftrightsquigarrow`,
`leftthreetimes`, `leg`, `leq`, `leqq`, `leqslant`, `les`, `lescc`, `lesdot`,
`lesdoto`, `lesdotor`, `lesg`, `lesges`, `lessapprox`, `lessdot`, `lesseqgtr`,
`lesseqqgtr`, `lessgtr`, `lesssim`, `lfisht`, `lfloor`, `lfr`, `lg`, `lgE`,
`lhard`, `lharu`, `lharul`, `lhblk`, `ljcy`, `ll`, `llarr`, `llcorner`,
`llhard`, `lltri`, `lmidot`, `lmoust`, `lmoustache`, `lnE`, `lnap`, `lnapprox`,
`lne`, `lneq`, `lneqq`, `lnsim`, `loang`, `loarr`, `lobrk`, `longleftarrow`,
`longleftrightarrow`, `longmapsto`, `longrightarrow`, `looparrowleft`,
`looparrowright`, `lopar`, `lopf`, `loplus`, `lotimes`, `lowast`, `lowbar`,
`loz`, `lozenge`, `lozf`, `lpar`, `lparlt`, `lrarr`, `lrcorner`, `lrhar`,
`lrhard`, `lrm`, `lrtri`, `lsaquo`, `lscr`, `lsh`, `lsim`, `lsime`, `lsimg`,
`lsqb`, `lsquo`, `lsquor`, `lstrok`, `lt`, `ltcc`, `ltcir`, `ltdot`, `lthree`,
`ltimes`, `ltlarr`, `ltquest`, `ltrPar`, `ltri`, `ltrie`, `ltrif`, `lurdshar`,
`luruhar`, `lvertneqq`, `lvnE`, `mDDot`, `mac`, `macr`, `male`, `malt`,
`maltese`, `map`, `mapsto`, `mapstodown`, `mapstoleft`, `mapstoup`, `marker`,
`mcomma`, `mcy`, `mdash`, `measuredangle`, `mfr`, `mho`, `micr`, `micro`,
`mid`, `midast`, `midcir`, `middo`, `middot`, `minus`, `minusb`, `minusd`,
`minusdu`, `mlcp`, `mldr`, `mnplus`, `models`, `mopf`, `mp`, `mscr`, `mstpos`,
`mu`, `multimap`, `mumap`, `nGg`, `nGt`, `nGtv`, `nLeftarrow`,
`nLeftrightarrow`, `nLl`, `nLt`, `nLtv`, `nRightarrow`, `nVDash`, `nVdash`,
`nabla`, `nacute`, `nang`, `nap`, `napE`, `napid`, `napos`, `napprox`, `natur`,
`natural`, `naturals`, `nbs`, `nbsp`, `nbump`, `nbumpe`, `ncap`, `ncaron`,
`ncedil`, `ncong`, `ncongdot`, `ncup`, `ncy`, `ndash`, `ne`, `neArr`, `nearhk`,
`nearr`, `nearrow`, `nedot`, `nequiv`, `nesear`, `nesim`, `nexist`, `nexists`,
`nfr`, `ngE`, `nge`, `ngeq`, `ngeqq`, `ngeqslant`, `nges`, `ngsim`, `ngt`,
`ngtr`, `nhArr`, `nharr`, `nhpar`, `ni`, `nis`, `nisd`, `niv`, `njcy`, `nlArr`,
`nlE`, `nlarr`, `nldr`, `nle`, `nleftarrow`, `nleftrightarrow`, `nleq`,
`nleqq`, `nleqslant`, `nles`, `nless`, `nlsim`, `nlt`, `nltri`, `nltrie`,
`nmid`, `no`, `nopf`, `not`, `notin`, `notinE`, `notindot`, `notinva`,
`notinvb`, `notinvc`, `notni`, `notniva`, `notnivb`, `notnivc`, `npar`,
`nparallel`, `nparsl`, `npart`, `npolint`, `npr`, `nprcue`, `npre`, `nprec`,
`npreceq`, `nrArr`, `nrarr`, `nrarrc`, `nrarrw`, `nrightarrow`, `nrtri`,
`nrtrie`, `nsc`, `nsccue`, `nsce`, `nscr`, `nshortmid`, `nshortparallel`,
`nsim`, `nsime`, `nsimeq`, `nsmid`, `nspar`, `nsqsube`, `nsqsupe`, `nsub`,
`nsubE`, `nsube`, `nsubset`, `nsubseteq`, `nsubseteqq`, `nsucc`, `nsucceq`,
`nsup`, `nsupE`, `nsupe`, `nsupset`, `nsupseteq`, `nsupseteqq`, `ntgl`, `ntild`,
`ntilde`, `ntlg`, `ntriangleleft`, `ntrianglelefteq`, `ntriangleright`,
`ntrianglerighteq`, `nu`, `num`, `numero`, `numsp`, `nvDash`, `nvHarr`, `nvap`,
`nvdash`, `nvge`, `nvgt`, `nvinfin`, `nvlArr`, `nvle`, `nvlt`, `nvltrie`,
`nvrArr`, `nvrtrie`, `nvsim`, `nwArr`, `nwarhk`, `nwarr`, `nwarrow`, `nwnear`,
`oS`, `oacut`, `oacute`, `oast`, `ocir`, `ocir`, `ocirc`, `ocy`, `odash`,
`odblac`, `odiv`, `odot`, `odsold`, `oelig`, `ofcir`, `ofr`, `ogon`, `ograv`,
`ograve`, `ogt`, `ohbar`, `ohm`, `oint`, `olarr`, `olcir`, `olcross`, `oline`,
`olt`, `omacr`, `omega`, `omicron`, `omid`, `ominus`, `oopf`, `opar`, `operp`,
`oplus`, `or`, `orarr`, `ord`, `ord`, `ord`, `order`, `orderof`, `ordf`, `ordm`,
`origof`, `oror`, `orslope`, `orv`, `oscr`, `oslas`, `oslash`, `osol`, `otild`,
`otilde`, `otimes`, `otimesas`, `oum`, `ouml`, `ovbar`, `par`, `par`, `para`,
`parallel`, `parsim`, `parsl`, `part`, `pcy`, `percnt`, `period`, `permil`,
`perp`, `pertenk`, `pfr`, `phi`, `phiv`, `phmmat`, `phone`, `pi`, `pitchfork`,
`piv`, `planck`, `planckh`, `plankv`, `plus`, `plusacir`, `plusb`, `pluscir`,
`plusdo`, `plusdu`, `pluse`, `plusm`, `plusmn`, `plussim`, `plustwo`, `pm`,
`pointint`, `popf`, `poun`, `pound`, `pr`, `prE`, `prap`, `prcue`, `pre`,
`prec`, `precapprox`, `preccurlyeq`, `preceq`, `precnapprox`, `precneqq`,
`precnsim`, `precsim`, `prime`, `primes`, `prnE`, `prnap`, `prnsim`, `prod`,
`profalar`, `profline`, `profsurf`, `prop`, `propto`, `prsim`, `prurel`, `pscr`,
`psi`, `puncsp`, `qfr`, `qint`, `qopf`, `qprime`, `qscr`, `quaternions`,
`quatint`, `quest`, `questeq`, `quo`, `quot`, `rAarr`, `rArr`, `rAtail`,
`rBarr`, `rHar`, `race`, `racute`, `radic`, `raemptyv`, `rang`, `rangd`,
`range`, `rangle`, `raqu`, `raquo`, `rarr`, `rarrap`, `rarrb`, `rarrbfs`,
`rarrc`, `rarrfs`, `rarrhk`, `rarrlp`, `rarrpl`, `rarrsim`, `rarrtl`, `rarrw`,
`ratail`, `ratio`, `rationals`, `rbarr`, `rbbrk`, `rbrace`, `rbrack`, `rbrke`,
`rbrksld`, `rbrkslu`, `rcaron`, `rcedil`, `rceil`, `rcub`, `rcy`, `rdca`,
`rdldhar`, `rdquo`, `rdquor`, `rdsh`, `re`, `real`, `realine`, `realpart`,
`reals`, `rect`, `reg`, `rfisht`, `rfloor`, `rfr`, `rhard`, `rharu`, `rharul`,
`rho`, `rhov`, `rightarrow`, `rightarrowtail`, `rightharpoondown`,
`rightharpoonup`, `rightleftarrows`, `rightleftharpoons`, `rightrightarrows`,
`rightsquigarrow`, `rightthreetimes`, `ring`, `risingdotseq`, `rlarr`, `rlhar`,
`rlm`, `rmoust`, `rmoustache`, `rnmid`, `roang`, `roarr`, `robrk`, `ropar`,
`ropf`, `roplus`, `rotimes`, `rpar`, `rpargt`, `rppolint`, `rrarr`, `rsaquo`,
`rscr`, `rsh`, `rsqb`, `rsquo`, `rsquor`, `rthree`, `rtimes`, `rtri`, `rtrie`,
`rtrif`, `rtriltri`, `ruluhar`, `rx`, `sacute`, `sbquo`, `sc`, `scE`, `scap`,
`scaron`, `sccue`, `sce`, `scedil`, `scirc`, `scnE`, `scnap`, `scnsim`,
`scpolint`, `scsim`, `scy`, `sdot`, `sdotb`, `sdote`, `seArr`, `searhk`,
`searr`, `searrow`, `sec`, `sect`, `semi`, `seswar`, `setminus`, `setmn`,
`sext`, `sfr`, `sfrown`, `sh`, `sharp`, `shchcy`, `shcy`, `shortmid`,
`shortparallel`, `shy`, `sigma`, `sigmaf`, `sigmav`, `sim`, `simdot`, `sime`,
`simeq`, `simg`, `simgE`, `siml`, `simlE`, `simne`, `simplus`, `simrarr`,
`slarr`, `smallsetminus`, `smashp`, `smeparsl`, `smid`, `smile`, `smt`, `smte`,
`smtes`, `softcy`, `sol`, `solb`, `solbar`, `sopf`, `spades`, `spadesuit`,
`spar`, `sqcap`, `sqcaps`, `sqcup`, `sqcups`, `sqsub`, `sqsube`, `sqsubset`,
`sqsubseteq`, `sqsup`, `sqsupe`, `sqsupset`, `sqsupseteq`, `squ`, `square`,
`squarf`, `squf`, `srarr`, `sscr`, `ssetmn`, `ssmile`, `sstarf`, `star`,
`starf`, `straightepsilon`, `straightphi`, `strns`, `sub`, `subE`, `subdot`,
`sube`, `subedot`, `submult`, `subnE`, `subne`, `subplus`, `subrarr`, `subset`,
`subseteq`, `subseteqq`, `subsetneq`, `subsetneqq`, `subsim`, `subsub`,
`subsup`, `succ`, `succapprox`, `succcurlyeq`, `succeq`, `succnapprox`,
`succneqq`, `succnsim`, `succsim`, `sum`, `sung`, `sup`, `sup`, `sup`, `sup`,
`sup1`, `sup2`, `sup3`, `supE`, `supdot`, `supdsub`, `supe`, `supedot`,
`suphsol`, `suphsub`, `suplarr`, `supmult`, `supnE`, `supne`, `supplus`,
`supset`, `supseteq`, `supseteqq`, `supsetneq`, `supsetneqq`, `supsim`,
`supsub`, `supsup`, `swArr`, `swarhk`, `swarr`, `swarrow`, `swnwar`, `szli`,
`szlig`, `target`, `tau`, `tbrk`, `tcaron`, `tcedil`, `tcy`, `tdot`, `telrec`,
`tfr`, `there4`, `therefore`, `theta`, `thetasym`, `thetav`, `thickapprox`,
`thicksim`, `thinsp`, `thkap`, `thksim`, `thor`, `thorn`, `tilde`, `time`,
`times`, `timesb`, `timesbar`, `timesd`, `tint`, `toea`, `top`, `topbot`,
`topcir`, `topf`, `topfork`, `tosa`, `tprime`, `trade`, `triangle`,
`triangledown`, `triangleleft`, `trianglelefteq`, `triangleq`, `triangleright`,
`trianglerighteq`, `tridot`, `trie`, `triminus`, `triplus`, `trisb`, `tritime`,
`trpezium`, `tscr`, `tscy`, `tshcy`, `tstrok`, `twixt`, `twoheadleftarrow`,
`twoheadrightarrow`, `uArr`, `uHar`, `uacut`, `uacute`, `uarr`, `ubrcy`,
`ubreve`, `ucir`, `ucirc`, `ucy`, `udarr`, `udblac`, `udhar`, `ufisht`, `ufr`,
`ugrav`, `ugrave`, `uharl`, `uharr`, `uhblk`, `ulcorn`, `ulcorner`, `ulcrop`,
`ultri`, `um`, `umacr`, `uml`, `uogon`, `uopf`, `uparrow`, `updownarrow`,
`upharpoonleft`, `upharpoonright`, `uplus`, `upsi`, `upsih`, `upsilon`,
`upuparrows`, `urcorn`, `urcorner`, `urcrop`, `uring`, `urtri`, `uscr`, `utdot`,
`utilde`, `utri`, `utrif`, `uuarr`, `uum`, `uuml`, `uwangle`, `vArr`, `vBar`,
`vBarv`, `vDash`, `vangrt`, `varepsilon`, `varkappa`, `varnothing`, `varphi`,
`varpi`, `varpropto`, `varr`, `varrho`, `varsigma`, `varsubsetneq`,
`varsubsetneqq`, `varsupsetneq`, `varsupsetneqq`, `vartheta`, `vartriangleleft`,
`vartriangleright`, `vcy`, `vdash`, `vee`, `veebar`, `veeeq`, `vellip`,
`verbar`, `vert`, `vfr`, `vltri`, `vnsub`, `vnsup`, `vopf`, `vprop`, `vrtri`,
`vscr`, `vsubnE`, `vsubne`, `vsupnE`, `vsupne`, `vzigzag`, `wcirc`, `wedbar`,
`wedge`, `wedgeq`, `weierp`, `wfr`, `wopf`, `wp`, `wr`, `wreath`, `wscr`,
`xcap`, `xcirc`, `xcup`, `xdtri`, `xfr`, `xhArr`, `xharr`, `xi`, `xlArr`,
`xlarr`, `xmap`, `xnis`, `xodot`, `xopf`, `xoplus`, `xotime`, `xrArr`, `xrarr`,
`xscr`, `xsqcup`, `xuplus`, `xutri`, `xvee`, `xwedge`, `yacut`, `yacute`,
`yacy`, `ycirc`, `ycy`, `ye`, `yen`, `yfr`, `yicy`, `yopf`, `yscr`, `yucy`,
`yum`, `yuml`, `zacute`, `zcaron`, `zcy`, `zdot`, `zeetrf`, `zeta`, `zfr`,
`zhcy`, `zigrarr`, `zopf`, `zscr`, `zwj`, or `zwnj`.

## 14 Acknowledgments

Thanks to John Gruber for inventing Markdown.

Thanks to John MacFarlane for defining CommonMark.

Thanks to ZEIT, Inc., Gatsby, Inc., Netlify, Inc., Holloway, Inc., and the many
organizations and individuals for financial support through
[OpenCollective](https://opencollective.com/unified)

## 15 License

Copyright © 2019 Titus Wormer.
This work is licensed under a
[Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

[ceof]: #ceof

[cvs]: #cvs

[ascii-digit]: #ascii-digit

[ascii-upper-hex-digit]: #ascii-upper-hex-digit

[ascii-lower-hex-digit]: #ascii-lower-hex-digit

[ascii-hex-digit]: #ascii-hex-digit

[ascii-upper-alpha]: #ascii-upper-alpha

[ascii-lower-alpha]: #ascii-lower-alpha

[ascii-alpha]: #ascii-alpha

[ascii-alphanumeric]: #ascii-alphanumeric

[ascii-punctuation]: #ascii-punctuation

[ascii-control]: #ascii-control

[ascii-lowercase]: #ascii-lowercase

[unicode-whitespace]: #unicode-whitespace

[unicode-punctuation]: #unicode-punctuation

[surrogate]: #surrogate

[noncharacter]: #noncharacter

[input-stream]: #input-stream

[input-character]: #input-character

[stack-of-open-groups]: #stack-of-open-groups

[current-group]: #current-group

[queue]: #queue

[current-token]: #current-token

[process-as-an-atx-heading]: #process-as-an-atx-heading

[process-as-a-setext-primary-heading]: #process-as-a-setext-primary-heading

[process-as-an-asterisk-line]: #process-as-an-asterisk-line

[process-as-an-asterisk-line-opening]: #process-as-an-asterisk-line-opening

[process-as-a-fenced-code-fence]: #process-as-a-fenced-code-fence

[process-as-content]: #process-as-content

[process-as-a-paragraph]: #process-as-a-paragraph

[process-as-a-string]: #process-as-a-string

[process-as-phrasing]: #process-as-phrasing

[raw-tag]: #raw-tag

[simple-tag]: #simple-tag

[control-replacement]: #control-replacement

[character-reference-name]: #character-reference-name

[s-initial]: #71-initial-state

[s-initial-whitespace]: #72-initial-whitespace-state

[s-line-ending]: #73-line-ending-state

[s-carriage-return]: #74-carriage-return-state

[s-in-line]: #75-in-line-state

[s-atx-heading-opening-sequence]: #76-atx-heading-opening-sequence-state

[s-atx-heading-opening-sequence-after]: #77-atx-heading-opening-sequence-after-state

[s-atx-heading-content]: #78-atx-heading-content-state

[s-atx-heading-whitespace]: #79-atx-heading-whitespace-state

[s-atx-heading-number-sign-sequence]: #710-atx-heading-number-sign-sequence-state

[s-asterisk-line-asterisk-after]: #711-asterisk-line-asterisk-after-state

[s-asterisk-line-whitespace]: #712-asterisk-line-whitespace-state

[s-html-block-open]: #713-html-block-open-state

[s-html-block-open-markup-declaration]: #714-html-block-open-markup-declaration-state

[s-html-block-open-comment-inside]: #715-html-block-open-comment-inside-state

[s-html-block-open-character-data-inside]: #716-html-block-open-character-data-inside-state

[s-html-block-open-tag-name-inside]: #717-html-block-open-tag-name-inside-state

[s-html-block-open-simple-self-closing-tag]: #718-html-block-open-simple-self-closing-tag-state

[s-html-block-open-complete-attribute-before]: #719-html-block-open-complete-attribute-before-state

[s-html-block-open-complete-attribute-name]: #720-html-block-open-complete-attribute-name-state

[s-html-block-open-complete-attribute-name-after]: #721-html-block-open-complete-attribute-name-after-state

[s-html-block-open-complete-attribute-value-before]: #722-html-block-open-complete-attribute-value-before-state

[s-html-block-open-complete-double-quoted-attribute-value]: #723-html-block-open-complete-double-quoted-attribute-value-state

[s-html-block-open-complete-single-quoted-attribute-value]: #724-html-block-open-complete-single-quoted-attribute-value-state

[s-html-block-open-complete-unquoted-attribute-value]: #725-html-block-open-complete-unquoted-attribute-value-state

[s-html-block-open-complete-self-closing-tag]: #726-html-block-open-complete-self-closing-tag-state

[s-html-block-open-complete-tag-after]: #727-html-block-open-complete-tag-after-state

[s-html-block-continuation-line]: #728-html-block-continuation-line-state

[s-html-block-continuation-close-tag]: #729-html-block-continuation-close-tag-state

[s-html-block-continuation-close-tag-name-inside]: #730-html-block-continuation-close-tag-name-inside-state

[s-html-block-continuation-comment-inside]: #731-html-block-continuation-comment-inside-state

[s-html-block-continuation-character-data-inside]: #732-html-block-continuation-character-data-inside-state

[s-html-block-continuation-declaration-before]: #733-html-block-continuation-declaration-before-state

[s-html-block-close-line]: #734-html-block-close-line-state

[s-setext-heading-underline-equals-to-sequence]: #735-setext-heading-underline-equals-to-sequence-state

[s-setext-heading-underline-equals-to-after]: #736-setext-heading-underline-equals-to-after-state

[s-fenced-code-grave-accent-opening-fence]: #737-fenced-code-grave-accent-opening-fence-state

[s-fenced-code-grave-accent-opening-fence-whitespace]: #738-fenced-code-grave-accent-opening-fence-whitespace-state

[s-fenced-code-grave-accent-opening-fence-metadata]: #739-fenced-code-grave-accent-opening-fence-metadata-state

[s-fenced-code-tilde-opening-fence]: #740-fenced-code-tilde-opening-fence-state

[s-fenced-code-tilde-opening-fence-whitespace]: #741-fenced-code-tilde-opening-fence-whitespace-state

[s-fenced-code-tilde-opening-fence-metadata]: #742-fenced-code-tilde-opening-fence-metadata-state

[s-fenced-code-continuation-line]: #743-fenced-code-continuation-line-state

[s-fenced-code-close-sequence]: #744-fenced-code-close-sequence-state

[s-fenced-code-close-whitespace]: #745-fenced-code-close-whitespace-state

[s-indented-code-line]: #746-indented-code-line-state

[s-content-continuation]: #747-content-continuation-state

[t-whitespace]: #81-whitespace-token

[t-line-ending]: #82-line-ending-token

[t-end-of-file]: #83-end-of-file-token

[t-marker]: #84-marker-token

[t-sequence]: #85-sequence-token

[t-content]: #86-content-token

[g-blank-line]: #91-blank-line-group

[g-atx-heading]: #92-atx-heading-group

[g-atx-heading-fence]: #93-atx-heading-fence-group

[g-atx-heading-content]: #94-atx-heading-content-group

[g-thematic-break]: #95-thematic-break-group

[g-html]: #96-html-group

[g-html-line]: #97-html-line-group

[g-indented-code]: #98-indented-code-group

[g-indented-code-line]: #99-indented-code-line-group

[g-blockquote]: #910-blockquote-group

[g-fenced-code]: #911-fenced-code-group

[g-fenced-code-fence]: #912-fenced-code-fence-group

[g-fenced-code-language]: #913-fenced-code-language-group

[g-fenced-code-metadata]: #914-fenced-code-metadata-group

[g-fenced-code-line]: #915-fenced-code-line-group

[g-content]: #916-content-group

[g-content-line]: #917-content-line-group

[g-setext-heading]: #918-setext-heading-group

[g-setext-heading-content]: #919-setext-heading-content-group

[g-setext-heading-underline]: #920-setext-heading-underline-group

[g-definition]: #921-definition-group

[g-definition-label]: #922-definition-label-group

[g-definition-label-content]: #923-definition-label-content-group

[g-definition-destination-quoted]: #924-definition-destination-quoted-group

[g-definition-destination-unquoted]: #925-definition-destination-unquoted-group

[g-definition-title]: #926-definition-title-group

[g-paragraph]: #927-paragraph-group
