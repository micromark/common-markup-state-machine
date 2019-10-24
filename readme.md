# CMSM

> Common markup state machine.

Together, the parsing rules described below define what is referred to as a
Common Markup parser.

> This document is currently in progress.
>
> It is developed jointly with a reference parser:
> [`micromark`](https://github.com/micromark/micromark).
>
> Contributions are welcome.
>
> Some parts are still in progress:
>
> *   <a id="stack-of-continuation" href="#stack-of-continuation">**Stack of continuation**</a> (`>` and `␠␠` for blockquote and list items)
> *   Extensions
> *   Emphasis, strong, links, images, hard line breaks
> *   Lots of infra algorithms

## Table of contents

*   [1 Background](#1-background)
*   [2 Overview](#2-overview)
*   [3 Characters](#3-characters)
    *   [3.1 Conceptual characters](#31-conceptual-characters)
    *   [3.2 Tabs](#32-tabs)
    *   [3.3 Character groups](#33-character-groups)
*   [4 Input stream](#4-input-stream)
*   [5 Content stream](#5-content-stream)
*   [6 State](#6-state)
*   [7 Actions](#7-actions)
    *   [7.1 Consume](#71-consume)
    *   [7.2 Enqueue](#72-enqueue)
    *   [7.3 Emit](#73-emit)
    *   [7.4 Open](#74-open)
    *   [7.5 Close](#75-close)
*   [8 Tokenization](#8-tokenization)
*   [9 Block state machine](#9-block-state-machine)
    *   [9.1 Initial state](#91-initial-state)
    *   [9.2 Initial whitespace state](#92-initial-whitespace-state)
    *   [9.3 Line ending state](#93-line-ending-state)
    *   [9.4 Carriage return state](#94-carriage-return-state)
    *   [9.5 In line state](#95-in-line-state)
    *   [9.6 ATX heading open sequence state](#96-atx-heading-open-sequence-state)
    *   [9.7 ATX heading open sequence after state](#97-atx-heading-open-sequence-after-state)
    *   [9.8 ATX heading content state](#98-atx-heading-content-state)
    *   [9.9 ATX heading whitespace state](#99-atx-heading-whitespace-state)
    *   [9.10 ATX heading number sign sequence state](#910-atx-heading-number-sign-sequence-state)
    *   [9.11 Asterisk line asterisk after state](#911-asterisk-line-asterisk-after-state)
    *   [9.12 Asterisk line whitespace state](#912-asterisk-line-whitespace-state)
    *   [9.13 HTML block open state](#913-html-block-open-state)
    *   [9.14 HTML block open markup declaration state](#914-html-block-open-markup-declaration-state)
    *   [9.15 HTML block open comment inside state](#915-html-block-open-comment-inside-state)
    *   [9.16 HTML block open character data inside state](#916-html-block-open-character-data-inside-state)
    *   [9.17 HTML block open close tag start state](#917-html-block-open-close-tag-start-state)
    *   [9.18 HTML block open tag name inside state](#918-html-block-open-tag-name-inside-state)
    *   [9.19 HTML block open simple self closing state](#919-html-block-open-simple-self-closing-state)
    *   [9.20 HTML block open complete attribute before state](#920-html-block-open-complete-attribute-before-state)
    *   [9.21 HTML block open complete attribute name state](#921-html-block-open-complete-attribute-name-state)
    *   [9.22 HTML block open complete attribute name after state](#922-html-block-open-complete-attribute-name-after-state)
    *   [9.23 HTML block open complete attribute value before state](#923-html-block-open-complete-attribute-value-before-state)
    *   [9.24 HTML block open complete double quoted attribute value state](#924-html-block-open-complete-double-quoted-attribute-value-state)
    *   [9.25 HTML block open complete single quoted attribute value state](#925-html-block-open-complete-single-quoted-attribute-value-state)
    *   [9.26 HTML block open complete unquoted attribute value state](#926-html-block-open-complete-unquoted-attribute-value-state)
    *   [9.27 HTML block open complete self closing state](#927-html-block-open-complete-self-closing-state)
    *   [9.28 HTML block open complete tag after state](#928-html-block-open-complete-tag-after-state)
    *   [9.29 HTML block continuation line state](#929-html-block-continuation-line-state)
    *   [9.30 HTML block continuation tag close state](#930-html-block-continuation-tag-close-state)
    *   [9.31 HTML block continuation tag close name inside state](#931-html-block-continuation-tag-close-name-inside-state)
    *   [9.32 HTML block continuation comment inside state](#932-html-block-continuation-comment-inside-state)
    *   [9.33 HTML block continuation character data inside state](#933-html-block-continuation-character-data-inside-state)
    *   [9.34 HTML block continuation declaration before state](#934-html-block-continuation-declaration-before-state)
    *   [9.35 HTML block close line state](#935-html-block-close-line-state)
    *   [9.36 Setext heading underline equals to sequence state](#936-setext-heading-underline-equals-to-sequence-state)
    *   [9.37 Setext heading underline equals to after state](#937-setext-heading-underline-equals-to-after-state)
    *   [9.38 Fenced code grave accent fence open state](#938-fenced-code-grave-accent-fence-open-state)
    *   [9.39 Fenced code grave accent fence open whitespace state](#939-fenced-code-grave-accent-fence-open-whitespace-state)
    *   [9.40 Fenced code grave accent fence open metadata state](#940-fenced-code-grave-accent-fence-open-metadata-state)
    *   [9.41 Fenced code tilde fence open state](#941-fenced-code-tilde-fence-open-state)
    *   [9.42 Fenced code tilde fence open whitespace state](#942-fenced-code-tilde-fence-open-whitespace-state)
    *   [9.43 Fenced code tilde fence open metadata state](#943-fenced-code-tilde-fence-open-metadata-state)
    *   [9.44 Fenced code continuation line state](#944-fenced-code-continuation-line-state)
    *   [9.45 Fenced code close sequence state](#945-fenced-code-close-sequence-state)
    *   [9.46 Fenced code close whitespace state](#946-fenced-code-close-whitespace-state)
    *   [9.47 Indented code line state](#947-indented-code-line-state)
    *   [9.48 Content continuation state](#948-content-continuation-state)
*   [10 Content state machine](#10-content-state-machine)
    *   [10.1 Initial content state](#101-initial-content-state)
    *   [10.2 Definition label open after state](#102-definition-label-open-after-state)
    *   [10.3 Definition label before state](#103-definition-label-before-state)
    *   [10.4 Definition label inside state](#104-definition-label-inside-state)
    *   [10.5 Definition label inside start after state](#105-definition-label-inside-start-after-state)
    *   [10.6 Definition label between state](#106-definition-label-between-state)
    *   [10.7 Definition label escape state](#107-definition-label-escape-state)
    *   [10.8 Definition label close after state](#108-definition-label-close-after-state)
    *   [10.9 Definition label after state](#109-definition-label-after-state)
    *   [10.10 Definition destination before state](#1010-definition-destination-before-state)
    *   [10.11 Definition destination quoted open after state](#1011-definition-destination-quoted-open-after-state)
    *   [10.12 Definition destination quoted inside state](#1012-definition-destination-quoted-inside-state)
    *   [10.13 Definition destination quoted escape state](#1013-definition-destination-quoted-escape-state)
    *   [10.14 Definition destination quoted close after state](#1014-definition-destination-quoted-close-after-state)
    *   [10.15 Definition destination unquoted inside state](#1015-definition-destination-unquoted-inside-state)
    *   [10.16 Definition destination unquoted escape state](#1016-definition-destination-unquoted-escape-state)
    *   [10.17 Definition destination after state](#1017-definition-destination-after-state)
    *   [10.18 Definition title double quoted open after state](#1018-definition-title-double-quoted-open-after-state)
    *   [10.19 Definition title double quoted inside state](#1019-definition-title-double-quoted-inside-state)
    *   [10.20 Definition title double quoted escape state](#1020-definition-title-double-quoted-escape-state)
    *   [10.21 Definition title single quoted open after state](#1021-definition-title-single-quoted-open-after-state)
    *   [10.22 Definition title single quoted inside state](#1022-definition-title-single-quoted-inside-state)
    *   [10.23 Definition title single quoted escape state](#1023-definition-title-single-quoted-escape-state)
    *   [10.24 Definition title paren quoted open after state](#1024-definition-title-paren-quoted-open-after-state)
    *   [10.25 Definition title paren quoted inside state](#1025-definition-title-paren-quoted-inside-state)
    *   [10.26 Definition title paren quoted escape state](#1026-definition-title-paren-quoted-escape-state)
    *   [10.27 Definition title close after state](#1027-definition-title-close-after-state)
    *   [10.28 Definition after state](#1028-definition-after-state)
    *   [10.29 Phrasing content state](#1029-phrasing-content-state)
*   [11 Inline state machine](#11-inline-state-machine)
    *   [11.1 Initial inline state](#111-initial-inline-state)
    *   [11.2 Emphasis asterisk state](#112-emphasis-asterisk-state)
    *   [11.3 Character reference state](#113-character-reference-state)
    *   [11.4 Character reference named state](#114-character-reference-named-state)
    *   [11.5 Character reference numeric state](#115-character-reference-numeric-state)
    *   [11.6 Character reference hexadecimal start state](#116-character-reference-hexadecimal-start-state)
    *   [11.7 Character reference hexadecimal state](#117-character-reference-hexadecimal-state)
    *   [11.8 Character reference decimal state](#118-character-reference-decimal-state)
    *   [11.9 Code span open state](#119-code-span-open-state)
    *   [11.10 Code span inside start after state](#1110-code-span-inside-start-after-state)
    *   [11.11 Code span inside state](#1111-code-span-inside-state)
    *   [11.12 Code span close state](#1112-code-span-close-state)
    *   [11.13 Emphasis underscore state](#1113-emphasis-underscore-state)
    *   [11.14 Escape backslash after state](#1114-escape-backslash-after-state)
    *   [11.15 Image exclamation mark after state](#1115-image-exclamation-mark-after-state)
    *   [11.16 HTML or autolink less than after state](#1116-html-or-autolink-less-than-after-state)
    *   [11.17 HTML instruction or email atext state](#1117-html-instruction-or-email-atext-state)
    *   [11.18 HTML instruction close or email atext state](#1118-html-instruction-close-or-email-atext-state)
    *   [11.19 HTML instruction or email at sign or dot state](#1119-html-instruction-or-email-at-sign-or-dot-state)
    *   [11.20 HTML instruction or email label state](#1120-html-instruction-or-email-label-state)
    *   [11.21 HTML instruction or email dash state](#1121-html-instruction-or-email-dash-state)
    *   [11.22 HTML instruction state](#1122-html-instruction-state)
    *   [11.23 HTML instruction close state](#1123-html-instruction-close-state)
    *   [11.24 HTML declaration or email atext state](#1124-html-declaration-or-email-atext-state)
    *   [11.25 HTML comment open inside or email atext state](#1125-html-comment-open-inside-or-email-atext-state)
    *   [11.26 HTML comment or email atext state](#1126-html-comment-or-email-atext-state)
    *   [11.27 HTML comment close inside or email atext state](#1127-html-comment-close-inside-or-email-atext-state)
    *   [11.28 HTML comment close or email atext state](#1128-html-comment-close-or-email-atext-state)
    *   [11.29 HTML comment or email at sign or dot state](#1129-html-comment-or-email-at-sign-or-dot-state)
    *   [11.30 HTML comment or email label state](#1130-html-comment-or-email-label-state)
    *   [11.31 HTML comment close inside or email label dash state](#1131-html-comment-close-inside-or-email-label-dash-state)
    *   [11.32 HTML comment close or email label dash state](#1132-html-comment-close-or-email-label-dash-state)
    *   [11.33 HTML comment state](#1133-html-comment-state)
    *   [11.34 HTML comment close inside state](#1134-html-comment-close-inside-state)
    *   [11.35 HTML comment close state](#1135-html-comment-close-state)
    *   [11.36 HTML CDATA state](#1136-html-cdata-state)
    *   [11.37 HTML declaration name or email atext state](#1137-html-declaration-name-or-email-atext-state)
    *   [11.38 HTML declaration between state](#1138-html-declaration-between-state)
    *   [11.39 HTML declaration content state](#1139-html-declaration-content-state)
    *   [11.40 HTML tag close or email atext state](#1140-html-tag-close-or-email-atext-state)
    *   [11.41 HTML tag close inside or email atext state](#1141-html-tag-close-inside-or-email-atext-state)
    *   [11.42 HTML tag close between state](#1142-html-tag-close-between-state)
    *   [11.43 HTML tag open scheme or email atext state](#1143-html-tag-open-scheme-or-email-atext-state)
    *   [11.44 HTML tag open inside scheme inside or email atext state](#1144-html-tag-open-inside-scheme-inside-or-email-atext-state)
    *   [11.45 HTML tag open inside or email atext state](#1145-html-tag-open-inside-or-email-atext-state)
    *   [11.46 HTML tag open between start after state](#1146-html-tag-open-between-start-after-state)
    *   [11.47 HTML tag open between state](#1147-html-tag-open-between-state)
    *   [11.48 HTML tag open attribute name state](#1148-html-tag-open-attribute-name-state)
    *   [11.49 HTML tag open attribute name after state](#1149-html-tag-open-attribute-name-after-state)
    *   [11.50 HTML tag open attribute value before state](#1150-html-tag-open-attribute-value-before-state)
    *   [11.51 HTML tag open double quoted attribute value state](#1151-html-tag-open-double-quoted-attribute-value-state)
    *   [11.52 HTML tag open single quoted attribute value state](#1152-html-tag-open-single-quoted-attribute-value-state)
    *   [11.53 HTML tag open unquoted attribute value state](#1153-html-tag-open-unquoted-attribute-value-state)
    *   [11.54 HTML tag open self closing state](#1154-html-tag-open-self-closing-state)
    *   [11.55 Autolink scheme inside or email atext state](#1155-autolink-scheme-inside-or-email-atext-state)
    *   [11.56 Autolink URI inside state](#1156-autolink-uri-inside-state)
    *   [11.57 Autolink email atext state](#1157-autolink-email-atext-state)
    *   [11.58 Autolink email label state](#1158-autolink-email-label-state)
    *   [11.59 Autolink email at sign or dot state](#1159-autolink-email-at-sign-or-dot-state)
    *   [11.60 Autolink email dash state](#1160-autolink-email-dash-state)
*   [12 Labels](#12-labels)
    *   [12.1 Content phrasing label](#121-content-phrasing-label)
    *   [12.2 Content definition label](#122-content-definition-label)
    *   [12.3 Content definition partial label](#123-content-definition-partial-label)
    *   [12.4 Content definition label open label](#124-content-definition-label-open-label)
    *   [12.5 Content definition label close label](#125-content-definition-label-close-label)
    *   [12.6 Content definition destination quoted open label](#126-content-definition-destination-quoted-open-label)
    *   [12.7 Content definition destination quoted close label](#127-content-definition-destination-quoted-close-label)
    *   [12.8 Content definition destination unquoted open label](#128-content-definition-destination-unquoted-open-label)
    *   [12.9 Content definition destination unquoted close label](#129-content-definition-destination-unquoted-close-label)
    *   [12.10 Content definition title open label](#1210-content-definition-title-open-label)
    *   [12.11 Content definition title close label](#1211-content-definition-title-close-label)
    *   [12.12 Text link open label](#1212-text-link-open-label)
    *   [12.13 Text image open label](#1213-text-image-open-label)
    *   [12.14 Text link close label](#1214-text-link-close-label)
    *   [12.15 Text emphasis label](#1215-text-emphasis-label)
    *   [12.16 Text character reference label](#1216-text-character-reference-label)
    *   [12.17 Text escape label](#1217-text-escape-label)
    *   [12.18 Text code label](#1218-text-code-label)
    *   [12.19 Text autolink email label](#1219-text-autolink-email-label)
    *   [12.20 Text autolink URI label](#1220-text-autolink-uri-label)
    *   [12.21 Text HTML label](#1221-text-html-label)
*   [13 Processing](#13-processing)
    *   [13.1 Process as an ATX heading](#131-process-as-an-atx-heading)
    *   [13.2 Process as a Setext primary heading](#132-process-as-a-setext-primary-heading)
    *   [13.3 Process as an asterisk line](#133-process-as-an-asterisk-line)
    *   [13.4 Process as an asterisk line opening](#134-process-as-an-asterisk-line-opening)
    *   [13.5 Process as a Fenced code fence](#135-process-as-a-fenced-code-fence)
    *   [13.6 Process as Content](#136-process-as-content)
    *   [13.7 Process as Raw text](#137-process-as-raw-text)
    *   [13.8 Process as Phrasing](#138-process-as-phrasing)
    *   [13.9 Process as Text](#139-process-as-text)
*   [14 Tokens](#14-tokens)
    *   [14.1 Whitespace token](#141-whitespace-token)
    *   [14.2 Line terminator token](#142-line-terminator-token)
    *   [14.3 End-of-file token](#143-end-of-file-token)
    *   [14.4 End-of-line token](#144-end-of-line-token)
    *   [14.5 Marker token](#145-marker-token)
    *   [14.6 Sequence token](#146-sequence-token)
    *   [14.7 Content token](#147-content-token)
*   [15 Groups](#15-groups)
    *   [15.1 Blank line group](#151-blank-line-group)
    *   [15.2 ATX heading group](#152-atx-heading-group)
    *   [15.3 ATX heading fence group](#153-atx-heading-fence-group)
    *   [15.4 ATX heading content group](#154-atx-heading-content-group)
    *   [15.5 Thematic break group](#155-thematic-break-group)
    *   [15.6 HTML group](#156-html-group)
    *   [15.7 HTML line group](#157-html-line-group)
    *   [15.8 Indented code group](#158-indented-code-group)
    *   [15.9 Indented code line group](#159-indented-code-line-group)
    *   [15.10 Blockquote group](#1510-blockquote-group)
    *   [15.11 Fenced code group](#1511-fenced-code-group)
    *   [15.12 Fenced code fence group](#1512-fenced-code-fence-group)
    *   [15.13 Fenced code language group](#1513-fenced-code-language-group)
    *   [15.14 Fenced code metadata group](#1514-fenced-code-metadata-group)
    *   [15.15 Fenced code line group](#1515-fenced-code-line-group)
    *   [15.16 Content group](#1516-content-group)
    *   [15.17 Content line group](#1517-content-line-group)
    *   [15.18 Setext heading group](#1518-setext-heading-group)
    *   [15.19 Setext heading underline group](#1519-setext-heading-underline-group)
    *   [15.20 Definition group](#1520-definition-group)
    *   [15.21 Definition label group](#1521-definition-label-group)
    *   [15.22 Definition label content group](#1522-definition-label-content-group)
    *   [15.23 Definition destination quoted group](#1523-definition-destination-quoted-group)
    *   [15.24 Definition destination unquoted group](#1524-definition-destination-unquoted-group)
    *   [15.25 Definition title group](#1525-definition-title-group)
    *   [15.26 Escape group](#1526-escape-group)
    *   [15.27 Character reference group](#1527-character-reference-group)
    *   [15.28 Automatic link group](#1528-automatic-link-group)
    *   [15.29 HTML inline group](#1529-html-inline-group)
*   [16 Appendix](#16-appendix)
    *   [16.1 Raw tags](#161-raw-tags)
    *   [16.2 Simple tags](#162-simple-tags)
    *   [16.3 Named character references](#163-named-character-references)
*   [17 References](#17-references)
*   [18 Acknowledgments](#18-acknowledgments)
*   [19 License](#19-license)

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

An <a id="ceol" href="#ceol">**EOL**</a> character is a conceptual character representing a break between
two runs of text.

A <a id="cvs" href="#cvs">**VIRTUAL SPACE**</a> character is a conceptual character representing an expanded column
size of a U+0009 CHARACTER TABULATION (HT).

EOF, EOL, and VIRTUAL SPACE are not real characters, but rather represent the lack of
any further characters, a break between characters, or a character increase the
size of a character.

### 3.2 Tabs

Tabs (U+0009 CHARACTER TABULATION (HT)) are typically not expanded into spaces, but do behave as if they
were replaced by spaces with a tab stop of 4 characters.
These character increments are represented by [VIRTUAL SPACE][cvs] characters.

For the following markup (where `␉` represent a tab):

```markdown
>␉␉a
```

We have the characters: U+003E GREATER THAN (`>`), U+0009 CHARACTER TABULATION (HT), VIRTUAL SPACE, VIRTUAL SPACE, U+0009 CHARACTER TABULATION (HT), VIRTUAL SPACE, VIRTUAL SPACE, VIRTUAL SPACE, and U+0061 (`a`).

When transforming to an output format, tab characters that are not part of
syntax should be present in the output format.
When the tab itself (and zero or more VIRTUAL SPACE characters) are part of syntax, but
some VIRTUAL SPACE characters are not, the remaining VIRTUAL SPACE characters should be considered
a prefix of the content.

### 3.3 Character groups

An <a id="ascii-digit" href="#ascii-digit">**ASCII digit**</a> is a character in the inclusive range U+0030 (`0`) to U+0039 (`9`).

An <a id="ascii-hex-digit" href="#ascii-hex-digit">**ASCII hex digit**</a> is an [ASCII digit][ascii-digit] or a character in the
inclusive ranges U+0041 (`A`) to U+0046 (`F`) or U+0061 (`a`) to U+0066 (`f`).

An <a id="ascii-upper-alpha" href="#ascii-upper-alpha">**ASCII upper alpha**</a> is a character in the inclusive range U+0041 (`A`) to U+005A (`Z`).

An <a id="ascii-lower-alpha" href="#ascii-lower-alpha">**ASCII lower alpha**</a> is a character in the inclusive range U+0061 (`a`) to U+007A (`z`).

An <a id="ascii-alpha" href="#ascii-alpha">**ASCII alpha**</a> is an [ASCII upper alpha][ascii-upper-alpha] or [ASCII lower alpha][ascii-lower-alpha].

An <a id="ascii-alphanumeric" href="#ascii-alphanumeric">**ASCII alphanumeric**</a> is an [ASCII digit][ascii-digit] or [ASCII alpha][ascii-alpha].

An <a id="ascii-punctuation" href="#ascii-punctuation">**ASCII punctuation**</a> is a character in the inclusive ranges U+0021 EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`)
to U+0040 AT SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).

An <a id="ascii-control" href="#ascii-control">**ASCII control**</a> is a character in the inclusive range U+0000 NULL (NUL) to U+001F (US), or
U+007F (DEL).

To <a id="ascii-lowercase" href="#ascii-lowercase">**ASCII-lowercase**</a> a character, is to increase it by 0x20 if it is in the
inclusive range U+0041 (`A`) to U+005A (`Z`).

A <a id="unicode-whitespace" href="#unicode-whitespace">**Unicode whitespace**</a> is a character in the Unicode `Zs` (Separator, Space)
category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF), U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).

A <a id="unicode-punctuation" href="#unicode-punctuation">**Unicode punctuation**</a> is a character in the Unicode `Pc` (Punctuation,
Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
(Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
(Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an [ASCII
punctuation][ascii-punctuation] (**\[UNICODE]**).

An <a id="atext" href="#atext">**atext**</a> is an [ASCII alphanumeric][ascii-alphanumeric], or a character in the inclusive
ranges U+0023 NUMBER SIGN (`#`) to U+0027 APOSTROPHE (`'`), U+002A ASTERISK (`*`), U+002B PLUS SIGN (`+`), U+002D DASH (`-`), U+002F SLASH (`/`), U+003D EQUALS TO (`=`), U+003F QUESTION MARK (`?`), U+005E CARET (`^`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`)
(**\[RFC5322]**).

> ❗️ Todo:
>
> *   [Unicode whitespace][unicode-whitespace] and [Unicode punctuation][unicode-punctuation] are used by emphasis
>     and importance

## 4 Input stream

The <a id="input-stream" href="#input-stream">**input stream**</a> consists of the characters pushed into it.

The <a id="input-character" href="#input-character">**input character**</a> is the first character in the [input stream][input-stream] that has
not yet been consumed.
Initially, the input character is the first character in the input.
Finally, when all character are consumed, the input character is an [EOF][ceof].

Any occurrences of U+0009 CHARACTER TABULATION (HT) in the [input stream][input-stream] is represented by that character
and 0-3 [VIRTUAL SPACE][cvs] characters.

## 5 Content stream

The <a id="content-stream" href="#content-stream">**content stream**</a> is similar to the [input stream][input-stream], but is used to parse
content.

The <a id="content-character" href="#content-character">**content character**</a> is the first character in the [content stream][content-stream] that
has not yet been consumed.
When a run of text is consumed and there is a next run of text, the text
character is an [EOL][ceol].
Finally, when all character are consumed, the content character is an [EOF][ceof].

Any occurrences of U+0009 CHARACTER TABULATION (HT) in the [content stream][content-stream] is represented *only* by that
character.

## 6 State

Initially, the <a id="stack-of-open-groups" href="#stack-of-open-groups">**stack of open groups**</a> is empty.
The stack grows downwards; the topmost group on the stack is the first one
opened, and the bottommost group of the stack is the last group still open.

The <a id="current-group" href="#current-group">**current group**</a> is the bottommost group in this [stack of open groups][stack-of-open-groups].

The <a id="queue" href="#queue">**queue**</a> is a list of tokens.
The <a id="current-token" href="#current-token">**current token**</a> is the last token in the [queue][queue].

## 7 Actions

### 7.1 Consume

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

### 7.2 Enqueue

To enqueue a token is to add it to the [queue][queue].

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

### 7.3 Emit

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

### 7.4 Open

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

    If the [current group][current-group] is a [*Content group*][g-content] or an [*Indented code group*][g-indented-code], close it.

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Do nothing

### 7.5 Close

To close a group is to continue on in its parent group and to pop it off the
[stack of open groups][stack-of-open-groups].
Closing groups may have side effects, based on their type:

*   ↪ **[*Content group*][g-content]**

    [Process as Content][process-as-content] without a hint
*   ↪ **Anything else**

    Do nothing

## 8 Tokenization

Implementations must act as if they use several state machines to tokenize
common markup.
For the main structure of a document, the [block state machine][block-state-machine] is used.
When content is closed, the [content state machine][content-state-machine] is used.
In certain constructs, the [inline state machine][inline-state-machine] is used.

Most states consume the [input character][input-character], which may have various side
effects, and either remain in the state to consume the next character, switch to
a new state to consume the next character, or switch to a new state to reconsume
the input character.

The exact behavior of certain states depends on state, such as the [stack of
open groups][stack-of-open-groups] and the [queue][queue].

Certain states also use a shared space to track information between states.
A variable is declared in the shared state with `let`, changed with `set`, and
cleared with `unset`.

## 9 Block state machine

The <a id="block-state-machine" href="#block-state-machine">**block state machine**</a> is used to tokenize the main structure of a
document and must start in the [*Initial state*][s-initial].

### 9.1 Initial state

*   ↪ **[EOF][ceof]**

    Enqueue an [*End-of-file token*][t-end-of-file] and emit
*   ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Blank line group*][g-blank-line], close, and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the [*Initial whitespace state*][s-initial-whitespace]
*   ↪ **Anything else**

    Reconsume in the [*In line state*][s-in-line]

### 9.2 Initial whitespace state

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

### 9.3 Line ending state

> **Note**: “Anything else” is not possible.

*   ↪ **[EOF][ceof]**

    Enqueue an [*End-of-file token*][t-end-of-file] and emit
*   ↪ **U+000A LINE FEED (LF)**

    Enqueue a [*Line terminator token*][t-line-terminator], consume, emit, and switch to the [*Initial state*][s-initial]
*   ↪ **U+000D CARRIAGE RETURN (CR)**

    Enqueue a [*Line terminator token*][t-line-terminator], consume, and switch to the [*Carriage return state*][s-carriage-return]

### 9.4 Carriage return state

*   ↪ **U+000A LINE FEED (LF)**

    Consume, emit, and switch to the [*Initial state*][s-initial]
*   ↪ **Anything else**

    Emit and reconsume in the [*Initial state*][s-initial]

### 9.5 In line state

If the [stack of continuation][stack-of-continuation] matches all open groups:

*   And if the [current group][current-group] is an [*HTML group*][g-html], enqueue a [*Content token*][t-content] with the
    unused characters of the previous [*Whitespace token*][t-whitespace] if there is one, and
    reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]
*   And otherwise, if the [current group][current-group] is a [*Fenced code group*][g-fenced-code], and either the
    [current token][current-token] is not a [*Whitespace token*][t-whitespace], or it is a [*Whitespace token*][t-whitespace] and its
    unused size is less than four (4), and the [input character][input-character] is the
    [current group][current-group]’s marker, enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code close sequence state*][s-fenced-code-close-sequence]
*   And otherwise, if the [current group][current-group] is a [*Fenced code group*][g-fenced-code], enqueue a
    [*Content token*][t-content] with the unused characters of the previous [*Whitespace token*][t-whitespace] if there
    is one, consume, and switch to the [*Fenced code continuation line state*][s-fenced-code-continuation-line].

Otherwise, if the [current group][current-group] is not a [*Content group*][g-content], the previous token is a
[*Whitespace token*][t-whitespace], and its unused size is greater than or equal to four (4), add four
to the previous token’s used size, enqueue a [*Content token*][t-content] with the unused
characters of the previous [*Whitespace token*][t-whitespace], consume, and switch to the
[*Indented code line state*][s-indented-code-line].

Otherwise, perform the following steps based on the [input character][input-character]:

*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*ATX heading open sequence state*][s-atx-heading-open-sequence]
*   ↪ **U+002A ASTERISK (`*`)**

    Enqueue a [*Marker token*][t-marker], consume, and switch to the
    [*Asterisk line asterisk after state*][s-asterisk-line-asterisk-after]
*   ↪ **U+002B PLUS SIGN (`+`)**

    > ❗️ Todo: Could be a list item or content
*   ↪ **U+002D DASH (`-`)**

    > ❗️ Todo: Could be a list item, thematic break, setext underline secondary,
    > or content
*   ↪ **[ASCII digit][ascii-digit]**

    > ❗️ Todo: Could be a list item or content
*   ↪ **U+003C LESS THAN (`<`)**

    Enqueue a [*Content token*][t-content] with the unused characters of the previous [*Whitespace token*][t-whitespace]
    if there is one, consume, and switch to the [*HTML block open state*][s-html-block-open]
*   ↪ **U+003D EQUALS TO (`=`)**

    If the [current group][current-group] is a [*Content group*][g-content], enqueue a [*Sequence token*][t-sequence], consume, and
    switch to the [*Setext heading underline equals to sequence state*][s-setext-heading-underline-equals-to-sequence].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    Open a [*Blockquote group*][g-blockquote], consume, emit, and switch to the [*Initial state*][s-initial]
*   ↪ **U+005F UNDERSCORE (`_`)**

    > ❗️ Todo: Could be a thematic break or content
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code grave accent fence open state*][s-fenced-code-grave-accent-fence-open]
*   ↪ **U+007E TILDE (`~`)**

    Enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code tilde fence open state*][s-fenced-code-tilde-fence-open]
*   ↪ **Anything else**

    Otherwise, enqueue a [*Content token*][t-content] with the unused characters of the previous
    [*Whitespace token*][t-whitespace] if there is one, consume, and switch to the
    [*Content continuation state*][s-content-continuation]

### 9.6 ATX heading open sequence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open an [*ATX heading group*][g-atx-heading], open an [*ATX heading fence group*][g-atx-heading-fence], emit, close twice, and
    reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*ATX heading open sequence after state*][s-atx-heading-open-sequence-after]
*   ↪ **U+0023 NUMBER SIGN (`#`)**

    If the current token’s size is less than six (6), consume.

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Change the [current token][current-token] into a [*Content token*][t-content], consume, and switch to the
    [*Content continuation state*][s-content-continuation]

### 9.7 ATX heading open sequence after state

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

    Open an [*ATX heading group*][g-atx-heading], open an [*ATX heading fence group*][g-atx-heading-fence], emit, close, enqueue a
    [*Sequence token*][t-sequence], consume, and switch to the [*ATX heading number sign sequence state*][s-atx-heading-number-sign-sequence]
*   ↪ **Anything else**

    Open an [*ATX heading group*][g-atx-heading], open an [*ATX heading fence group*][g-atx-heading-fence], emit, close, enqueue a
    [*Content token*][t-content], consume, and switch to the [*ATX heading content state*][s-atx-heading-content]

### 9.8 ATX heading content state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an ATX heading][process-as-an-atx-heading] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the [*ATX heading whitespace state*][s-atx-heading-whitespace]
*   ↪ **Anything else**

    Consume

### 9.9 ATX heading whitespace state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an ATX heading][process-as-an-atx-heading] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*ATX heading number sign sequence state*][s-atx-heading-number-sign-sequence]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*ATX heading content state*][s-atx-heading-content]

### 9.10 ATX heading number sign sequence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an ATX heading][process-as-an-atx-heading] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the [*ATX heading whitespace state*][s-atx-heading-whitespace]
*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Consume
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*ATX heading content state*][s-atx-heading-content]

### 9.11 Asterisk line asterisk after state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an Asterisk line][process-as-an-asterisk-line] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Asterisk line whitespace state*][s-asterisk-line-whitespace]
*   ↪ **U+002A ASTERISK (`*`)**

    Enqueue a [*Marker token*][t-marker] and consume
*   ↪ **Anything else**

    > ❗️ Todo: handle the input character, reconsume somewhere.

    [Process as an Asterisk line opening][process-as-an-asterisk-line-opening].

### 9.12 Asterisk line whitespace state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as an Asterisk line][process-as-an-asterisk-line] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+002A ASTERISK (`*`)**

    Enqueue a [*Marker token*][t-marker], consume, and switch to the
    [*Asterisk line asterisk after state*][s-asterisk-line-asterisk-after]
*   ↪ **Anything else**

    > ❗️ Todo: handle the input character, reconsume somewhere.

    [Process as an Asterisk line opening][process-as-an-asterisk-line-opening].

### 9.13 HTML block open state

*   ↪ **U+0021 EXCLAMATION MARK (`!`)**

    Consume and switch to the [*HTML block open markup declaration state*][s-html-block-open-markup-declaration]
*   ↪ **U+002F SLASH (`/`)**

    > ❗️ Todo: Define shared space: `endTag`

    Let `endTag` be `true`, consume, and switch to the
    [*HTML block open close tag start state*][s-html-block-open-close-tag-start]
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

### 9.14 HTML block open markup declaration state

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

### 9.15 HTML block open comment inside state

*   ↪ **U+002D DASH (`-`)**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `2`, open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation declaration before state*][s-html-block-continuation-declaration-before]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 9.16 HTML block open character data inside state

If the next few characters are:

*   ↪ **`[CDATA[` (the five upper letters “CDATA” with a U+005B LEFT SQUARE BRACKET (`[`) before and
    after)**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `5`, open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation line state*][s-html-block-continuation-line]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 9.17 HTML block open close tag start state

*   ↪ **[ASCII alpha][ascii-alpha]**

    Append the [ASCII-lowercase][ascii-lowercase]d character to `tagName`, consume, and switch
    to the [*HTML block open tag name inside state*][s-html-block-open-tag-name-inside]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 9.18 HTML block open tag name inside state

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
    [*HTML block open simple self closing state*][s-html-block-open-simple-self-closing].

    Otherwise, if `tagName` is not a [simple tag][simple-tag], `endTag` is not `true`, and
    the [current group][current-group] is not a [*Content group*][g-content], consume, and switch to the
    [*HTML block open complete self closing state*][s-html-block-open-complete-self-closing].

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

### 9.19 HTML block open simple self closing state

*   ↪ **U+003E GREATER THAN (`>`)**

    > ❗️ Todo: Define shared space: `kind`

    Let `kind` be `6`, open an [*HTML group*][g-html], consume, and switch to the
    [*HTML block continuation line state*][s-html-block-continuation-line]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 9.20 HTML block open complete attribute before state

*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    > ❗️ Todo: Define shared space: `endTag`

    If `endTag` is not `true`, consume, and switch to the
    [*HTML block open complete self closing state*][s-html-block-open-complete-self-closing].

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

### 9.21 HTML block open complete attribute name state

*   ↪ **U+002D DASH (`-`)**\
    ↪ **U+002E DOT (`.`)**\
    ↪ **U+003A COLON (`:`)**\
    ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+005F UNDERSCORE (`_`)**

    Consume
*   ↪ **Anything else**

    Reconsume in the [*HTML block open complete attribute name after state*][s-html-block-open-complete-attribute-name-after]

### 9.22 HTML block open complete attribute name after state

*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **[VIRTUAL SPACE][cvs]**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    > ❗️ Todo: Define shared space: `endTag`

    If `endTag` is not `true`, consume, and switch to the
    [*HTML block open complete self closing state*][s-html-block-open-complete-self-closing].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003D EQUALS TO (`=`)**

    Consume and switch to the [*HTML block open complete attribute value before state*][s-html-block-open-complete-attribute-value-before]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*HTML block open complete tag after state*][s-html-block-open-complete-tag-after]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 9.23 HTML block open complete attribute value before state

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

### 9.24 HTML block open complete double quoted attribute value state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Consume and switch to the [*HTML block open complete attribute before state*][s-html-block-open-complete-attribute-before]
*   ↪ **Anything else**

    Consume

### 9.25 HTML block open complete single quoted attribute value state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Consume and switch to the [*HTML block open complete attribute before state*][s-html-block-open-complete-attribute-before]
*   ↪ **Anything else**

    Consume

### 9.26 HTML block open complete unquoted attribute value state

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

### 9.27 HTML block open complete self closing state

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*HTML block open complete tag after state*][s-html-block-open-complete-tag-after]
*   ↪ **Anything else**

    This is not an HTML block.
    Reconsume in the [*Content continuation state*][s-content-continuation]

### 9.28 HTML block open complete tag after state

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

### 9.29 HTML block continuation line state

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
    [*HTML block continuation tag close state*][s-html-block-continuation-tag-close].

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

### 9.30 HTML block continuation tag close state

*   ↪ **U+002F SLASH (`/`)**

    Consume and switch to the [*HTML block continuation tag close name inside state*][s-html-block-continuation-tag-close-name-inside]
*   ↪ **Anything else**

    Reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]

### 9.31 HTML block continuation tag close name inside state

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

### 9.32 HTML block continuation comment inside state

*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML block continuation declaration before state*][s-html-block-continuation-declaration-before]
*   ↪ **Anything else**

    Reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]

### 9.33 HTML block continuation character data inside state

*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Consume and switch to the [*HTML block continuation declaration before state*][s-html-block-continuation-declaration-before]
*   ↪ **Anything else**

    Reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]

### 9.34 HTML block continuation declaration before state

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*HTML block close line state*][s-html-block-close-line]
*   ↪ **Anything else**

    Reconsume in the [*HTML block continuation line state*][s-html-block-continuation-line]

### 9.35 HTML block close line state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open an [*HTML line group*][g-html-line], emit, close twice, and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **Anything else**

    Consume

### 9.36 Setext heading underline equals to sequence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    [Process as a Setext primary heading][process-as-a-setext-primary-heading] and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **U+003D EQUALS TO (`=`)**

    Consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Setext heading underline equals to after state*][s-setext-heading-underline-equals-to-after]
*   ↪ **Anything else**

    Turn the [current token][current-token] into a [*Content token*][t-content], consume, and switch to the
    [*Content continuation state*][s-content-continuation]

### 9.37 Setext heading underline equals to after state

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

### 9.38 Fenced code grave accent fence open state

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

    If the [current token][current-token]’s size is greater than or equal to three (3),
    enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code grave accent fence open whitespace state*][s-fenced-code-grave-accent-fence-open-whitespace]

    Otherwise, this is not fenced code.
    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Content continuation state*][s-content-continuation]
*   ↪ **Anything else**

    If the [current token][current-token]’s size is greater than or equal to three (3),
    enqueue a [*Content token*][t-content], consume, and switch to the
    [*Fenced code grave accent fence open metadata state*][s-fenced-code-grave-accent-fence-open-metadata]

    Otherwise, this is not fenced code.
    Turn the enqueue, except for the first token if it is a [*Whitespace token*][t-whitespace], into a
    [*Content token*][t-content] and reconsume in the [*Content continuation state*][s-content-continuation]

### 9.39 Fenced code grave accent fence open whitespace state

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

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Fenced code grave accent fence open metadata state*][s-fenced-code-grave-accent-fence-open-metadata]

### 9.40 Fenced code grave accent fence open metadata state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Fenced code group*][g-fenced-code], [process as a Fenced code fence][process-as-a-fenced-code-fence] and reconsume in
    the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code grave accent fence open whitespace state*][s-fenced-code-grave-accent-fence-open-whitespace]
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    This is not fenced code.
    Turn the queue, except for the first token if it is a [*Whitespace token*][t-whitespace], into a
    [*Content token*][t-content] and reconsume in the [*Content continuation state*][s-content-continuation]
*   ↪ **Anything else**

    Consume

### 9.41 Fenced code tilde fence open state

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

    If the [current token][current-token]’s size is greater than or equal to three (3),
    enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code tilde fence open whitespace state*][s-fenced-code-tilde-fence-open-whitespace]

    Otherwise, this is not fenced code.
    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Content continuation state*][s-content-continuation]
*   ↪ **Anything else**

    If the [current token][current-token]’s size is greater than or equal to three (3),
    enqueue a [*Content token*][t-content], consume, and switch to the
    [*Fenced code tilde fence open metadata state*][s-fenced-code-tilde-fence-open-metadata]

    Otherwise, this is not fenced code.
    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Content continuation state*][s-content-continuation]

### 9.42 Fenced code tilde fence open whitespace state

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

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Fenced code tilde fence open metadata state*][s-fenced-code-tilde-fence-open-metadata]

### 9.43 Fenced code tilde fence open metadata state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Fenced code group*][g-fenced-code], [process as a Fenced code fence][process-as-a-fenced-code-fence] and reconsume in
    the [*Line ending state*][s-line-ending]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code tilde fence open whitespace state*][s-fenced-code-tilde-fence-open-whitespace]
*   ↪ **Anything else**

    Consume

### 9.44 Fenced code continuation line state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    Open a [*Fenced code line group*][g-fenced-code-line], emit, close, and reconsume in the
    [*Line ending state*][s-line-ending]
*   ↪ **Anything else**

    Consume

### 9.45 Fenced code close sequence state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    > ❗️ Todo: Define shared space: `sizeOpen`

    If the [current token][current-token]’s size is greater than or equal to `sizeOpen`,
    [process as a Fenced code fence][process-as-a-fenced-code-fence], close, and reconsume in the
    [*Line ending state*][s-line-ending]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    > ❗️ Todo: Define shared space: `sizeOpen`

    If the [current token][current-token]’s size is greater than or equal to `sizeOpen`,
    enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Fenced code close whitespace state*][s-fenced-code-close-whitespace].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**\
    ↪ **U+007E TILDE (`~`)**

    If the [input character][input-character] is the [current token][current-token]’s marker, consume.

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Turn the [current token][current-token] into a [*Content token*][t-content] and reconsume in the
    [*Fenced code continuation line state*][s-fenced-code-continuation-line]

### 9.46 Fenced code close whitespace state

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

### 9.47 Indented code line state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    If the current open block is not an [*Indented code group*][g-indented-code], open an
    [*Indented code group*][g-indented-code].

    Open an [*Indented code line group*][g-indented-code-line], emit, close, and reconsume in the
    [*Line ending state*][s-line-ending]
*   ↪ **Anything else**

    Consume

### 9.48 Content continuation state

*   ↪ **[EOF][ceof]**\
    ↪ **U+000A LINE FEED (LF)**\
    ↪ **U+000D CARRIAGE RETURN (CR)**

    If the current open block is not a [*Content group*][g-content], open a [*Content group*][g-content].

    Open a [*Content line group*][g-content-line], emit, close, and reconsume in the [*Line ending state*][s-line-ending]
*   ↪ **Anything else**

    Consume

## 10 Content state machine

The <a id="content-state-machine" href="#content-state-machine">**content state machine**</a> is used to tokenize the content blocks of a
document and must start in the [*Initial content state*][s-initial-content].

### 10.1 Initial content state

*   ↪ **U+005B LEFT SQUARE BRACKET (`[`)**

    Enqueue a [*Marker token*][t-marker], consume, emit a [*Content definition label open label*][l-content-definition-label-open], and
    switch to the [*Definition label open after state*][s-definition-label-open-after]
*   ↪ **Anything else**

    Reconsume in the [*Phrasing content state*][s-phrasing-content]

### 10.2 Definition label open after state

*   ↪ **[EOF][ceof]**\
    ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the [*Definition label before state*][s-definition-label-before]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*Definition label inside state*][s-definition-label-inside]

### 10.3 Definition label before state

> **Note**: EOL is not possible.

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*Definition label inside state*][s-definition-label-inside]

### 10.4 Definition label inside state

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the
    [*Definition label inside start after state*][s-definition-label-inside-start-after]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Definition label between state*][s-definition-label-between]
*   ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition label escape state*][s-definition-label-escape]
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Emit a [*Content definition label close label*][l-content-definition-label-close], enqueue a [*Marker token*][t-marker], consume, and
    switch to the [*Definition label close after state*][s-definition-label-close-after]
*   ↪ **Anything else**

    Consume

### 10.5 Definition label inside start after state

> **Note**: EOL is not possible.

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Definition label between state*][s-definition-label-between]
*   ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition label escape state*][s-definition-label-escape]
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Emit a [*Content definition label close label*][l-content-definition-label-close], enqueue a [*Marker token*][t-marker], consume, and
    switch to the [*Definition label close after state*][s-definition-label-close-after]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*Definition label inside state*][s-definition-label-inside]

### 10.6 Definition label between state

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the
    [*Definition label inside start after state*][s-definition-label-inside-start-after]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+005C BACKSLASH (`\`)**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*Definition label escape state*][s-definition-label-escape]
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Emit a [*Content definition label close label*][l-content-definition-label-close], enqueue a [*Marker token*][t-marker], consume, and
    switch to the [*Definition label close after state*][s-definition-label-close-after]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*Definition label inside state*][s-definition-label-inside]

### 10.7 Definition label escape state

*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Definition label between state*][s-definition-label-between]
*   ↪ **U+005C BACKSLASH (`\`)**\
    ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Consume and switch to the [*Definition label inside state*][s-definition-label-inside]
*   ↪ **Anything else**

    Reconsume in the [*Definition label inside state*][s-definition-label-inside]

### 10.8 Definition label close after state

*   ↪ **U+003A COLON (`:`)**

    Enqueue a [*Marker token*][t-marker], consume, and switch to the [*Definition label after state*][s-definition-label-after]
*   ↪ **Anything else**

    Emit a [*Content phrasing label*][l-content-phrasing]

### 10.9 Definition label after state

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Definition destination before state*][s-definition-destination-before]
*   ↪ **U+003C LESS THAN (`<`)**

    Emit a [*Content definition destination quoted open label*][l-content-definition-destination-quoted-open], enqueue a [*Marker token*][t-marker],
    consume, and switch to the [*Definition destination quoted open after state*][s-definition-destination-quoted-open-after]
*   ↪ **[ASCII control][ascii-control]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **Anything else**

    Let `balance` be `0`, emit a [*Content definition destination unquoted open label*][l-content-definition-destination-unquoted-open],
    enqueue a [*Content token*][t-content] and reconsume in the
    [*Definition destination unquoted inside state*][s-definition-destination-unquoted-inside]

### 10.10 Definition destination before state

> **Note**: EOL is not possible.

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+003C LESS THAN (`<`)**

    Emit a [*Content definition destination quoted open label*][l-content-definition-destination-quoted-open], enqueue a [*Marker token*][t-marker],
    consume, and switch to the [*Definition destination quoted open after state*][s-definition-destination-quoted-open-after]
*   ↪ **[ASCII control][ascii-control]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **Anything else**

    Let `balance` be `0`, emit a [*Content definition destination unquoted open label*][l-content-definition-destination-unquoted-open],
    enqueue a [*Content token*][t-content], and reconsume in the
    [*Definition destination unquoted inside state*][s-definition-destination-unquoted-inside]

### 10.11 Definition destination quoted open after state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **U+003C LESS THAN (`<`)**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **U+003E GREATER THAN (`>`)**

    Enqueue a [*Marker token*][t-marker], consume, emit a
    [*Content definition destination quoted close label*][l-content-definition-destination-quoted-close], and switch to the
    [*Definition destination quoted close after state*][s-definition-destination-quoted-close-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Definition destination quoted escape state*][s-definition-destination-quoted-escape]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Definition destination quoted inside state*][s-definition-destination-quoted-inside]

### 10.12 Definition destination quoted inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **U+003C LESS THAN (`<`)**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **U+003E GREATER THAN (`>`)**

    Enqueue a [*Marker token*][t-marker], consume, emit a
    [*Content definition destination quoted close label*][l-content-definition-destination-quoted-close], and switch to the
    [*Definition destination quoted close after state*][s-definition-destination-quoted-close-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition destination quoted escape state*][s-definition-destination-quoted-escape]
*   ↪ **Anything else**

    Consume

### 10.13 Definition destination quoted escape state

*   ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003E GREATER THAN (`>`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition destination quoted inside state*][s-definition-destination-quoted-inside]
*   ↪ **Anything else**

    Reconsume in the [*Definition destination quoted inside state*][s-definition-destination-quoted-inside]

### 10.14 Definition destination quoted close after state

*   ↪ **[EOF][ceof]**

    Emit a [*Content definition label*][l-content-definition]
*   ↪ **[EOL][ceol]**

    Emit a [*Content definition partial label*][l-content-definition-partial], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Definition destination after state*][s-definition-destination-after]
*   ↪ **Anything else**

    Emit a [*Content phrasing label*][l-content-phrasing]

### 10.15 Definition destination unquoted inside state

*   ↪ **[EOF][ceof]**

    Unset `balance`, emit a [*Content definition destination unquoted close label*][l-content-definition-destination-unquoted-close], and
    emit a [*Content definition label*][l-content-definition]
*   ↪ **[EOL][ceol]**

    Unset `balance`, emit a [*Content definition destination unquoted close label*][l-content-definition-destination-unquoted-close],
    emit a [*Content definition partial label*][l-content-definition-partial], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Unset `balance`, emit a [*Content definition destination unquoted close label*][l-content-definition-destination-unquoted-close],
    enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the
    [*Definition destination after state*][s-definition-destination-after]
*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**

    Increment `balance` by `1` and consume
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    If `balance` is `0`, unset `balance` and emit a [*Content phrasing label*][l-content-phrasing]

    Otherwise, decrement `balance` by `1`, and consume
*   ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition destination unquoted escape state*][s-definition-destination-unquoted-escape]
*   ↪ **[ASCII control][ascii-control]**

    Unset `balance` and emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **Anything else**

    Consume

### 10.16 Definition destination unquoted escape state

*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**\
    ↪ **U+0029 RIGHT PARENTHESIS (`)`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition destination unquoted inside state*][s-definition-destination-unquoted-inside]
*   ↪ **Anything else**

    Reconsume in the [*Definition destination unquoted inside state*][s-definition-destination-unquoted-inside]

### 10.17 Definition destination after state

*   ↪ **[EOF][ceof]**

    Emit a [*Content definition label*][l-content-definition]
*   ↪ **[EOL][ceol]**

    Emit a [*Content definition partial label*][l-content-definition-partial], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Emit a [*Content definition title open label*][l-content-definition-title-open], enqueue a [*Marker token*][t-marker], consume, and
    switch to the [*Definition title double quoted open after state*][s-definition-title-double-quoted-open-after]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Emit a [*Content definition title open label*][l-content-definition-title-open], enqueue a [*Marker token*][t-marker], consume, and
    switch to the [*Definition title single quoted open after state*][s-definition-title-single-quoted-open-after]
*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**

    Emit a [*Content definition title open label*][l-content-definition-title-open], enqueue a [*Marker token*][t-marker], consume, and
    switch to the [*Definition title paren quoted open after state*][s-definition-title-paren-quoted-open-after]
*   ↪ **Anything else**

    Emit a [*Content phrasing label*][l-content-phrasing]

### 10.18 Definition title double quoted open after state

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Enqueue a [*Marker token*][t-marker], consume, emit a [*Content definition title close label*][l-content-definition-title-close], and
    switch to the [*Definition title close after state*][s-definition-title-close-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Definition title double quoted escape state*][s-definition-title-double-quoted-escape]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Definition title double quoted inside state*][s-definition-title-double-quoted-inside]

### 10.19 Definition title double quoted inside state

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the
    [*Definition title double quoted open after state*][s-definition-title-double-quoted-open-after]
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Enqueue a [*Marker token*][t-marker], consume, emit a [*Content definition title close label*][l-content-definition-title-close], and
    switch to the [*Definition title close after state*][s-definition-title-close-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition title double quoted escape state*][s-definition-title-double-quoted-escape]
*   ↪ **Anything else**

    Consume

### 10.20 Definition title double quoted escape state

*   ↪ **U+0022 QUOTATION MARK (`"`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition title double quoted open after state*][s-definition-title-double-quoted-open-after]
*   ↪ **Anything else**

    Reconsume in the [*Definition title double quoted open after state*][s-definition-title-double-quoted-open-after]

### 10.21 Definition title single quoted open after state

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Enqueue a [*Marker token*][t-marker], consume, emit a [*Content definition title close label*][l-content-definition-title-close], and
    switch to the [*Definition title close after state*][s-definition-title-close-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Definition title single quoted escape state*][s-definition-title-single-quoted-escape]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Definition title single quoted inside state*][s-definition-title-single-quoted-inside]

### 10.22 Definition title single quoted inside state

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the
    [*Definition title single quoted open after state*][s-definition-title-single-quoted-open-after]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Enqueue a [*Marker token*][t-marker], consume, emit a [*Content definition title close label*][l-content-definition-title-close], and
    switch to the [*Definition title close after state*][s-definition-title-close-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition title single quoted escape state*][s-definition-title-single-quoted-escape]
*   ↪ **Anything else**

    Consume

### 10.23 Definition title single quoted escape state

*   ↪ **U+0027 APOSTROPHE (`'`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition title single quoted open after state*][s-definition-title-single-quoted-open-after]
*   ↪ **Anything else**

    Reconsume in the [*Definition title single quoted open after state*][s-definition-title-single-quoted-open-after]

### 10.24 Definition title paren quoted open after state

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    Enqueue a [*Marker token*][t-marker], consume, emit a [*Content definition title close label*][l-content-definition-title-close], and
    switch to the [*Definition title close after state*][s-definition-title-close-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Definition title paren quoted escape state*][s-definition-title-paren-quoted-escape]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the
    [*Definition title paren quoted inside state*][s-definition-title-paren-quoted-inside]

### 10.25 Definition title paren quoted inside state

*   ↪ **[EOF][ceof]**

    Emit a [*Content phrasing label*][l-content-phrasing]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the
    [*Definition title paren quoted open after state*][s-definition-title-paren-quoted-open-after]
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    Enqueue a [*Marker token*][t-marker], consume, emit a [*Content definition title close label*][l-content-definition-title-close], and
    switch to the [*Definition title close after state*][s-definition-title-close-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition title paren quoted escape state*][s-definition-title-paren-quoted-escape]
*   ↪ **Anything else**

    Consume

### 10.26 Definition title paren quoted escape state

*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition title paren quoted open after state*][s-definition-title-paren-quoted-open-after]
*   ↪ **Anything else**

    Reconsume in the [*Definition title paren quoted open after state*][s-definition-title-paren-quoted-open-after]

### 10.27 Definition title close after state

*   ↪ **[EOF][ceof]**

    Emit a [*Content definition label*][l-content-definition]
*   ↪ **[EOL][ceol]**

    Emit a [*Content definition label*][l-content-definition], enqueue an [*End-of-line token*][t-end-of-line], consume, and switch
    to the [*Initial content state*][s-initial-content]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Whitespace token*][t-whitespace], consume, and switch to the [*Definition after state*][s-definition-after]
*   ↪ **Anything else**

    Emit a [*Content phrasing label*][l-content-phrasing]

### 10.28 Definition after state

*   ↪ **[EOF][ceof]**

    Emit a [*Content definition label*][l-content-definition]
*   ↪ **[EOL][ceol]**

    Emit a [*Content definition label*][l-content-definition], enqueue an [*End-of-line token*][t-end-of-line], consume, and switch
    to the [*Initial content state*][s-initial-content]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **Anything else**

    Emit a [*Content phrasing label*][l-content-phrasing]

### 10.29 Phrasing content state

> ❗️ Todo: define.

## 11 Inline state machine

The <a id="inline-state-machine" href="#inline-state-machine">**inline state machine**</a> is used to tokenize inline values (raw text or
phrasing) of a document and must start in the [*Initial inline state*][s-initial-inline].

### 11.1 Initial inline state

*   ↪ **[EOF][ceof]**

    Enqueue an [*End-of-file token*][t-end-of-file] and emit
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **U+0021 EXCLAMATION MARK (`!`)**

    If parsing rich text, enqueue a [*Marker token*][t-marker], consume, and switch to the
    [*Image exclamation mark after state*][s-image-exclamation-mark-after]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+0026 AMPERSAND (`&`)**

    Enqueue a [*Marker token*][t-marker], consume, and switch to the [*Character reference state*][s-character-reference]
*   ↪ **U+002A ASTERISK (`*`)**

    If parsing rich text, enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Emphasis asterisk state*][s-emphasis-asterisk]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003C LESS THAN (`<`)**

    If parsing rich text, enqueue a [*Content token*][t-content], consume, and switch to the
    [*HTML or autolink less than after state*][s-html-or-autolink-less-than-after]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+005B LEFT SQUARE BRACKET (`[`)**

    If parsing rich text, enqueue a [*Marker token*][t-marker], consume, emit [*Text link open label*][l-text-link-open]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+005C BACKSLASH (`\`)**

    Enqueue a [*Marker token*][t-marker], consume, and switch to the [*Escape backslash after state*][s-escape-backslash-after]
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    > ❗️ Todo: support references, inlines, etc

    If parsing rich text, enqueue a [*Marker token*][t-marker], consume, and emit
    [*Text link close label*][l-text-link-close]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+005F UNDERSCORE (`_`)**

    If parsing rich text, enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Emphasis underscore state*][s-emphasis-underscore]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    If parsing rich text, let `sizeOpen` be `1`, enqueue a [*Sequence token*][t-sequence], consume,
    and switch to the [*Code span open state*][s-code-span-open]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    > ❗️ Todo: handle

### 11.2 Emphasis asterisk state

*   ↪ **U+002A ASTERISK (`*`)**

    Consume
*   ↪ **Anything else**

    Emit a [*Text emphasis label*][l-text-emphasis] and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.3 Character reference state

*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Enqueue a [*Marker token*][t-marker], consume, and switch to the [*Character reference numeric state*][s-character-reference-numeric]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    Let `entityName` be the empty string, append the character to `entityName`,
    enqueue a [*Content token*][t-content], consume, and switch to the [*Character reference named state*][s-character-reference-named]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.4 Character reference named state

*   ↪ **U+003B SEMICOLON (`;`)**

    If `entityName` is a [character reference name][character-reference-name], unset `entityName`,
    enqueue a [*Marker token*][t-marker], consume, emit [*Text character reference label*][l-text-character-reference], and switch
    to the [*Initial inline state*][s-initial-inline]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    Append the character to `entityName` and consume
*   ↪ **Anything else**

    Unset `entityName` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.5 Character reference numeric state

*   ↪ **U+0058 (`X`)**\
    ↪ **U+0078 (`x`)**

    Let `characterReferenceCode` be `0`, enqueue a [*Marker token*][t-marker], consume, and switch
    to the [*Character reference hexadecimal start state*][s-character-reference-hexadecimal-start]
*   ↪ **[ASCII digit][ascii-digit]**

    Let `characterReferenceCode` be `0`, enqueue a [*Content token*][t-content] and reconsume in
    the [*Character reference decimal state*][s-character-reference-decimal]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.6 Character reference hexadecimal start state

*   ↪ **[ASCII hex digit][ascii-hex-digit]**

    Enqueue a [*Content token*][t-content] and reconsume in the [*Character reference hexadecimal state*][s-character-reference-hexadecimal]
*   ↪ **Anything else**

    Unset `characterReferenceCode` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.7 Character reference hexadecimal state

*   ↪ **U+003B SEMICOLON (`;`)**

    Unset `characterReferenceCode`, enqueue a [*Marker token*][t-marker], consume, emit
    [*Text character reference label*][l-text-character-reference], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **[ASCII digit][ascii-digit]**

    Multiply `characterReferenceCode` by `16`, add a numeric version of the
    [content character][content-character] (subtract `0x30` from the character) to
    `characterReferenceCode`, and consume
*   ↪ **[ASCII upper hex digit][ascii-upper-hex-digit]**

    Multiply `characterReferenceCode` by `16`, add a numeric version of the
    [content character][content-character] (subtract `0x37` from the character) to
    `characterReferenceCode`, and consume
*   ↪ **[ASCII lower hex digit][ascii-lower-hex-digit]**

    Multiply `characterReferenceCode` by `16`, add a numeric version of the
    [content character][content-character] (subtract `0x57` from the character) to
    `characterReferenceCode`, and consume
*   ↪ **Anything else**

    Unset `characterReferenceCode` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.8 Character reference decimal state

*   ↪ **U+003B SEMICOLON (`;`)**

    Unset `characterReferenceCode`, enqueue a [*Marker token*][t-marker], consume, emit
    [*Text character reference label*][l-text-character-reference], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **[ASCII digit][ascii-digit]**

    Multiply `characterReferenceCode` by `10`, add a numeric version of the
    [content character][content-character] (subtract `0x30` from the character) to
    `characterReferenceCode`, and consume
*   ↪ **Anything else**

    Unset `characterReferenceCode` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.9 Code span open state

*   ↪ **[EOF][ceof]**

    Unset `sizeOpen` and reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the
    [*Code span inside start after state*][s-code-span-inside-start-after]
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Increment `sizeOpen` by `1` and consume
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*Code span inside state*][s-code-span-inside]

### 11.10 Code span inside start after state

> **Note**: EOL is not possible.

*   ↪ **[EOF][ceof]**

    Unset `sizeOpen` and reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Enqueue a [*Sequence token*][t-sequence], let `sizeClose` be `1`, consume, and switch to the
    [*Code span close state*][s-code-span-close]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*Code span inside state*][s-code-span-inside]

### 11.11 Code span inside state

*   ↪ **[EOF][ceof]**

    Unset `sizeOpen` and reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the
    [*Code span inside start after state*][s-code-span-inside-start-after]
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Enqueue a [*Sequence token*][t-sequence], let `sizeClose` be `1`, consume, and switch to the
    [*Code span close state*][s-code-span-close]
*   ↪ **Anything else**

    Consume

### 11.12 Code span close state

*   ↪ **[EOF][ceof]**

    If `sizeOpen` is `sizeClose`, unset `sizeOpen`, unset `sizeClose`, emit
    [*Text code label*][l-text-code], and reconsume in the [*Initial inline state*][s-initial-inline]

    Otherwise, unset `sizeOpen`, unset `sizeClose`, and reconsume in the
    [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    If `sizeOpen` is `sizeClose`, unset `sizeOpen`, unset `sizeClose`, emit
    [*Text code label*][l-text-code], and reconsume in the [*Initial inline state*][s-initial-inline]

    Otherwise, unset `sizeClose`, enqueue an [*End-of-line token*][t-end-of-line], consume, and switch
    to the [*Code span inside start after state*][s-code-span-inside-start-after]
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Increment `sizeClose` by `1` and consume
*   ↪ **Anything else**

    If `sizeOpen` is `sizeClose`, unset `sizeOpen`, unset `sizeClose`, emit
    [*Text code label*][l-text-code], and reconsume in the [*Initial inline state*][s-initial-inline]

    Otherwise, unset `sizeClose`, consume, and switch to the [*Code span inside state*][s-code-span-inside]

### 11.13 Emphasis underscore state

*   ↪ **U+005F UNDERSCORE (`_`)**

    Consume
*   ↪ **Anything else**

    Emit a [*Text emphasis label*][l-text-emphasis] and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.14 Escape backslash after state

*   ↪ **[ASCII punctuation][ascii-punctuation]**

    Enqueue a [*Content token*][t-content], consume, emit [*Text escape label*][l-text-escape], and switch to the
    [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.15 Image exclamation mark after state

*   ↪ **U+005B LEFT SQUARE BRACKET (`[`)**

    Enqueue a [*Marker token*][t-marker], consume, emit [*Text image open label*][l-text-image-open], and switch to the
    [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.16 HTML or autolink less than after state

*   ↪ **U+0021 EXCLAMATION MARK (`!`)**

    Consume and switch to the [*HTML declaration or email atext state*][s-html-declaration-or-email-atext]
*   ↪ **U+002F SLASH (`/`)**

    Consume and switch to the [*HTML tag close or email atext state*][s-html-tag-close-or-email-atext]
*   ↪ **U+003F QUESTION MARK (`?`)**

    Consume and switch to the [*HTML instruction or email atext state*][s-html-instruction-or-email-atext]
*   ↪ **[ASCII alpha][ascii-alpha]**

    Consume, let `sizeScheme` be `1`, and switch to the
    [*HTML tag open scheme or email atext state*][s-html-tag-open-scheme-or-email-atext]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.17 HTML instruction or email atext state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+003F QUESTION MARK (`?`)**

    Consume and switch to the [*HTML instruction close or email atext state*][s-html-instruction-close-or-email-atext]
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*HTML instruction or email at sign or dot state*][s-html-instruction-or-email-at-sign-or-dot]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume
*   ↪ **Anything else**

    Consume and switch to the [*HTML instruction state*][s-html-instruction]

### 11.18 HTML instruction close or email atext state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **U+003F QUESTION MARK (`?`)**

    Consume
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*HTML instruction or email at sign or dot state*][s-html-instruction-or-email-at-sign-or-dot]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*HTML instruction or email atext state*][s-html-instruction-or-email-atext]
*   ↪ **Anything else**

    Consume and switch to the [*HTML instruction state*][s-html-instruction]

### 11.19 HTML instruction or email at sign or dot state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+003F QUESTION MARK (`?`)**

    Unset `sizeLabel`, consume, and switch to the [*HTML instruction close state*][s-html-instruction-close]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML instruction or email label state*][s-html-instruction-or-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel`, consume, and switch to the [*HTML instruction state*][s-html-instruction]

### 11.20 HTML instruction or email label state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+002D DASH (`-`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML instruction or email dash state*][s-html-instruction-or-email-dash]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+002E DOT (`.`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML instruction or email at sign or dot state*][s-html-instruction-or-email-at-sign-or-dot]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    Unset `sizeLabel`, consume, emit [*Text autolink email label*][l-text-autolink-email], and switch to the
    [*Initial inline state*][s-initial-inline]
*   ↪ **U+003F QUESTION MARK (`?`)**

    Unset `sizeLabel`, consume, and switch to the [*HTML instruction close state*][s-html-instruction-close]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML instruction or email label state*][s-html-instruction-or-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel`, consume, and switch to the [*HTML instruction state*][s-html-instruction]

### 11.21 HTML instruction or email dash state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+002D DASH (`-`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML instruction or email dash state*][s-html-instruction-or-email-dash]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003F QUESTION MARK (`?`)**

    Unset `sizeLabel`, consume, and switch to the [*HTML instruction close state*][s-html-instruction-close]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML instruction or email label state*][s-html-instruction-or-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel`, consume, and switch to the [*HTML instruction state*][s-html-instruction]

### 11.22 HTML instruction state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **U+003F QUESTION MARK (`?`)**

    Consume and switch to the [*HTML instruction close state*][s-html-instruction-close]
*   ↪ **Anything else**

    Consume

### 11.23 HTML instruction close state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, enqueue a [*Content token*][t-content], and switch to the
    [*HTML instruction state*][s-html-instruction]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Consume

### 11.24 HTML declaration or email atext state

*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment open inside or email atext state*][s-html-comment-open-inside-or-email-atext]
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **`[CDATA[` (the five upper letters “CDATA” with a U+005B LEFT SQUARE BRACKET (`[`) before and
    after)**

    Consume and switch to the [*HTML CDATA state*][s-html-cdata]
*   ↪ **[ASCII upper alpha][ascii-upper-alpha]**

    Consume and switch to the [*HTML declaration name or email atext state*][s-html-declaration-name-or-email-atext]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.25 HTML comment open inside or email atext state

*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment or email atext state*][s-html-comment-or-email-atext]
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.26 HTML comment or email atext state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment close inside or email atext state*][s-html-comment-close-inside-or-email-atext]
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*HTML comment or email at sign or dot state*][s-html-comment-or-email-at-sign-or-dot]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*HTML comment or email atext state*][s-html-comment-or-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*HTML comment state*][s-html-comment]

### 11.27 HTML comment close inside or email atext state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment close or email atext state*][s-html-comment-close-or-email-atext]
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*HTML comment or email at sign or dot state*][s-html-comment-or-email-at-sign-or-dot]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*HTML comment or email atext state*][s-html-comment-or-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*HTML comment state*][s-html-comment]

### 11.28 HTML comment close or email atext state

> **Note**: a comment may not contain two dashes (`--`), and may not end in a
> dash (which would result in `--->`).
> Here we have seen two dashes, so we can either be at the end of a comment, or
> no longer in a comment.

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.29 HTML comment or email at sign or dot state

*   ↪ **[EOF][ceof]**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+002D DASH (`-`)**

    Unset `sizeLabel`, consume, and switch to the [*HTML comment close inside state*][s-html-comment-close-inside]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML comment or email label state*][s-html-comment-or-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and reconsume in the [*HTML comment state*][s-html-comment]

### 11.30 HTML comment or email label state

*   ↪ **[EOF][ceof]**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+002D DASH (`-`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML comment close inside or email label dash state*][s-html-comment-close-inside-or-email-label-dash]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+002E DOT (`.`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML comment or email at sign or dot state*][s-html-comment-or-email-at-sign-or-dot]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    Unset `sizeLabel`, consume, emit [*Text autolink email label*][l-text-autolink-email], and switch to the
    [*Initial inline state*][s-initial-inline]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML comment or email label state*][s-html-comment-or-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and reconsume in the [*HTML comment state*][s-html-comment]

### 11.31 HTML comment close inside or email label dash state

*   ↪ **[EOF][ceof]**\
    ↪ **U+003E GREATER THAN (`>`)**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+002D DASH (`-`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML comment close or email label dash state*][s-html-comment-close-or-email-label-dash]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*HTML comment or email label state*][s-html-comment-or-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and reconsume in the [*HTML comment state*][s-html-comment]

### 11.32 HTML comment close or email label dash state

> **Note**: a comment may not contain two dashes (`--`), and may not end in a
> dash (which would result in `--->`).
> Here we have seen two dashes, so we can either be at the end of a comment, or
> no longer in a comment.

*   ↪ **U+003E GREATER THAN (`>`)**

    Unset `sizeLabel`, consume, emit [*Text HTML label*][l-text-html], and switch to the
    [*Initial inline state*][s-initial-inline]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*Autolink email label state*][s-autolink-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.33 HTML comment state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a [*Content token*][t-content]
*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment close inside state*][s-html-comment-close-inside]
*   ↪ **Anything else**

    Consume

### 11.34 HTML comment close inside state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, enqueue a [*Content token*][t-content], and switch to the
    [*HTML comment state*][s-html-comment]
*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment close state*][s-html-comment-close]
*   ↪ **Anything else**

    Consume

### 11.35 HTML comment close state

> **Note**: a comment may not contain two dashes (`--`), and may not end in a
> dash (which would result in `--->`).
> Here we have seen two dashes, so we can either be at the end of a comment, or
> no longer in a comment.

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.36 HTML CDATA state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a [*Content token*][t-content]
*   ↪ **`]]>` (two of U+005D RIGHT SQUARE BRACKET (`]`), with a U+003E GREATER THAN (`>`) after)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Consume

### 11.37 HTML declaration name or email atext state

*   ↪ **[EOL][ceol]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*HTML declaration between state*][s-html-declaration-between]
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[ASCII upper alpha][ascii-upper-alpha]**

    Consume
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.38 HTML declaration between state

*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a [*Content token*][t-content]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Reconsume in the [*HTML declaration content state*][s-html-declaration-content]

### 11.39 HTML declaration content state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a [*Content token*][t-content]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Consume

### 11.40 HTML tag close or email atext state

*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[ASCII alpha][ascii-alpha]**

    Consume and switch to the [*HTML tag close inside or email atext state*][s-html-tag-close-inside-or-email-atext]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.41 HTML tag close inside or email atext state

*   ↪ **[EOL][ceol]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*HTML tag close between state*][s-html-tag-close-between]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+002D DASH (`-`)**

    Consume
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.42 HTML tag close between state

> **Note**: an EOL would technically be allowed here, but anything else isn’t,
> and as a `>` after an EOL would start a blockquote, practically it’s not
> possible.

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.43 HTML tag open scheme or email atext state

*   ↪ **U+002B PLUS SIGN (`+`)**\
    ↪ **U+002E DOT (`.`)**

    Increment `sizeScheme` by `1`, consume, and switch to the
    [*Autolink scheme inside or email atext state*][s-autolink-scheme-inside-or-email-atext]
*   ↪ **U+003E GREATER THAN (`>`)**

    Unset `sizeScheme`, consume, emit [*Text HTML label*][l-text-html], and switch to the
    [*Initial inline state*][s-initial-inline]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+002D DASH (`-`)**

    Increment `sizeScheme` by `1`, consume, and switch to the
    [*HTML tag open inside scheme inside or email atext state*][s-html-tag-open-inside-scheme-inside-or-email-atext]
*   ↪ **[atext][atext]**

    Unset `sizeScheme`, consume, and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Unset `sizeScheme` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.44 HTML tag open inside scheme inside or email atext state

*   ↪ **[EOL][ceol]**

    Unset `sizeScheme`, enqueue an [*End-of-line token*][t-end-of-line], consume, enqueue a [*Content token*][t-content],
    and switch to the [*HTML tag open between start after state*][s-html-tag-open-between-start-after]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Unset `sizeScheme`, consume, and switch to the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **U+002B PLUS SIGN (`+`)**\
    ↪ **U+002E DOT (`.`)**

    If `sizeScheme` is not `32`, increment `sizeScheme` by `1`, consume, and
    switch to the [*Autolink scheme inside or email atext state*][s-autolink-scheme-inside-or-email-atext]

    Otherwise, treat it as per the “atext” entry below
*   ↪ **U+003A COLON (`:`)**

    Unset `sizeScheme`, consume, and switch to the [*Autolink URI inside state*][s-autolink-uri-inside]
*   ↪ **U+0040 AT SIGN (`@`)**

    Unset `sizeScheme`, consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+002D DASH (`-`)**

    If `sizeScheme` is not `32`, increment `sizeScheme` by `1` and consume

    Otherwise, unset `sizeScheme`, consume, and switch to the
    [*HTML tag open inside or email atext state*][s-html-tag-open-inside-or-email-atext]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Unset `sizeScheme`, consume, and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Unset `sizeScheme` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.45 HTML tag open inside or email atext state

*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, enqueue a [*Content token*][t-content], and switch to the
    [*HTML tag open between start after state*][s-html-tag-open-between-start-after]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume and switch to the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+002D DASH (`-`)**

    Consume
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.46 HTML tag open between start after state

> **Note**: EOL is not possible.

*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume and switch to the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **Anything else**

    Reconsume in the [*HTML tag open between state*][s-html-tag-open-between]

### 11.47 HTML tag open between state

*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, enqueue a [*Content token*][t-content], and switch to the
    [*HTML tag open between start after state*][s-html-tag-open-between-start-after]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    Consume and switch to the [*HTML tag open self closing state*][s-html-tag-open-self-closing]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **[ASCII alpha][ascii-alpha]**\
    ↪ **U+003A COLON (`:`)**\
    ↪ **U+005F UNDERSCORE (`_`)**

    Consume and switch to the [*HTML tag open attribute name state*][s-html-tag-open-attribute-name]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.48 HTML tag open attribute name state

*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+002D DASH (`-`)**\
    ↪ **U+002E DOT (`.`)**\
    ↪ **U+003A COLON (`:`)**\
    ↪ **U+005F UNDERSCORE (`_`)**

    Consume
*   ↪ **Anything else**

    Reconsume in the [*HTML tag open attribute name after state*][s-html-tag-open-attribute-name-after]

### 11.49 HTML tag open attribute name after state

*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a [*Content token*][t-content]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    Consume and switch to the [*HTML tag open self closing state*][s-html-tag-open-self-closing]
*   ↪ **U+003D EQUALS TO (`=`)**

    Consume and switch to the [*HTML tag open attribute value before state*][s-html-tag-open-attribute-value-before]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.50 HTML tag open attribute value before state

*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a [*Content token*][t-content]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Consume and switch to the [*HTML tag open double quoted attribute value state*][s-html-tag-open-double-quoted-attribute-value]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Consume and switch to the [*HTML tag open single quoted attribute value state*][s-html-tag-open-single-quoted-attribute-value]
*   ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003D EQUALS TO (`=`)**\
    ↪ **U+003E GREATER THAN (`>`)**\
    ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Consume and switch to the [*HTML tag open unquoted attribute value state*][s-html-tag-open-unquoted-attribute-value]

### 11.51 HTML tag open double quoted attribute value state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a [*Content token*][t-content]
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Consume and switch to the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **Anything else**

    Consume

### 11.52 HTML tag open single quoted attribute value state

*   ↪ **[EOF][ceof]**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a [*Content token*][t-content]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Consume and switch to the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **Anything else**

    Consume

### 11.53 HTML tag open unquoted attribute value state

*   ↪ **[EOF][ceof]**\
    ↪ **U+0022 QUOTATION MARK (`"`)**\
    ↪ **U+0027 APOSTROPHE (`'`)**\
    ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003D EQUALS TO (`=`)**\
    ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, enqueue a [*Content token*][t-content], and switch to the
    [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\\

    Consume and switch to the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Consume

### 11.54 HTML tag open self closing state

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text HTML label*][l-text-html], and switch to the [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.55 Autolink scheme inside or email atext state

*   ↪ **U+003A COLON (`:`)**

    Unset `sizeScheme`, consume, and switch to the [*Autolink URI inside state*][s-autolink-uri-inside]
*   ↪ **U+0040 AT SIGN (`@`)**

    Unset `sizeScheme`, consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+002B PLUS SIGN (`+`)**\
    ↪ **U+002D DASH (`-`)**\
    ↪ **U+002E DOT (`.`)**

    If `sizeScheme` is not `32`, increment `sizeScheme` by `1` and consume

    Otherwise, treat it as per the “atext” entry below
*   ↪ **[atext][atext]**

    Unset `sizeScheme`, consume, and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Unset `sizeScheme` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.56 Autolink URI inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[ASCII control][ascii-control]**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **U+003C LESS THAN (`<`)**

    Reconsume in the [*Initial inline state*][s-initial-inline]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, emit [*Text autolink URI label*][l-text-autolink-uri], and switch to the
    [*Initial inline state*][s-initial-inline]
*   ↪ **Anything else**

    Consume

### 11.57 Autolink email atext state

*   ↪ **U+0040 AT SIGN (`@`)**

    Consume, let `sizeLabel` be `1`, and switch to the
    [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume
*   ↪ **Anything else**

    Reconsume in the [*Initial inline state*][s-initial-inline]

### 11.58 Autolink email label state

*   ↪ **U+002D DASH (`-`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*Autolink email dash state*][s-autolink-email-dash]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+002E DOT (`.`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    Unset `sizeLabel`, consume, emit [*Text autolink email label*][l-text-autolink-email], and switch to the
    [*Initial inline state*][s-initial-inline]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1` and consume

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.59 Autolink email at sign or dot state

*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*Autolink email label state*][s-autolink-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]

### 11.60 Autolink email dash state

*   ↪ **U+002D DASH (`-`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1` and consume

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*Autolink email label state*][s-autolink-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and reconsume in the [*Initial inline state*][s-initial-inline]

## 12 Labels

### 12.1 Content phrasing label

When a [*Content phrasing label*][l-content-phrasing] is received, the queue up to that point does not
construct a definition.

### 12.2 Content definition label

When a [*Content definition label*][l-content-definition] is received, the queue up to that point constructs a
definition.

### 12.3 Content definition partial label

When a [*Content definition partial label*][l-content-definition-partial] is received, the queue up to that point
constructs a definition without a title.
It is later followed by a [*Content definition label*][l-content-definition] if further queued tokens
construct a title, or [*Content phrasing label*][l-content-phrasing] if further queued tokens do not
construct a title.

### 12.4 Content definition label open label

When a [*Content definition label open label*][l-content-definition-label-open] is received, …

### 12.5 Content definition label close label

When a [*Content definition label close label*][l-content-definition-label-close] is received, …

### 12.6 Content definition destination quoted open label

When a [*Content definition destination quoted open label*][l-content-definition-destination-quoted-open] is received, …

### 12.7 Content definition destination quoted close label

When a [*Content definition destination quoted close label*][l-content-definition-destination-quoted-close] is received, …

### 12.8 Content definition destination unquoted open label

When a [*Content definition destination unquoted open label*][l-content-definition-destination-unquoted-open] is received, …

### 12.9 Content definition destination unquoted close label

When a [*Content definition destination unquoted close label*][l-content-definition-destination-unquoted-close] is received, …

### 12.10 Content definition title open label

When a [*Content definition title open label*][l-content-definition-title-open] is received, …

### 12.11 Content definition title close label

When a [*Content definition title close label*][l-content-definition-title-close] is received, …

### 12.12 Text link open label

When a [*Text link open label*][l-text-link-open] is received, …

### 12.13 Text image open label

When a [*Text image open label*][l-text-image-open] is received, …

### 12.14 Text link close label

When a [*Text link close label*][l-text-link-close] is received, …

### 12.15 Text emphasis label

When a [*Text emphasis label*][l-text-emphasis] is received, …

### 12.16 Text character reference label

When a [*Text character reference label*][l-text-character-reference] is received, …

### 12.17 Text escape label

When a [*Text escape label*][l-text-escape] is received, …

### 12.18 Text code label

When a [*Text code label*][l-text-code] is received, …

### 12.19 Text autolink email label

When a [*Text autolink email label*][l-text-autolink-email] is received, …

### 12.20 Text autolink URI label

When a [*Text autolink URI label*][l-text-autolink-uri] is received, …

### 12.21 Text HTML label

When a [*Text HTML label*][l-text-html] is received, …

## 13 Processing

### 13.1 Process as an ATX heading

To <a id="process-as-an-atx-heading" href="#process-as-an-atx-heading">**process as an ATX heading**</a> is to perform the following steps:

*   Let `index` be the number of tokens in the queue
*   If the token in the queue before `index` is a [*Whitespace token*][t-whitespace], subtract `1`
    from `index`
*   If the token in the queue before `index` is a [*Sequence token*][t-sequence], subtract `1` from
    `index`
*   If the token in the queue before `index` is a [*Whitespace token*][t-whitespace], subtract `1`
    from `index`
*   If `index` is not `0`:

    *   Let `last` be the token at `index` if there is one, or otherwise the
        last token in the queue
    *   Let `line` be a line without an ending where `start` is the start
        position of the token at `0`, and `end` is the end position of `last`
    *   Open an [*ATX heading content group*][g-atx-heading-content]
    *   [Process as Phrasing][process-as-phrasing] with `lines` set to a list with a single entry
        `line`
    *   Close
*   If there is a token at `index` in queue:

    *   Open an [*ATX heading fence group*][g-atx-heading-fence]
    *   Emit the tokens in the queue from `index`
    *   Close
*   Close

### 13.2 Process as a Setext primary heading

To <a id="process-as-a-setext-primary-heading" href="#process-as-a-setext-primary-heading">**process as a Setext primary heading**</a> is to perform the following steps:

*   Let `used` be the result of [process as Content][process-as-content] with the [current
    group][current-group] given hint *setext primary heading*
*   If `used`:

    *   Open a [*Setext heading underline group*][g-setext-heading-underline]
    *   Emit
    *   Close twice
*   Otherwise:

    *   Let `index` be the position of the [current token][current-token] in the queue
    *   If the [current token][current-token] is a [*Whitespace token*][t-whitespace], remove `1` from `index`
    *   Open a [*Content group*][g-content]
    *   Emit the tokens before `index`
    *   Emit the tokens in the queue from `index` as a [*Content token*][t-content]

### 13.3 Process as an asterisk line

To <a id="process-as-an-asterisk-line" href="#process-as-an-asterisk-line">**process as an asterisk line**</a> is to perform the following steps:

> ❗️ Delay for reference parser: This may be list item markers, list items with
> code, or content.
> It’s easier to figure this out with a reference parser that is tested.

### 13.4 Process as an asterisk line opening

To <a id="process-as-an-asterisk-line-opening" href="#process-as-an-asterisk-line-opening">**process as an asterisk line opening**</a> is to perform the following steps:

> ❗️ Delay for reference parser: This may be list item markers, list items with
> code, or content.
> It’s easier to figure this out with a reference parser that is tested.

### 13.5 Process as a Fenced code fence

To <a id="process-as-a-fenced-code-fence" href="#process-as-a-fenced-code-fence">**process as a Fenced code fence**</a> is to perform the following steps:

*   Let `fenceEnd` be `1`
*   Let `lineEnd` be the number of tokens in the queue
*   If the token in the queue before `lineEnd` is a [*Whitespace token*][t-whitespace], subtract `1`
    from `lineEnd`
*   If the token in the queue before `fenceEnd` is a [*Whitespace token*][t-whitespace], add `1` to
    `fenceEnd`
*   If `fenceEnd` is not `lineEnd` and the token in the queue at `fenceEnd` is a
    [*Whitespace token*][t-whitespace], add `1` to `fenceEnd`.
*   If `fenceEnd` is not `lineEnd`, let `langEnd` be `fenceEnd` plus `1`.
*   If `langEnd` points to a place and it is not `lineEnd`, let `metaStart` be
    `langEnd` plus `1`
*   Open a [*Fenced code fence group*][g-fenced-code-fence]
*   Emit the tokens before `fenceEnd`
*   If `langEnd` points to a place:

    *   Let `lang` be a line without an ending where `start` is the start
        position of the token at `fenceEnd`, `end` is the end position of the
        token at `langEnd`
    *   Open a [*Fenced code language group*][g-fenced-code-language]
    *   [Process as raw text][process-as-raw-text] with `lines` set to a list with a single entry
        `lang`
    *   Close
*   If `metaStart` points to a place:

    *   Emit the token at `langEnd`
    *   Let `meta` be a line without an ending where `start` is the start
        position of the token at `metaStart`, `end` is the end position of the
        token at `lineEnd`
    *   Open a [*Fenced code metadata group*][g-fenced-code-metadata]
    *   [Process as Raw text][process-as-raw-text] with `lines` set to a list with a single entry
        `meta`
    *   Close
*   If there is a token at `lineEnd`, emit it.
*   Close

### 13.6 Process as Content

### 13.7 Process as Raw text

To <a id="process-as-raw-text" href="#process-as-raw-text">**process as Raw text**</a> is to [process as Text][process-as-text] given `lines` and `kind`
`raw`.

### 13.8 Process as Phrasing

To <a id="process-as-phrasing" href="#process-as-phrasing">**process as Phrasing**</a> is to [process as Text][process-as-text] given `lines`.

### 13.9 Process as Text

## 14 Tokens

### 14.1 Whitespace token

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

### 14.2 Line terminator token

A [*Line terminator token*][t-line-terminator] represents a line break.

```idl
interface LineEnding <: Token {}
```

```js
{type: 'lineEnding'}
```

### 14.3 End-of-file token

An [*End-of-file token*][t-end-of-file] represents the end of the syntax.

```idl
interface EndOfFile <: Token {}
```

```js
{type: 'endOfFile'}
```

### 14.4 End-of-line token

An [*End-of-line token*][t-end-of-line] represents a point between two runs of text in content.

```idl
interface EndOfLine <: Token {}
```

```js
{type: 'endOfLine'}
```

### 14.5 Marker token

A [*Marker token*][t-marker] represents one punctuation character that is part of syntax instead
of content.

```idl
interface Marker <: Token {}
```

```js
{type: 'marker'}
```

### 14.6 Sequence token

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

### 14.7 Content token

A [*Content token*][t-content] represents content.

```idl
interface Content <: Token {
  prefix: string
}
```

```js
{type: 'content', prefix: '  '}
```

## 15 Groups

Groups are named groups of tokens and other blocks.

### 15.1 Blank line group

A [*Blank line group*][g-blank-line] represents an empty line.

```idl
interface BlankLine <: Group {
  children: [Whitespace]
}
```

### 15.2 ATX heading group

An [*ATX heading group*][g-atx-heading] represents a heading for a section.

```idl
interface AtxHeading <: Group {
  children: [ATXHeadingFenceGroup | ATXHeadingContentGroup]
}
```

### 15.3 ATX heading fence group

An [*ATX heading fence group*][g-atx-heading-fence] represents a fence of a heading.

```idl
interface AtxHeadingFence <: Group {
  children: [Whitespace | Sequence]
}
```

### 15.4 ATX heading content group

An [*ATX heading content group*][g-atx-heading-content] represents the phrasing of a heading.

```idl
interface AtxHeadingContent <: Group {
  children: [Phrasing]
}
```

### 15.5 Thematic break group

A [*Thematic break group*][g-thematic-break] represents a thematic break in a section.

```idl
interface ThematicBreak <: Group {
  children: [Sequence | Whitespace]
}
```

### 15.6 HTML group

An [*HTML group*][g-html] represents embedded HTML.

```idl
interface HTML <: Group {
  children: [HTMLineGroup | BlankLineGroup | LineEnding]
}
```

### 15.7 HTML line group

An [*HTML line group*][g-html-line] represents a line of HTML.

```idl
interface HTMLLine <: Group {
  children: [Whitespace | Content]
}
```

### 15.8 Indented code group

An [*Indented code group*][g-indented-code] represents preformatted text.

```idl
interface IndentedCode <: Group {
  children: [IndentedCodeLineGroup | BlankLineGroup | LineEnding]
}
```

### 15.9 Indented code line group

An [*Indented code line group*][g-indented-code-line] represents a line of indented code.

```idl
interface IndentedCodeLine <: Group {
  children: [Whitespace | Content]
}
```

### 15.10 Blockquote group

A [*Blockquote group*][g-blockquote] represents paraphrased text.

```idl
interface Blockquote <: Group {
  children: [FencedCodeGroup | IndentedCodeGroup | ATXHeadingGroup | SetextHeadingGroup | ThematicBreakGroup | HTMLGroup | ContentGroup | LineEnding]
}
```

### 15.11 Fenced code group

A [*Fenced code group*][g-fenced-code] represents preformatted text.

```idl
interface FencedCode <: Group {
  children: [FencedCodeFenceGroup | FencedCodeLineGroup | BlankLineGroup | LineEnding]
}
```

### 15.12 Fenced code fence group

A [*Fenced code fence group*][g-fenced-code-fence] represents a fence of fenced code.

```idl
interface FencedCodeFence <: Group {
  children: [Whitespace | Sequence | FencedCodeLanguageGroup | FencedCodeMetadataGroup]
}
```

### 15.13 Fenced code language group

A [*Fenced code language group*][g-fenced-code-language] represents the programming language of fenced code.

```idl
interface FencedCodeLanguage <: Group {
  children: [EscapeGroup | CharacterReferenceGroup | Content]
}
```

### 15.14 Fenced code metadata group

A [*Fenced code metadata group*][g-fenced-code-metadata] represents the metadata about fenced code.

```idl
interface FencedCodeMetadata <: Group {
  children: [EscapeGroup | CharacterReferenceGroup | Content | Whitespace]
}
```

### 15.15 Fenced code line group

A [*Fenced code line group*][g-fenced-code-line] represents a line of fenced code.

```idl
interface FencedCodeLine <: Group {
  children: [Whitespace | Content]
}
```

### 15.16 Content group

A [*Content group*][g-content] represents content: definitions, paragraphs, and sometimes heading
content.

```idl
interface Content <: Group {
  children: [ContentLineGroup | LineEnding]
}
```

### 15.17 Content line group

A [*Content line group*][g-content-line] represents a line of content.

```idl
interface ContentLine <: Group {
  children: [Whitespace | Content]
}
```

### 15.18 Setext heading group

A [*Setext heading group*][g-setext-heading] represents a heading for a section.

```idl
interface SetextHeading <: Group {
  children: [SetextHeadingContentGroup | SetextHeadingUnderlineGroup | LineEnding]
}
```

### 15.19 Setext heading underline group

A [*Setext heading underline group*][g-setext-heading-underline] represents a fence of a heading.

```idl
interface SetextHeadingUnderline <: Group {
  children: [Whitespace | Sequence]
}
```

### 15.20 Definition group

A [*Definition group*][g-definition] represents a link reference definition.

```idl
interface Definition <: Group {
  children: [DefinitionLabelGroup | DefinitionLabelQuotedGroup | DefinitionLabelUnquotedGroup | DefinitionTitleGroup | Whitespace | LineEnding]
}
```

### 15.21 Definition label group

A [*Definition label group*][g-definition-label] represents the label of a definition.

```idl
interface DefinitionLabel <: Group {
  children: [DefinitionLabelContentGroup | Marker | Whitespace | LineEnding]
}
```

### 15.22 Definition label content group

A [*Definition label content group*][g-definition-label-content] represents the content of the label of a
definition.

```idl
interface DefinitionLabelContent <: Group {
  children: [EscapeGroup | CharacterReferenceGroup | Content | Whitespace | LineEnding]
}
```

### 15.23 Definition destination quoted group

A [*Definition destination quoted group*][g-definition-destination-quoted] represents an enclosed destination of a
definition.

```idl
interface DefinitionDestinationQuoted <: Group {
  children: [EscapeGroup | CharacterReferenceGroup | Content | Marker]
}
```

### 15.24 Definition destination unquoted group

A [*Definition destination unquoted group*][g-definition-destination-unquoted] represents an unclosed destination of a
definition.

```idl
interface DefinitionDestinationUnquoted <: Group {
  children: [EscapeGroup | CharacterReferenceGroup | Content]
}
```

### 15.25 Definition title group

A [*Definition title group*][g-definition-title] represents advisory information, such as a description of
the destination of the definition.

```idl
interface DefinitionTitle <: Group {
  children: [EscapeGroup | CharacterReferenceGroup | Content | Whitespace | LineEnding]
}
```

### 15.26 Escape group

An [*Escape group*][g-escape] represents an escaped marker or an empty escape.

```idl
interface Escape <: Group {
  children: [Marker | Content]
}
```

### 15.27 Character reference group

A [*Character reference group*][g-character-reference] represents an escaped character.

```idl
interface CharacterReference <: Group {
  kind: name | hexadecimal | decimal
  children: [Marker | Content]
}
```

### 15.28 Automatic link group

An [*Automatic link group*][g-automatic-link] represents a literal URL or email address.

```idl
interface AutomaticLink <: Group {
  kind: email | uri
  children: [Marker | Content]
}
```

### 15.29 HTML inline group

An [*HTML inline group*][g-html-inline] represents XML-like structures.

```idl
interface HTMLInline <: Group {
  children: [Marker | Content | LineEnding]
}
```

## 16 Appendix

### 16.1 Raw tags

A <a id="raw-tag" href="#raw-tag">**raw tag**</a> is one of: `script`, `pre`, and `style`.

### 16.2 Simple tags

A <a id="simple-tag" href="#simple-tag">**simple tag**</a> is one of: `address`, `article`, `aside`, `base`, `basefont`,
`blockquote`, `body`, `caption`, `center`, `col`, `colgroup`, `dd`, `details`,
`dialog`, `dir`, `div`, `dl`, `dt`, `fieldset`, `figcaption`, `figure`,
`footer`, `form`, `frame`, `frameset`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`,
`head`, `header`, `hr`, `html`, `iframe`, `legend`, `li`, `link`, `main`,
`menu`, `menuitem`, `nav`, `noframes`, `ol`, `optgroup`, `option`, `p`,
`param`, `section`, `source`, `summary`, `table`, `tbody`, `td`, `tfoot`, `th`,
`thead`, `title`, `tr`, `track`, and `ul`.

### 16.3 Named character references

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

## 17 References

*   **\[HTML]**:
    [HTML Standard](https://html.spec.whatwg.org/multipage/).
    A. van Kesteren, et al.
    WHATWG.
*   **\[RFC20]**:
    [ASCII format for network interchange](https://tools.ietf.org/html/rfc20).
    V.G. Cerf.
    October 1969.
    IETF.
*   **\[RFC5322]**:
    [Internet Message Format](https://tools.ietf.org/html/rfc5322).
    P. Resnick.
    IETF.
*   **\[UNICODE]**:
    [The Unicode Standard](https://www.unicode.org/versions/).
    Unicode Consortium.

## 18 Acknowledgments

Thanks to John Gruber for inventing Markdown.

Thanks to John MacFarlane for defining CommonMark.

Thanks to ZEIT, Inc., Gatsby, Inc., Netlify, Inc., Holloway, Inc., and the many
organizations and individuals for financial support through
[OpenCollective](https://opencollective.com/unified)

## 19 License

Copyright © 2019 Titus Wormer.
This work is licensed under a
[Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

[stack-of-continuation]: #stack-of-continuation

[ceof]: #ceof

[ceol]: #ceol

[cvs]: #cvs

[ascii-digit]: #ascii-digit

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

[atext]: #atext

[input-stream]: #input-stream

[input-character]: #input-character

[content-stream]: #content-stream

[content-character]: #content-character

[stack-of-open-groups]: #stack-of-open-groups

[current-group]: #current-group

[queue]: #queue

[current-token]: #current-token

[block-state-machine]: #block-state-machine

[content-state-machine]: #content-state-machine

[inline-state-machine]: #inline-state-machine

[process-as-an-atx-heading]: #process-as-an-atx-heading

[process-as-a-setext-primary-heading]: #process-as-a-setext-primary-heading

[process-as-an-asterisk-line]: #process-as-an-asterisk-line

[process-as-an-asterisk-line-opening]: #process-as-an-asterisk-line-opening

[process-as-a-fenced-code-fence]: #process-as-a-fenced-code-fence

[process-as-raw-text]: #process-as-raw-text

[process-as-phrasing]: #process-as-phrasing

[raw-tag]: #raw-tag

[simple-tag]: #simple-tag

[character-reference-name]: #character-reference-name

[s-initial]: #91-initial-state

[s-initial-whitespace]: #92-initial-whitespace-state

[s-line-ending]: #93-line-ending-state

[s-carriage-return]: #94-carriage-return-state

[s-in-line]: #95-in-line-state

[s-atx-heading-open-sequence]: #96-atx-heading-open-sequence-state

[s-atx-heading-open-sequence-after]: #97-atx-heading-open-sequence-after-state

[s-atx-heading-content]: #98-atx-heading-content-state

[s-atx-heading-whitespace]: #99-atx-heading-whitespace-state

[s-atx-heading-number-sign-sequence]: #910-atx-heading-number-sign-sequence-state

[s-asterisk-line-asterisk-after]: #911-asterisk-line-asterisk-after-state

[s-asterisk-line-whitespace]: #912-asterisk-line-whitespace-state

[s-html-block-open]: #913-html-block-open-state

[s-html-block-open-markup-declaration]: #914-html-block-open-markup-declaration-state

[s-html-block-open-comment-inside]: #915-html-block-open-comment-inside-state

[s-html-block-open-character-data-inside]: #916-html-block-open-character-data-inside-state

[s-html-block-open-close-tag-start]: #917-html-block-open-close-tag-start-state

[s-html-block-open-tag-name-inside]: #918-html-block-open-tag-name-inside-state

[s-html-block-open-simple-self-closing]: #919-html-block-open-simple-self-closing-state

[s-html-block-open-complete-attribute-before]: #920-html-block-open-complete-attribute-before-state

[s-html-block-open-complete-attribute-name]: #921-html-block-open-complete-attribute-name-state

[s-html-block-open-complete-attribute-name-after]: #922-html-block-open-complete-attribute-name-after-state

[s-html-block-open-complete-attribute-value-before]: #923-html-block-open-complete-attribute-value-before-state

[s-html-block-open-complete-double-quoted-attribute-value]: #924-html-block-open-complete-double-quoted-attribute-value-state

[s-html-block-open-complete-single-quoted-attribute-value]: #925-html-block-open-complete-single-quoted-attribute-value-state

[s-html-block-open-complete-unquoted-attribute-value]: #926-html-block-open-complete-unquoted-attribute-value-state

[s-html-block-open-complete-self-closing]: #927-html-block-open-complete-self-closing-state

[s-html-block-open-complete-tag-after]: #928-html-block-open-complete-tag-after-state

[s-html-block-continuation-line]: #929-html-block-continuation-line-state

[s-html-block-continuation-tag-close]: #930-html-block-continuation-tag-close-state

[s-html-block-continuation-tag-close-name-inside]: #931-html-block-continuation-tag-close-name-inside-state

[s-html-block-continuation-comment-inside]: #932-html-block-continuation-comment-inside-state

[s-html-block-continuation-character-data-inside]: #933-html-block-continuation-character-data-inside-state

[s-html-block-continuation-declaration-before]: #934-html-block-continuation-declaration-before-state

[s-html-block-close-line]: #935-html-block-close-line-state

[s-setext-heading-underline-equals-to-sequence]: #936-setext-heading-underline-equals-to-sequence-state

[s-setext-heading-underline-equals-to-after]: #937-setext-heading-underline-equals-to-after-state

[s-fenced-code-grave-accent-fence-open]: #938-fenced-code-grave-accent-fence-open-state

[s-fenced-code-grave-accent-fence-open-whitespace]: #939-fenced-code-grave-accent-fence-open-whitespace-state

[s-fenced-code-grave-accent-fence-open-metadata]: #940-fenced-code-grave-accent-fence-open-metadata-state

[s-fenced-code-tilde-fence-open]: #941-fenced-code-tilde-fence-open-state

[s-fenced-code-tilde-fence-open-whitespace]: #942-fenced-code-tilde-fence-open-whitespace-state

[s-fenced-code-tilde-fence-open-metadata]: #943-fenced-code-tilde-fence-open-metadata-state

[s-fenced-code-continuation-line]: #944-fenced-code-continuation-line-state

[s-fenced-code-close-sequence]: #945-fenced-code-close-sequence-state

[s-fenced-code-close-whitespace]: #946-fenced-code-close-whitespace-state

[s-indented-code-line]: #947-indented-code-line-state

[s-content-continuation]: #948-content-continuation-state

[s-initial-content]: #101-initial-content-state

[s-definition-label-open-after]: #102-definition-label-open-after-state

[s-definition-label-before]: #103-definition-label-before-state

[s-definition-label-inside]: #104-definition-label-inside-state

[s-definition-label-inside-start-after]: #105-definition-label-inside-start-after-state

[s-definition-label-between]: #106-definition-label-between-state

[s-definition-label-escape]: #107-definition-label-escape-state

[s-definition-label-close-after]: #108-definition-label-close-after-state

[s-definition-label-after]: #109-definition-label-after-state

[s-definition-destination-before]: #1010-definition-destination-before-state

[s-definition-destination-quoted-open-after]: #1011-definition-destination-quoted-open-after-state

[s-definition-destination-quoted-inside]: #1012-definition-destination-quoted-inside-state

[s-definition-destination-quoted-escape]: #1013-definition-destination-quoted-escape-state

[s-definition-destination-quoted-close-after]: #1014-definition-destination-quoted-close-after-state

[s-definition-destination-unquoted-inside]: #1015-definition-destination-unquoted-inside-state

[s-definition-destination-unquoted-escape]: #1016-definition-destination-unquoted-escape-state

[s-definition-destination-after]: #1017-definition-destination-after-state

[s-definition-title-double-quoted-open-after]: #1018-definition-title-double-quoted-open-after-state

[s-definition-title-double-quoted-inside]: #1019-definition-title-double-quoted-inside-state

[s-definition-title-double-quoted-escape]: #1020-definition-title-double-quoted-escape-state

[s-definition-title-single-quoted-open-after]: #1021-definition-title-single-quoted-open-after-state

[s-definition-title-single-quoted-inside]: #1022-definition-title-single-quoted-inside-state

[s-definition-title-single-quoted-escape]: #1023-definition-title-single-quoted-escape-state

[s-definition-title-paren-quoted-open-after]: #1024-definition-title-paren-quoted-open-after-state

[s-definition-title-paren-quoted-inside]: #1025-definition-title-paren-quoted-inside-state

[s-definition-title-paren-quoted-escape]: #1026-definition-title-paren-quoted-escape-state

[s-definition-title-close-after]: #1027-definition-title-close-after-state

[s-definition-after]: #1028-definition-after-state

[s-phrasing-content]: #1029-phrasing-content-state

[s-initial-inline]: #111-initial-inline-state

[s-emphasis-asterisk]: #112-emphasis-asterisk-state

[s-character-reference]: #113-character-reference-state

[s-character-reference-named]: #114-character-reference-named-state

[s-character-reference-numeric]: #115-character-reference-numeric-state

[s-character-reference-hexadecimal-start]: #116-character-reference-hexadecimal-start-state

[s-character-reference-hexadecimal]: #117-character-reference-hexadecimal-state

[s-character-reference-decimal]: #118-character-reference-decimal-state

[s-code-span-open]: #119-code-span-open-state

[s-code-span-inside-start-after]: #1110-code-span-inside-start-after-state

[s-code-span-inside]: #1111-code-span-inside-state

[s-code-span-close]: #1112-code-span-close-state

[s-emphasis-underscore]: #1113-emphasis-underscore-state

[s-escape-backslash-after]: #1114-escape-backslash-after-state

[s-image-exclamation-mark-after]: #1115-image-exclamation-mark-after-state

[s-html-or-autolink-less-than-after]: #1116-html-or-autolink-less-than-after-state

[s-html-instruction-or-email-atext]: #1117-html-instruction-or-email-atext-state

[s-html-instruction-close-or-email-atext]: #1118-html-instruction-close-or-email-atext-state

[s-html-instruction-or-email-at-sign-or-dot]: #1119-html-instruction-or-email-at-sign-or-dot-state

[s-html-instruction-or-email-label]: #1120-html-instruction-or-email-label-state

[s-html-instruction-or-email-dash]: #1121-html-instruction-or-email-dash-state

[s-html-instruction]: #1122-html-instruction-state

[s-html-instruction-close]: #1123-html-instruction-close-state

[s-html-declaration-or-email-atext]: #1124-html-declaration-or-email-atext-state

[s-html-comment-open-inside-or-email-atext]: #1125-html-comment-open-inside-or-email-atext-state

[s-html-comment-or-email-atext]: #1126-html-comment-or-email-atext-state

[s-html-comment-close-inside-or-email-atext]: #1127-html-comment-close-inside-or-email-atext-state

[s-html-comment-close-or-email-atext]: #1128-html-comment-close-or-email-atext-state

[s-html-comment-or-email-at-sign-or-dot]: #1129-html-comment-or-email-at-sign-or-dot-state

[s-html-comment-or-email-label]: #1130-html-comment-or-email-label-state

[s-html-comment-close-inside-or-email-label-dash]: #1131-html-comment-close-inside-or-email-label-dash-state

[s-html-comment-close-or-email-label-dash]: #1132-html-comment-close-or-email-label-dash-state

[s-html-comment]: #1133-html-comment-state

[s-html-comment-close-inside]: #1134-html-comment-close-inside-state

[s-html-comment-close]: #1135-html-comment-close-state

[s-html-cdata]: #1136-html-cdata-state

[s-html-declaration-name-or-email-atext]: #1137-html-declaration-name-or-email-atext-state

[s-html-declaration-between]: #1138-html-declaration-between-state

[s-html-declaration-content]: #1139-html-declaration-content-state

[s-html-tag-close-or-email-atext]: #1140-html-tag-close-or-email-atext-state

[s-html-tag-close-inside-or-email-atext]: #1141-html-tag-close-inside-or-email-atext-state

[s-html-tag-close-between]: #1142-html-tag-close-between-state

[s-html-tag-open-scheme-or-email-atext]: #1143-html-tag-open-scheme-or-email-atext-state

[s-html-tag-open-inside-scheme-inside-or-email-atext]: #1144-html-tag-open-inside-scheme-inside-or-email-atext-state

[s-html-tag-open-inside-or-email-atext]: #1145-html-tag-open-inside-or-email-atext-state

[s-html-tag-open-between-start-after]: #1146-html-tag-open-between-start-after-state

[s-html-tag-open-between]: #1147-html-tag-open-between-state

[s-html-tag-open-attribute-name]: #1148-html-tag-open-attribute-name-state

[s-html-tag-open-attribute-name-after]: #1149-html-tag-open-attribute-name-after-state

[s-html-tag-open-attribute-value-before]: #1150-html-tag-open-attribute-value-before-state

[s-html-tag-open-double-quoted-attribute-value]: #1151-html-tag-open-double-quoted-attribute-value-state

[s-html-tag-open-single-quoted-attribute-value]: #1152-html-tag-open-single-quoted-attribute-value-state

[s-html-tag-open-unquoted-attribute-value]: #1153-html-tag-open-unquoted-attribute-value-state

[s-html-tag-open-self-closing]: #1154-html-tag-open-self-closing-state

[s-autolink-scheme-inside-or-email-atext]: #1155-autolink-scheme-inside-or-email-atext-state

[s-autolink-uri-inside]: #1156-autolink-uri-inside-state

[s-autolink-email-atext]: #1157-autolink-email-atext-state

[s-autolink-email-label]: #1158-autolink-email-label-state

[s-autolink-email-at-sign-or-dot]: #1159-autolink-email-at-sign-or-dot-state

[s-autolink-email-dash]: #1160-autolink-email-dash-state

[l-content-phrasing]: #121-content-phrasing-label

[l-content-definition]: #122-content-definition-label

[l-content-definition-partial]: #123-content-definition-partial-label

[l-content-definition-label-open]: #124-content-definition-label-open-label

[l-content-definition-label-close]: #125-content-definition-label-close-label

[l-content-definition-destination-quoted-open]: #126-content-definition-destination-quoted-open-label

[l-content-definition-destination-quoted-close]: #127-content-definition-destination-quoted-close-label

[l-content-definition-destination-unquoted-open]: #128-content-definition-destination-unquoted-open-label

[l-content-definition-destination-unquoted-close]: #129-content-definition-destination-unquoted-close-label

[l-content-definition-title-open]: #1210-content-definition-title-open-label

[l-content-definition-title-close]: #1211-content-definition-title-close-label

[l-text-link-open]: #1212-text-link-open-label

[l-text-image-open]: #1213-text-image-open-label

[l-text-link-close]: #1214-text-link-close-label

[l-text-emphasis]: #1215-text-emphasis-label

[l-text-character-reference]: #1216-text-character-reference-label

[l-text-escape]: #1217-text-escape-label

[l-text-code]: #1218-text-code-label

[l-text-autolink-email]: #1219-text-autolink-email-label

[l-text-autolink-uri]: #1220-text-autolink-uri-label

[l-text-html]: #1221-text-html-label

[t-whitespace]: #141-whitespace-token

[t-line-terminator]: #142-line-terminator-token

[t-end-of-file]: #143-end-of-file-token

[t-end-of-line]: #144-end-of-line-token

[t-marker]: #145-marker-token

[t-sequence]: #146-sequence-token

[t-content]: #147-content-token

[g-blank-line]: #151-blank-line-group

[g-atx-heading]: #152-atx-heading-group

[g-atx-heading-fence]: #153-atx-heading-fence-group

[g-atx-heading-content]: #154-atx-heading-content-group

[g-thematic-break]: #155-thematic-break-group

[g-html]: #156-html-group

[g-html-line]: #157-html-line-group

[g-indented-code]: #158-indented-code-group

[g-indented-code-line]: #159-indented-code-line-group

[g-blockquote]: #1510-blockquote-group

[g-fenced-code]: #1511-fenced-code-group

[g-fenced-code-fence]: #1512-fenced-code-fence-group

[g-fenced-code-language]: #1513-fenced-code-language-group

[g-fenced-code-metadata]: #1514-fenced-code-metadata-group

[g-fenced-code-line]: #1515-fenced-code-line-group

[g-content]: #1516-content-group

[g-content-line]: #1517-content-line-group

[g-setext-heading]: #1518-setext-heading-group

[g-setext-heading-underline]: #1519-setext-heading-underline-group

[g-definition]: #1520-definition-group

[g-definition-label]: #1521-definition-label-group

[g-definition-label-content]: #1522-definition-label-content-group

[g-definition-destination-quoted]: #1523-definition-destination-quoted-group

[g-definition-destination-unquoted]: #1524-definition-destination-unquoted-group

[g-definition-title]: #1525-definition-title-group

[g-escape]: #1526-escape-group

[g-character-reference]: #1527-character-reference-group

[g-automatic-link]: #1528-automatic-link-group

[g-html-inline]: #1529-html-inline-group
