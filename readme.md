# CMSM

> Common markup state machine.

Together, the parsing rules described below define what is referred to as a
Common Markup parser.

> This document is currently in progress.
> It is developed jointly with a reference parser:
> [`micromark`](https://github.com/micromark/micromark).
> Contributions are welcome.
>
> Some parts that are still in progress:
>
> *   Adapters
> *   Define the regular constructs
> *   Adapter for rich text to check whether emphasis, strong, resource, or
>     reference sequences make up syntax or text
> *   Tokenizing the input stream in reverse (GFM allows `asd@asd.com`, so it
>     seems we need to somehow allow to match the `@` and parse backwards)
> *   Add an appendix of extensions

## Table of contents

*   [1 Background](#1-background)
*   [2 Overview](#2-overview)
*   [3 Infra](#3-infra)
*   [4 Characters](#4-characters)
    *   [4.1 Character groups](#41-character-groups)
    *   [4.2 Conceptual characters](#42-conceptual-characters)
    *   [4.3 Tabs](#43-tabs)
*   [5 Input stream](#5-input-stream)
    *   [5.1 Preprocessing the input stream](#51-preprocessing-the-input-stream)
*   [6 Parsing](#6-parsing)
    *   [6.1 Tokenization](#61-tokenization)
    *   [6.2 State](#62-state)
    *   [6.3 Constructs](#63-constructs)
    *   [6.4 Effects](#64-effects)
*   [7 Flow state machine](#7-flow-state-machine)
    *   [7.1 Flow prefix start state](#71-flow-prefix-start-state)
    *   [7.2 Flow start state](#72-flow-start-state)
    *   [7.3 Flow prefix initial state](#73-flow-prefix-initial-state)
    *   [7.4 Flow initial state](#74-flow-initial-state)
    *   [7.5 Blank line state](#75-blank-line-state)
    *   [7.6 ATX heading start state](#76-atx-heading-start-state)
    *   [7.7 ATX heading fence open inside state](#77-atx-heading-fence-open-inside-state)
    *   [7.8 ATX heading inside state](#78-atx-heading-inside-state)
    *   [7.9 Thematic break asterisk start state](#79-thematic-break-asterisk-start-state)
    *   [7.10 Thematic break asterisk inside state](#710-thematic-break-asterisk-inside-state)
    *   [7.11 Setext heading underline dash start state](#711-setext-heading-underline-dash-start-state)
    *   [7.12 Setext heading underline dash inside state](#712-setext-heading-underline-dash-inside-state)
    *   [7.13 Setext heading underline dash after state](#713-setext-heading-underline-dash-after-state)
    *   [7.14 Thematic break dash start state](#714-thematic-break-dash-start-state)
    *   [7.15 Thematic break dash inside state](#715-thematic-break-dash-inside-state)
    *   [7.16 Flow HTML start state](#716-flow-html-start-state)
    *   [7.17 Flow HTML tag open state](#717-flow-html-tag-open-state)
    *   [7.18 Flow HTML markup declaration open state](#718-flow-html-markup-declaration-open-state)
    *   [7.19 Flow HTML end tag open state](#719-flow-html-end-tag-open-state)
    *   [7.20 Flow HTML tag name state](#720-flow-html-tag-name-state)
    *   [7.21 Flow HTML basic self closing state](#721-flow-html-basic-self-closing-state)
    *   [7.22 Flow HTML complete attribute name before state](#722-flow-html-complete-attribute-name-before-state)
    *   [7.23 Flow HTML complete attribute name state](#723-flow-html-complete-attribute-name-state)
    *   [7.24 Flow HTML complete attribute name after state](#724-flow-html-complete-attribute-name-after-state)
    *   [7.25 Flow HTML complete attribute value before state](#725-flow-html-complete-attribute-value-before-state)
    *   [7.26 Flow HTML complete attribute value double quoted state](#726-flow-html-complete-attribute-value-double-quoted-state)
    *   [7.27 Flow HTML complete attribute value single quoted state](#727-flow-html-complete-attribute-value-single-quoted-state)
    *   [7.28 Flow HTML complete attribute value unquoted state](#728-flow-html-complete-attribute-value-unquoted-state)
    *   [7.29 Flow HTML complete self closing state](#729-flow-html-complete-self-closing-state)
    *   [7.30 Flow HTML complete tag after state](#730-flow-html-complete-tag-after-state)
    *   [7.31 Flow HTML continuation state](#731-flow-html-continuation-state)
    *   [7.32 Flow HTML continuation comment inside state](#732-flow-html-continuation-comment-inside-state)
    *   [7.33 Flow HTML continuation raw tag open state](#733-flow-html-continuation-raw-tag-open-state)
    *   [7.34 Flow HTML continuation raw end tag state](#734-flow-html-continuation-raw-end-tag-state)
    *   [7.35 Flow HTML continuation character data inside state](#735-flow-html-continuation-character-data-inside-state)
    *   [7.36 Flow HTML continuation declaration before state](#736-flow-html-continuation-declaration-before-state)
    *   [7.37 Flow HTML continuation close state](#737-flow-html-continuation-close-state)
    *   [7.38 Setext heading underline equals to start state](#738-setext-heading-underline-equals-to-start-state)
    *   [7.39 Setext heading underline equals to inside state](#739-setext-heading-underline-equals-to-inside-state)
    *   [7.40 Setext heading underline equals to after state](#740-setext-heading-underline-equals-to-after-state)
    *   [7.41 Thematic break underscore start state](#741-thematic-break-underscore-start-state)
    *   [7.42 Thematic break underscore inside state](#742-thematic-break-underscore-inside-state)
    *   [7.43 Fenced code grave accent start state](#743-fenced-code-grave-accent-start-state)
    *   [7.44 Fenced code grave accent open fence inside state](#744-fenced-code-grave-accent-open-fence-inside-state)
    *   [7.45 Fenced code grave accent open fence after state](#745-fenced-code-grave-accent-open-fence-after-state)
    *   [7.46 Fenced code grave accent continuation state](#746-fenced-code-grave-accent-continuation-state)
    *   [7.47 Fenced code grave accent close fence inside state](#747-fenced-code-grave-accent-close-fence-inside-state)
    *   [7.48 Fenced code grave accent close fence after state](#748-fenced-code-grave-accent-close-fence-after-state)
    *   [7.49 Fenced code grave accent continuation inside state](#749-fenced-code-grave-accent-continuation-inside-state)
    *   [7.50 Fenced code tilde start state](#750-fenced-code-tilde-start-state)
    *   [7.51 Fenced code tilde open fence inside state](#751-fenced-code-tilde-open-fence-inside-state)
    *   [7.52 Fenced code tilde open fence after state](#752-fenced-code-tilde-open-fence-after-state)
    *   [7.53 Fenced code tilde continuation state](#753-fenced-code-tilde-continuation-state)
    *   [7.54 Fenced code tilde close fence inside state](#754-fenced-code-tilde-close-fence-inside-state)
    *   [7.55 Fenced code tilde close fence after state](#755-fenced-code-tilde-close-fence-after-state)
    *   [7.56 Fenced code tilde continuation inside state](#756-fenced-code-tilde-continuation-inside-state)
    *   [7.57 Flow content state](#757-flow-content-state)
*   [8 Content state machine](#8-content-state-machine)
    *   [8.1 Content start state](#81-content-start-state)
    *   [8.2 Content initial state](#82-content-initial-state)
    *   [8.3 Definition label start state](#83-definition-label-start-state)
    *   [8.4 Definition label before state](#84-definition-label-before-state)
    *   [8.5 Definition label inside state](#85-definition-label-inside-state)
    *   [8.6 Definition label between state](#86-definition-label-between-state)
    *   [8.7 Definition label escape state](#87-definition-label-escape-state)
    *   [8.8 Definition label after state](#88-definition-label-after-state)
    *   [8.9 Definition destination before state](#89-definition-destination-before-state)
    *   [8.10 Definition destination quoted inside state](#810-definition-destination-quoted-inside-state)
    *   [8.11 Definition destination quoted escape state](#811-definition-destination-quoted-escape-state)
    *   [8.12 Definition destination unquoted inside state](#812-definition-destination-unquoted-inside-state)
    *   [8.13 Definition destination unquoted escape state](#813-definition-destination-unquoted-escape-state)
    *   [8.14 Definition destination after state](#814-definition-destination-after-state)
    *   [8.15 Definition title before state](#815-definition-title-before-state)
    *   [8.16 Definition title or label before state](#816-definition-title-or-label-before-state)
    *   [8.17 Definition title double quoted state](#817-definition-title-double-quoted-state)
    *   [8.18 Definition title double quoted between state](#818-definition-title-double-quoted-between-state)
    *   [8.19 Definition title double quoted escape state](#819-definition-title-double-quoted-escape-state)
    *   [8.20 Definition title single quoted state](#820-definition-title-single-quoted-state)
    *   [8.21 Definition title single quoted between state](#821-definition-title-single-quoted-between-state)
    *   [8.22 Definition title single quoted escape state](#822-definition-title-single-quoted-escape-state)
    *   [8.23 Definition title paren quoted state](#823-definition-title-paren-quoted-state)
    *   [8.24 Definition title paren quoted between state](#824-definition-title-paren-quoted-between-state)
    *   [8.25 Definition title paren quoted escape state](#825-definition-title-paren-quoted-escape-state)
    *   [8.26 Definition title after state](#826-definition-title-after-state)
    *   [8.27 Phrasing content state](#827-phrasing-content-state)
*   [9 Text state machine](#9-text-state-machine)
    *   [9.1 Text start state](#91-text-start-state)
    *   [9.2 Text initial state](#92-text-initial-state)
    *   [9.3 Text state](#93-text-state)
    *   [9.4 Plain text state](#94-plain-text-state)
    *   [9.5 End-of-line state](#95-end-of-line-state)
    *   [9.6 Plain end-of-line state](#96-plain-end-of-line-state)
    *   [9.7 Image label start state](#97-image-label-start-state)
    *   [9.8 Image label start after state](#98-image-label-start-after-state)
    *   [9.9 Character reference state](#99-character-reference-state)
    *   [9.10 Character reference start after state](#910-character-reference-start-after-state)
    *   [9.11 Character reference named state](#911-character-reference-named-state)
    *   [9.12 Character reference numeric state](#912-character-reference-numeric-state)
    *   [9.13 Character reference hexadecimal start state](#913-character-reference-hexadecimal-start-state)
    *   [9.14 Character reference hexadecimal state](#914-character-reference-hexadecimal-state)
    *   [9.15 Character reference decimal state](#915-character-reference-decimal-state)
    *   [9.16 Delimiter run asterisk start state](#916-delimiter-run-asterisk-start-state)
    *   [9.17 Delimiter run asterisk state](#917-delimiter-run-asterisk-state)
    *   [9.18 Autolink state](#918-autolink-state)
    *   [9.19 Autolink open state](#919-autolink-open-state)
    *   [9.20 Autolink email atext state](#920-autolink-email-atext-state)
    *   [9.21 Autolink email label state](#921-autolink-email-label-state)
    *   [9.22 Autolink email at sign or dot state](#922-autolink-email-at-sign-or-dot-state)
    *   [9.23 Autolink email dash state](#923-autolink-email-dash-state)
    *   [9.24 Autolink scheme or email atext state](#924-autolink-scheme-or-email-atext-state)
    *   [9.25 Autolink scheme inside or email atext state](#925-autolink-scheme-inside-or-email-atext-state)
    *   [9.26 Autolink URI inside state](#926-autolink-uri-inside-state)
    *   [9.27 HTML state](#927-html-state)
    *   [9.28 HTML open state](#928-html-open-state)
    *   [9.29 HTML declaration start state](#929-html-declaration-start-state)
    *   [9.30 HTML comment open inside state](#930-html-comment-open-inside-state)
    *   [9.31 HTML comment inside state](#931-html-comment-inside-state)
    *   [9.32 HTML comment close inside state](#932-html-comment-close-inside-state)
    *   [9.33 HTML comment close state](#933-html-comment-close-state)
    *   [9.34 HTML CDATA inside state](#934-html-cdata-inside-state)
    *   [9.35 HTML declaration inside state](#935-html-declaration-inside-state)
    *   [9.36 HTML instruction inside state](#936-html-instruction-inside-state)
    *   [9.37 HTML instruction close state](#937-html-instruction-close-state)
    *   [9.38 HTML tag close start state](#938-html-tag-close-start-state)
    *   [9.39 HTML tag close inside state](#939-html-tag-close-inside-state)
    *   [9.40 HTML tag close between state](#940-html-tag-close-between-state)
    *   [9.41 HTML tag open inside state](#941-html-tag-open-inside-state)
    *   [9.42 HTML tag open between state](#942-html-tag-open-between-state)
    *   [9.43 HTML tag open self closing state](#943-html-tag-open-self-closing-state)
    *   [9.44 HTML tag open attribute name state](#944-html-tag-open-attribute-name-state)
    *   [9.45 HTML tag open attribute name after state](#945-html-tag-open-attribute-name-after-state)
    *   [9.46 HTML tag open attribute before state](#946-html-tag-open-attribute-before-state)
    *   [9.47 HTML tag open double quoted attribute state](#947-html-tag-open-double-quoted-attribute-state)
    *   [9.48 HTML tag open single quoted attribute state](#948-html-tag-open-single-quoted-attribute-state)
    *   [9.49 HTML tag open unquoted attribute state](#949-html-tag-open-unquoted-attribute-state)
    *   [9.50 Link label start state](#950-link-label-start-state)
    *   [9.51 Character escape state](#951-character-escape-state)
    *   [9.52 Character escape after state](#952-character-escape-after-state)
    *   [9.53 Break escape state](#953-break-escape-state)
    *   [9.54 Break escape after state](#954-break-escape-after-state)
    *   [9.55 Label resource close state](#955-label-resource-close-state)
    *   [9.56 Label resource end after state](#956-label-resource-end-after-state)
    *   [9.57 Resource information open state](#957-resource-information-open-state)
    *   [9.58 Resource information destination quoted inside state](#958-resource-information-destination-quoted-inside-state)
    *   [9.59 Resource information destination quoted escape state](#959-resource-information-destination-quoted-escape-state)
    *   [9.60 Resource information destination quoted after state](#960-resource-information-destination-quoted-after-state)
    *   [9.61 Resource information destination unquoted inside state](#961-resource-information-destination-unquoted-inside-state)
    *   [9.62 Resource information destination unquoted escape state](#962-resource-information-destination-unquoted-escape-state)
    *   [9.63 Resource information between state](#963-resource-information-between-state)
    *   [9.64 Resource information title double quoted inside state](#964-resource-information-title-double-quoted-inside-state)
    *   [9.65 Resource information title double quoted escape state](#965-resource-information-title-double-quoted-escape-state)
    *   [9.66 Resource information title single quoted inside state](#966-resource-information-title-single-quoted-inside-state)
    *   [9.67 Resource information title single quoted escape state](#967-resource-information-title-single-quoted-escape-state)
    *   [9.68 Resource information title paren quoted inside state](#968-resource-information-title-paren-quoted-inside-state)
    *   [9.69 Resource information title paren quoted escape state](#969-resource-information-title-paren-quoted-escape-state)
    *   [9.70 Resource information title after state](#970-resource-information-title-after-state)
    *   [9.71 Label reference close state](#971-label-reference-close-state)
    *   [9.72 Label reference end after state](#972-label-reference-end-after-state)
    *   [9.73 Reference label open state](#973-reference-label-open-state)
    *   [9.74 Reference label inside state](#974-reference-label-inside-state)
    *   [9.75 Reference label between state](#975-reference-label-between-state)
    *   [9.76 Reference label escape state](#976-reference-label-escape-state)
    *   [9.77 Label reference shortcut close state](#977-label-reference-shortcut-close-state)
    *   [9.78 Delimiter run underscore start state](#978-delimiter-run-underscore-start-state)
    *   [9.79 Delimiter run underscore state](#979-delimiter-run-underscore-state)
    *   [9.80 Code start state](#980-code-start-state)
    *   [9.81 Code open fence inside state](#981-code-open-fence-inside-state)
    *   [9.82 Code between state](#982-code-between-state)
    *   [9.83 Code inside state](#983-code-inside-state)
    *   [9.84 Code close fence inside state](#984-code-close-fence-inside-state)
*   [10 Labels](#10-labels)
    *   [10.1 NOK label](#101-nok-label)
    *   [10.2 Blank line end label](#102-blank-line-end-label)
    *   [10.3 ATX heading start label](#103-atx-heading-start-label)
    *   [10.4 ATX heading fence start label](#104-atx-heading-fence-start-label)
    *   [10.5 ATX heading fence end label](#105-atx-heading-fence-end-label)
    *   [10.6 ATX heading end label](#106-atx-heading-end-label)
    *   [10.7 Thematic break start label](#107-thematic-break-start-label)
    *   [10.8 Thematic break end label](#108-thematic-break-end-label)
    *   [10.9 Setext heading underline start label](#109-setext-heading-underline-start-label)
    *   [10.10 Setext heading underline end label](#1010-setext-heading-underline-end-label)
    *   [10.11 Fenced code start label](#1011-fenced-code-start-label)
    *   [10.12 Fenced code fence start label](#1012-fenced-code-fence-start-label)
    *   [10.13 Fenced code fence sequence start label](#1013-fenced-code-fence-sequence-start-label)
    *   [10.14 Fenced code fence sequence end label](#1014-fenced-code-fence-sequence-end-label)
    *   [10.15 Fenced code fence end label](#1015-fenced-code-fence-end-label)
    *   [10.16 Fenced code end label](#1016-fenced-code-end-label)
    *   [10.17 Content definition partial label](#1017-content-definition-partial-label)
    *   [10.18 Content definition start label](#1018-content-definition-start-label)
    *   [10.19 Content definition label start label](#1019-content-definition-label-start-label)
    *   [10.20 Content definition label open label](#1020-content-definition-label-open-label)
    *   [10.21 Content definition label close label](#1021-content-definition-label-close-label)
    *   [10.22 Content definition label end label](#1022-content-definition-label-end-label)
    *   [10.23 Content definition destination start label](#1023-content-definition-destination-start-label)
    *   [10.24 Content definition destination quoted open label](#1024-content-definition-destination-quoted-open-label)
    *   [10.25 Content definition destination quoted close label](#1025-content-definition-destination-quoted-close-label)
    *   [10.26 Content definition destination unquoted open label](#1026-content-definition-destination-unquoted-open-label)
    *   [10.27 Content definition destination unquoted close label](#1027-content-definition-destination-unquoted-close-label)
    *   [10.28 Content definition destination end label](#1028-content-definition-destination-end-label)
    *   [10.29 Content definition title start label](#1029-content-definition-title-start-label)
    *   [10.30 Content definition title open label](#1030-content-definition-title-open-label)
    *   [10.31 Content definition title close label](#1031-content-definition-title-close-label)
    *   [10.32 Content definition title end label](#1032-content-definition-title-end-label)
    *   [10.33 Content definition end label](#1033-content-definition-end-label)
    *   [10.34 Hard break label](#1034-hard-break-label)
    *   [10.35 Soft break label](#1035-soft-break-label)
    *   [10.36 Image label start label](#1036-image-label-start-label)
    *   [10.37 Image label open label](#1037-image-label-open-label)
    *   [10.38 Character reference start label](#1038-character-reference-start-label)
    *   [10.39 Character reference end label](#1039-character-reference-end-label)
    *   [10.40 Delimiter run start label](#1040-delimiter-run-start-label)
    *   [10.41 Delimiter run end label](#1041-delimiter-run-end-label)
    *   [10.42 Autolink start label](#1042-autolink-start-label)
    *   [10.43 Autolink open label](#1043-autolink-open-label)
    *   [10.44 Autolink email close label](#1044-autolink-email-close-label)
    *   [10.45 Autolink email end label](#1045-autolink-email-end-label)
    *   [10.46 Autolink uri close label](#1046-autolink-uri-close-label)
    *   [10.47 Autolink uri end label](#1047-autolink-uri-end-label)
    *   [10.48 HTML start label](#1048-html-start-label)
    *   [10.49 HTML end label](#1049-html-end-label)
    *   [10.50 Link label start label](#1050-link-label-start-label)
    *   [10.51 Link label open label](#1051-link-label-open-label)
    *   [10.52 Character escape start label](#1052-character-escape-start-label)
    *   [10.53 Character escape end label](#1053-character-escape-end-label)
    *   [10.54 Break escape start label](#1054-break-escape-start-label)
    *   [10.55 Break escape end label](#1055-break-escape-end-label)
    *   [10.56 Label close label](#1056-label-close-label)
    *   [10.57 Label end label](#1057-label-end-label)
    *   [10.58 Resource information start label](#1058-resource-information-start-label)
    *   [10.59 Resource information open label](#1059-resource-information-open-label)
    *   [10.60 Resource information destination quoted start label](#1060-resource-information-destination-quoted-start-label)
    *   [10.61 Resource information destination quoted open label](#1061-resource-information-destination-quoted-open-label)
    *   [10.62 Resource information destination quoted close label](#1062-resource-information-destination-quoted-close-label)
    *   [10.63 Resource information destination quoted end label](#1063-resource-information-destination-quoted-end-label)
    *   [10.64 Resource information destination unquoted start label](#1064-resource-information-destination-unquoted-start-label)
    *   [10.65 Resource information destination unquoted open label](#1065-resource-information-destination-unquoted-open-label)
    *   [10.66 Resource information destination unquoted close label](#1066-resource-information-destination-unquoted-close-label)
    *   [10.67 Resource information destination unquoted end label](#1067-resource-information-destination-unquoted-end-label)
    *   [10.68 Resource information title start label](#1068-resource-information-title-start-label)
    *   [10.69 Resource information title open label](#1069-resource-information-title-open-label)
    *   [10.70 Resource information title close label](#1070-resource-information-title-close-label)
    *   [10.71 Resource information title end label](#1071-resource-information-title-end-label)
    *   [10.72 Resource information close label](#1072-resource-information-close-label)
    *   [10.73 Resource information end label](#1073-resource-information-end-label)
    *   [10.74 Reference label start label](#1074-reference-label-start-label)
    *   [10.75 Reference label open label](#1075-reference-label-open-label)
    *   [10.76 Reference label collapsed close label](#1076-reference-label-collapsed-close-label)
    *   [10.77 Reference label full close label](#1077-reference-label-full-close-label)
    *   [10.78 Reference label end label](#1078-reference-label-end-label)
    *   [10.79 Code start label](#1079-code-start-label)
    *   [10.80 Code fence start label](#1080-code-fence-start-label)
    *   [10.81 Code fence end label](#1081-code-fence-end-label)
    *   [10.82 Code end label](#1082-code-end-label)
*   [11 Tokens](#11-tokens)
    *   [11.1 Whitespace token](#111-whitespace-token)
    *   [11.2 Line terminator token](#112-line-terminator-token)
    *   [11.3 End-of-file token](#113-end-of-file-token)
    *   [11.4 End-of-line token](#114-end-of-line-token)
    *   [11.5 Marker token](#115-marker-token)
    *   [11.6 Sequence token](#116-sequence-token)
    *   [11.7 Content token](#117-content-token)
*   [12 Appendix](#12-appendix)
    *   [12.1 Raw tags](#121-raw-tags)
    *   [12.2 Basic tags](#122-basic-tags)
    *   [12.3 Named character references](#123-named-character-references)
*   [13 References](#13-references)
*   [14 Acknowledgments](#14-acknowledgments)
*   [15 License](#15-license)

## 1 Background

The common markup parser parses a markup language that is commonly known as
*Markdown*.

The first definition of this format gave several examples of how it worked,
showing input Markdown and output HTML, and came with a reference implementation
(known as Markdown.pl).
When new implementations followed, they mostly followed the first definition,
but deviated from the first implementation, thus making the format a family of
formats.

Some years later, an attempt was made to standardize the differences between
implementations, by specifying how several edge cases should be handled, through
more input and output examples.
This attempt is known as CommonMark, and many implementations now follow it.

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
*   **extensible**, because the format is often used in combination with new
    and custom constructs

The origin story of Markdown is similar to that of HTML, which at a time was
also a family of formats.
Through incredible efforts of the WHATWG, a Living Standard was created on how
to parse the format, by defining a state machine.

## 2 Overview

The common markup parser receives input, typically coming over the network or
from the local file system.
This input is represented as characters in the input stream.
Depending on a character, certain effects occur, such as that a new token is
created, one state is switched to another, or something is labelled.
Each line is made up of tokens, such as whitespace, markers, sequences, and
content, and labels, that are both enqueued.
At a certain point, it is known what to do with the queue, whether to discard it
or to use it, in which case it is adapted.

The parser parses in three stages: flow, content, and text, respectively coming
with their own state machines ([flow state machine][flow-state-machine], [content state machine][content-state-machine],
[text state machine][text-state-machine]), and their own adapters.

## 3 Infra

> *This section defines the fundamental concepts upon which this document is
> built.*

A variable is declared in the shared state with `let`, cleared with `unset`, or
changed with `set`, `increment`, `decrement`, `append` or `prepend`.

## 4 Characters

A character is a Unicode code point and is represented as a four to six digit
hexadecimal number, prefixed with `U+` (**\[UNICODE]**).

### 4.1 Character groups

An <a id="ascii-digit" href="#ascii-digit">**ASCII digit**</a> is a character in the inclusive range U+0030 (`0`) to U+0039 (`9`).

An <a id="ascii-upper-hex-digit" href="#ascii-upper-hex-digit">**ASCII upper hex digit**</a> a character in the inclusive range U+0041 (`A`) to U+0046 (`F`).

An <a id="ascii-lower-hex-digit" href="#ascii-lower-hex-digit">**ASCII lower hex digit**</a> a character in the inclusive range U+0061 (`a`) to U+0066 (`f`).

An <a id="ascii-hex-digit" href="#ascii-hex-digit">**ASCII hex digit**</a> is an [ASCII digit][ascii-digit], [ASCII upper hex digit][ascii-upper-hex-digit], or an
[ASCII lower hex digit][ascii-lower-hex-digit]

An <a id="ascii-upper-alpha" href="#ascii-upper-alpha">**ASCII upper alpha**</a> is a character in the inclusive range U+0041 (`A`) to U+005A (`Z`).

An <a id="ascii-lower-alpha" href="#ascii-lower-alpha">**ASCII lower alpha**</a> is a character in the inclusive range U+0061 (`a`) to U+007A (`z`).

An <a id="ascii-alpha" href="#ascii-alpha">**ASCII alpha**</a> is an [ASCII upper alpha][ascii-upper-alpha] or [ASCII lower alpha][ascii-lower-alpha].

An <a id="ascii-alphanumeric" href="#ascii-alphanumeric">**ASCII alphanumeric**</a> is an [ASCII digit][ascii-digit] or [ASCII alpha][ascii-alpha].

An <a id="ascii-punctuation" href="#ascii-punctuation">**ASCII punctuation**</a> is a character in the inclusive ranges U+0021 EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`)
to U+0040 AT SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).

An <a id="ascii-control" href="#ascii-control">**ASCII control**</a> is a character in the inclusive range U+0000 NULL (NUL) to U+001F (US), or
U+007F (DEL).

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

To <a id="ascii-lowercase" href="#ascii-lowercase">**ASCII-lowercase**</a> a character, is to increase it by `0x20`, if it an
[ASCII upper alpha][ascii-upper-alpha].

To <a id="digitize" href="#digitize">**digitize**</a> a character, is to decrease it by `0x30`, `0x37`, or `0x57`,
if it is an [ASCII digit][ascii-digit], [ASCII upper hex digit][ascii-upper-hex-digit], or
[ASCII lower hex digit][ascii-lower-hex-digit], respectively.

### 4.2 Conceptual characters

A <a id="cvs" href="#cvs">**VIRTUAL SPACE**</a> character is a conceptual character representing an expanded column
size of a U+0009 CHARACTER TABULATION (HT).

An <a id="ceol" href="#ceol">**EOL**</a> character is a conceptual character representing a break between
two lines.

An <a id="ceof" href="#ceof">**EOF**</a> character is a conceptual character representing the end of the
input.

VIRTUAL SPACE, EOL, and EOF are not real characters, but rather represent a character
increase the size of a character, a break between characters, or the lack of any
further characters.

### 4.3 Tabs

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

## 5 Input stream

The <a id="input-stream" href="#input-stream">**input stream**</a> consists of the characters pushed into it.

The <a id="input-character" href="#input-character">**input character**</a> is the first character in the [input stream][input-stream] that has
not yet been consumed.
Initially, the input character is the first character in the input.
When the last character in a line is consumed, the input character is an
[EOL][ceol].
Finally, when all character are consumed, the input character is an [EOF][ceof].

Any occurrences of U+0009 CHARACTER TABULATION (HT) in the [input stream][input-stream] is represented by that
character and 0-3 [VIRTUAL SPACE][cvs] characters.

### 5.1 Preprocessing the input stream

The [input stream][input-stream] consists of the characters pushed into it as the input is
decoded.

The input, when decoded, is preprocessed and pushed into the input stream as
described in the following algorithm:

*   Let `tabSize` be `4`
*   Let `line` be `1`
*   Let `column` be `1`
*   Let `offset` be `0`
*   *Check*:

    If `offset` is equal to the length of the document, push an EOF into the
    [input stream][input-stream] representing the lack of any further characters, and return

    Otherwise, if the current character is:

    *   ↪ **U+0000 NULL (NUL)**

        Increment `offset` by `1`, increment `column` by `1`, push a U+FFFD REPLACEMENT CHARACTER (`�`) into
        the [input stream][input-stream], and go to the step labelled *check*
    *   ↪ **U+0009 CHARACTER TABULATION (HT)**

        Set `count` to the result of calculating `(tabSize - 1) - (column %
        tabSize)`.
        Increment `offset` by `1`, increment `column` by `1`, and push the
        character into the [input stream][input-stream].

        Perform the following steps `count` times: increment `column` by `1` and
        push a VIRTUAL SPACE into the [input stream][input-stream] representing the size increase.

        Finally, go to the step labelled *check*
    *   ↪ **U+000A LINE FEED (LF)**

        Increment `offset` by `1`, increment `line` by `1`, and set `column` to
        `1`, push an EOL into the [input stream][input-stream] representing the character,
        and go to the step labelled *check*
    *   ↪ **U+000D CARRIAGE RETURN (CR)**

        Increment `offset` by `1`, increment `line` by `1`, set `column` to `1`,
        and go to the step labelled *carriage return check*
    *   ↪ **Anything else**

        Increment `offset` by `1`, increment `column` by `1`, push the character
        into the [input stream][input-stream], and go to the step labelled *check*
*   *Carriage return check*: if the current character is:

    *   ↪ **U+000A LINE FEED (LF)**

        Increment `offset` by `1` and push an EOL into the [input stream][input-stream]
        representing the previous and current characters
    *   ↪ **Anything else**

        Push an EOL into the [input stream][input-stream] representing the previous
        character and perform the step labelled *check* on the current character

## 6 Parsing

The states of state machines have certain effects, such as that they create
items in the [queue][queue] (tokens and labels).
The queue is used by tree adapters, in case a valid construct is found.
After using the queue, or when in a bogus construct is found, the queue is
discarded.

The [shared space][shared-space] is accessed and mutated by both the tree adapter and the
states of the state machine.

[Construct][construct]s are registered by hooking a case (one or more characters or
character groups) into certain states.
Upon registration, they define the states used to parse a construct, and the
adapter used to handle the construct.

### 6.1 Tokenization

Implementations must act as if they use several state machines to tokenize
common markup.
The [flow state machine][flow-state-machine] is used to tokenize the line constructs that make up
the structure of the document.
The [content state machine][content-state-machine] is used to tokenize the inline constructs part of
content blocks.
The [text state machine][text-state-machine] is used to tokenize the inline constructs part of
rich or plain text.

Most states [consume][consume] the [input character][input-character], and either remain in the state
to consume the next character, [reconsume][reconsume] the input character in a different
state, or [switch][switch] to a different state to consume the next character.
States [enqueue][enqueue] tokens and labels.

### 6.2 State

The <a id="shared-space" href="#shared-space">**shared space**</a> is a map of key/value pairs.

The <a id="queue" href="#queue">**queue**</a> is a list of tokens and labels that are enqueued.
The <a id="current-token" href="#current-token">**current token**</a> is the last token in the [queue][queue].

### 6.3 Constructs

Markup is parsed per <a id="construct" href="#construct">**construct**</a>.
Some constructs are considered regular (those from CommonMark, such as ATX
headings) and other constructs are extensions (such as YAML frontmatter or MDX).

> ❗️ Define constructs.

### 6.4 Effects

#### 6.4.1 Switch

To <a id="switch" href="#switch">**switch**</a> to a state is to wait for the next character in the given state.

#### 6.4.2 Consume

To <a id="consume" href="#consume">**consume**</a> the [input character][input-character] affects the [current token][current-token].
Due to the nature of the state machine, it is not possible to consume if there
is no current token.

#### 6.4.3 Reconsume

To <a id="reconsume" href="#reconsume">**reconsume**</a> is to [switch][switch] to the given state, and [consume][consume] the
[input character][input-character] there.

#### 6.4.4 Enqueue

To <a id="enqueue" href="#enqueue">**enqueue**</a> a label is to mark a point between two tokens with a semantic
name, at which point there is no [current token][current-token].

To enqueue a token is to add a new token of the given type to the [queue][queue],
making it the new [current token][current-token].

#### 6.4.5 Ensure

To ensure a token is to enqueue that token if the [current token][current-token] is not of
the given type, and otherwise do nothing.

## 7 Flow state machine

The <a id="flow-state-machine" href="#flow-state-machine">**flow state machine**</a> is used to tokenize the line constructs that make up
the structure of the document (such as headings or thematic breaks) and must
start in the [*Flow prefix start state*][s-flow-prefix-start].

### 7.1 Flow prefix start state

*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Flow start state*][s-flow-start]

### 7.2 Flow start state

> **Hookable**, there are no regular hooks

*   ↪ **Anything else**

    Reconsume in the [*Flow initial state*][s-flow-initial]

### 7.3 Flow prefix initial state

*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Flow initial state*][s-flow-initial]

### 7.4 Flow initial state

> ❗️ Todo: Indented code v.s. content
>
> **Hookable**, the regular hooks are:
>
> *   [x] **[EOL][ceol]**: [*Blank line state*][s-blank-line]
> *   [x] **U+0023 NUMBER SIGN (`#`)**: [*ATX heading start state*][s-atx-heading-start]
> *   [x] **U+002A ASTERISK (`*`)**: [*Thematic break asterisk start state*][s-thematic-break-asterisk-start]
> *   [ ] **U+002A ASTERISK (`*`)**: <!-- s:list-item-asterisk-start -->
> *   [ ] **U+002B PLUS SIGN (`+`)**: <!-- s:list-item-plus-start -->
> *   [x] **U+002D DASH (`-`)**: [*Setext heading underline dash start state*][s-setext-heading-underline-dash-start]
> *   [x] **U+002D DASH (`-`)**: [*Thematic break dash start state*][s-thematic-break-dash-start]
> *   [ ] **U+002D DASH (`-`)**: <!-- s:list-item-dash-start -->
> *   [x] **U+003C LESS THAN (`<`)**: [*Flow HTML start state*][s-flow-html-start]
> *   [x] **U+003D EQUALS TO (`=`)**: [*Setext heading underline equals to start state*][s-setext-heading-underline-equals-to-start]
> *   [ ] **U+003E GREATER THAN (`>`)**: <!-- s:blockquote-start -->
> *   [x] **U+005F UNDERSCORE (`_`)**: [*Thematic break underscore start state*][s-thematic-break-underscore-start]
> *   [x] **U+0060 GRAVE ACCENT (`` ` ``)**: [*Fenced code grave accent start state*][s-fenced-code-grave-accent-start]
> *   [x] **U+007E TILDE (`~`)**: [*Fenced code tilde start state*][s-fenced-code-tilde-start]
> *   [ ] **[ASCII digit][ascii-digit]**: <!-- s:list-item-digit-start -->
>
> ❗️ Todo, continuation:
>
> *   [ ] [*Flow HTML continuation state*][s-flow-html-continuation]
> *   [ ] [*Fenced code grave accent continuation state*][s-fenced-code-grave-accent-continuation]
> *   [ ] [*Fenced code tilde continuation state*][s-fenced-code-tilde-continuation]

*   ↪ **[EOF][ceof]**

    Enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **Anything else**

    Reconsume in the [*Flow content state*][s-flow-content]

### 7.5 Blank line state

*   ↪ **[EOL][ceol]**

    Enqueue a [*Blank line end label*][l-blank-line-end], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.6 ATX heading start state

*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Let `sizeFence` be `1`, enqueue an [*ATX heading start label*][l-atx-heading-start], enqueue an
    [*ATX heading fence start label*][l-atx-heading-fence-start], enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*ATX heading fence open inside state*][s-atx-heading-fence-open-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.7 ATX heading fence open inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Unset `sizeFence`, enqueue an [*ATX heading fence end label*][l-atx-heading-fence-end] and reconsume in the
    [*ATX heading inside state*][s-atx-heading-inside]
*   ↪ **U+0023 NUMBER SIGN (`#`)**

    If `sizeFence` is not `6`, increment `sizeScheme` by `1` and consume

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeFence` and enqueue a [*NOK label*][l-nok]

### 7.8 ATX heading inside state

*   ↪ **[EOF][ceof]**

    Enqueue an [*ATX heading end label*][l-atx-heading-end] and enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue an [*ATX heading end label*][l-atx-heading-end], enqueue an [*End-of-line token*][t-end-of-line], consume, and switch
    to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Ensure a [*Sequence token*][t-sequence] and consume
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 7.9 Thematic break asterisk start state

*   ↪ **U+002A ASTERISK (`*`)**

    Let `sizeTotalSequence` be `1`, enqueue a [*Thematic break start label*][l-thematic-break-start], enqueue a
    [*Sequence token*][t-sequence], consume, and switch to the [*Thematic break asterisk inside state*][s-thematic-break-asterisk-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.10 Thematic break asterisk inside state

*   ↪ **[EOF][ceof]**

    If `sizeTotalSequence` is greater than or equal to `3`, unset
    `sizeTotalSequence`, enqueue a [*Thematic break end label*][l-thematic-break-end], and enqueue an
    [*End-of-file token*][t-end-of-file]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[EOL][ceol]**

    If `sizeTotalSequence` is greater than or equal to `3`, unset
    `sizeTotalSequence`, enqueue a [*Thematic break end label*][l-thematic-break-end], enqueue an
    [*End-of-line token*][t-end-of-line], consume, and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+002A ASTERISK (`*`)**

    Increment `sizeTotalSequence` by `1`, ensure a [*Sequence token*][t-sequence], and consume
*   ↪ **Anything else**

    Unset `sizeTotalSequence` and enqueue a [*NOK label*][l-nok]

### 7.11 Setext heading underline dash start state

> ❗️ Todo: exit if not preceded by content

*   ↪ **U+002D DASH (`-`)**

    Enqueue a [*Setext heading underline start label*][l-setext-heading-underline-start], enqueue a [*Sequence token*][t-sequence], consume,
    and switch to the [*Setext heading underline dash inside state*][s-setext-heading-underline-dash-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.12 Setext heading underline dash inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*Setext heading underline dash after state*][s-setext-heading-underline-dash-after]
*   ↪ **U+002D DASH (`-`)**

    Consume
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.13 Setext heading underline dash after state

> ❗️ Todo: Close content if ok, create a new content if nok

*   ↪ **[EOF][ceof]**

    Enqueue a [*Setext heading underline end label*][l-setext-heading-underline-end] and enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Setext heading underline end label*][l-setext-heading-underline-end], enqueue an [*End-of-line token*][t-end-of-line], consume,
    and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.14 Thematic break dash start state

*   ↪ **U+002D DASH (`-`)**

    Let `sizeTotalSequence` be `1`, enqueue a [*Thematic break start label*][l-thematic-break-start], enqueue a
    [*Sequence token*][t-sequence], consume, and switch to the [*Thematic break dash inside state*][s-thematic-break-dash-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.15 Thematic break dash inside state

*   ↪ **[EOF][ceof]**

    If `sizeTotalSequence` is greater than or equal to `3`, unset
    `sizeTotalSequence`, enqueue a [*Thematic break end label*][l-thematic-break-end], and enqueue an
    [*End-of-file token*][t-end-of-file]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[EOL][ceol]**

    If `sizeTotalSequence` is greater than or equal to `3`, unset
    `sizeTotalSequence`, enqueue a [*Thematic break end label*][l-thematic-break-end], enqueue an
    [*End-of-line token*][t-end-of-line], consume, and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+002D DASH (`-`)**

    Increment `sizeTotalSequence` by `1`, ensure a [*Sequence token*][t-sequence], and consume
*   ↪ **Anything else**

    Unset `sizeTotalSequence` and enqueue a [*NOK label*][l-nok]

### 7.16 Flow HTML start state

*   ↪ **U+003C LESS THAN (`<`)**

    Let `kind` be `0`, let `endTag` be `null`, let `tagName` be the empty
    string, enqueue a [*Content token*][t-content], consume, and switch to the [*Flow HTML tag open state*][s-flow-html-tag-open]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.17 Flow HTML tag open state

*   ↪ **U+0021 EXCLAMATION MARK (`!`)**

    Consume and switch to the [*Flow HTML markup declaration open state*][s-flow-html-markup-declaration-open]
*   ↪ **U+002F SLASH (`/`)**

    Set `endTag` to `true`, consume, and switch to the [*Flow HTML end tag open state*][s-flow-html-end-tag-open]
*   ↪ **U+003F QUESTION MARK (`?`)**

    Set `kind` to `3`, unset `endTag`, consume, and switch to the
    [*Flow HTML continuation declaration before state*][s-flow-html-continuation-declaration-before]
*   ↪ **[ASCII alpha][ascii-alpha]**

    Append the [ASCII-lowercase][ascii-lowercase]d character to `tagName`, consume, and switch
    to the [*Flow HTML tag name state*][s-flow-html-tag-name]
*   ↪ **Anything else**

    Unset `kind`, `endTag`, and `tagName`, and enqueue a [*NOK label*][l-nok]

### 7.18 Flow HTML markup declaration open state

*   ↪ **`--`** (two U+002D DASH (`-`) characters)\*\*

    Set `kind` to `2`, unset `endTag`, consume, and switch to the
    [*Flow HTML continuation declaration before state*][s-flow-html-continuation-declaration-before]
*   ↪ **[ASCII alpha][ascii-alpha]**

    Set `kind` to `4`, unset `endTag`, consume, and switch to the
    [*Flow HTML continuation state*][s-flow-html-continuation]
*   ↪ **`[CDATA[` (the five upper letters “CDATA” with a U+005B LEFT SQUARE BRACKET (`[`) before and
    after)**

    Set `kind` to `5`, unset `endTag`, consume, and switch to the
    [*Flow HTML continuation state*][s-flow-html-continuation]
*   ↪ **Anything else**

    Unset `kind`, `endTag`, and `tagName`, and enqueue a [*NOK label*][l-nok]

### 7.19 Flow HTML end tag open state

*   ↪ **[ASCII alpha][ascii-alpha]**

    Append the [ASCII-lowercase][ascii-lowercase]d character to `tagName`, consume, and switch
    to the [*Flow HTML tag name state*][s-flow-html-tag-name]
*   ↪ **Anything else**

    Unset `kind`, `endTag`, and `tagName`, and enqueue a [*NOK label*][l-nok]

### 7.20 Flow HTML tag name state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**

    If `tagName` is a [raw tag][raw-tag] and `endTag` is not `true`, set `kind` to `1`,
    unset `tagName`, unset `endTag`, and reconsume in the
    [*Flow HTML continuation state*][s-flow-html-continuation]

    Otherwise, if `tagName` is a [basic tag][basic-tag], set `kind` to `6`, unset
    `tagName`, unset `endTag`, and reconsume in the [*Flow HTML continuation state*][s-flow-html-continuation]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    If `tagName` is a [raw tag][raw-tag] and `endTag` is not `true`, set `kind` to `1`,
    unset `tagName`, unset `endTag`, and switch to the [*Flow HTML continuation state*][s-flow-html-continuation]

    > ❗️ Todo: ignore this check if interrupting content.

    Otherwise, if `tagName` is not a [raw tag][raw-tag], unset `tagName`, consume, and
    switch to the [*Flow HTML complete attribute name before state*][s-flow-html-complete-attribute-name-before]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+002D DASH (`-`)**\
    ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    Append the [ASCII-lowercase][ascii-lowercase]d character to `tagName` and consume
*   ↪ **U+002F SLASH (`/`)**

    If `tagName` is a [basic tag][basic-tag], unset `tagName`, consume, and switch to the
    [*Flow HTML basic self closing state*][s-flow-html-basic-self-closing]

    > ❗️ Todo: ignore this check if interrupting content.

    Otherwise, if `tagName` is not a [raw tag][raw-tag] and `endTag` is not `true`,
    unset `tagName`, consume, and switch to the
    [*Flow HTML complete self closing state*][s-flow-html-complete-self-closing]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    If `tagName` is a [raw tag][raw-tag] and `endTag` is not `true`, set `kind` to `1`,
    unset `tagName`, unset `endTag`, consume, and switch to the
    [*Flow HTML continuation state*][s-flow-html-continuation]

    Otherwise, if `tagName` is a [basic tag][basic-tag], set `kind` to `6`, unset
    `tagName`, unset `endTag`, and reconsume in the [*Flow HTML continuation state*][s-flow-html-continuation]

    > ❗️ Todo: ignore this check if interrupting content.

    Otherwise, if `tagName` is not a [raw tag][raw-tag], unset `tagName`, consume, and
    switch to the [*Flow HTML complete tag after state*][s-flow-html-complete-tag-after]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `kind`, `endTag`, and `tagName`, and enqueue a [*NOK label*][l-nok]

### 7.21 Flow HTML basic self closing state

*   ↪ **U+003E GREATER THAN (`>`)**

    Set `kind` to `6`, unset `endTag`, consume, and switch to the
    [*Flow HTML continuation state*][s-flow-html-continuation]
*   ↪ **Anything else**

    Unset `kind` and `endTag` and enqueue a [*NOK label*][l-nok]

### 7.22 Flow HTML complete attribute name before state

*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    If `endTag` is not `true`, consume and switch to the
    [*Flow HTML complete self closing state*][s-flow-html-complete-self-closing]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003A COLON (`:`)**\
    ↪ **U+005F UNDERSCORE (`_`)**\
    ↪ **[ASCII alpha][ascii-alpha]**

    If `endTag` is not `true`, consume and switch to the
    [*Flow HTML complete attribute name state*][s-flow-html-complete-attribute-name]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*Flow HTML complete tag after state*][s-flow-html-complete-tag-after]
*   ↪ **Anything else**

    Unset `kind` and `endTag` and enqueue a [*NOK label*][l-nok]

### 7.23 Flow HTML complete attribute name state

*   ↪ **U+002D DASH (`-`)**\
    ↪ **U+002E DOT (`.`)**\
    ↪ **U+003A COLON (`:`)**\
    ↪ **U+005F UNDERSCORE (`_`)**\
    ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    Consume
*   ↪ **Anything else**

    Reconsume in the [*Flow HTML complete attribute name after state*][s-flow-html-complete-attribute-name-after]

### 7.24 Flow HTML complete attribute name after state

*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    If `endTag` is not `true`, consume and switch to the
    [*Flow HTML complete self closing state*][s-flow-html-complete-self-closing]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003D EQUALS TO (`=`)**

    Consume and switch to the [*Flow HTML complete attribute value before state*][s-flow-html-complete-attribute-value-before]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*Flow HTML complete tag after state*][s-flow-html-complete-tag-after]
*   ↪ **Anything else**

    Unset `kind` and `endTag` and enqueue a [*NOK label*][l-nok]

### 7.25 Flow HTML complete attribute value before state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**
    ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003D EQUALS TO (`=`)**\
    ↪ **U+003E GREATER THAN (`>`)**\
    ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Unset `kind` and `endTag` and enqueue a [*NOK label*][l-nok]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Consume and switch to the [*Flow HTML complete attribute value double quoted state*][s-flow-html-complete-attribute-value-double-quoted]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Consume and switch to the [*Flow HTML complete attribute value single quoted state*][s-flow-html-complete-attribute-value-single-quoted]
*   ↪ **Anything else**

    Consume and switch to the [*Flow HTML complete attribute value unquoted state*][s-flow-html-complete-attribute-value-unquoted]

### 7.26 Flow HTML complete attribute value double quoted state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**

    Unset `kind` and `endTag` and enqueue a [*NOK label*][l-nok]
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Consume and switch to the [*Flow HTML complete attribute name before state*][s-flow-html-complete-attribute-name-before]
*   ↪ **Anything else**

    Consume

### 7.27 Flow HTML complete attribute value single quoted state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**

    Unset `kind` and `endTag` and enqueue a [*NOK label*][l-nok]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Consume and switch to the [*Flow HTML complete attribute name before state*][s-flow-html-complete-attribute-name-before]
*   ↪ **Anything else**

    Consume

### 7.28 Flow HTML complete attribute value unquoted state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **U+0022 QUOTATION MARK (`"`)**\
    ↪ **U+0027 APOSTROPHE (`'`)**\
    ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003D EQUALS TO (`=`)**\
    ↪ **U+003E GREATER THAN (`>`)**\
    ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Reconsume in the [*Flow HTML complete attribute name after state*][s-flow-html-complete-attribute-name-after]
*   ↪ **Anything else**

    Consume

### 7.29 Flow HTML complete self closing state

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*Flow HTML complete tag after state*][s-flow-html-complete-tag-after]
*   ↪ **Anything else**

    Unset `kind` and `endTag` and enqueue a [*NOK label*][l-nok]

### 7.30 Flow HTML complete tag after state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Set `kind` to `7`, unset `endTag`, and reconsume in the
    [*Flow HTML continuation state*][s-flow-html-continuation]
*   ↪ **Anything else**

    Unset `kind` and `endTag` and enqueue a [*NOK label*][l-nok]

### 7.31 Flow HTML continuation state

*   ↪ **[EOF][ceof]**

    Unset `kind`, enqueue an [*HTML end label*][l-html-end], and enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **U+002D DASH (`-`)**

    If `kind` is `7`, consume and switch to the
    [*Flow HTML continuation comment inside state*][s-flow-html-continuation-comment-inside]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003C LESS THAN (`<`)**

    If `kind` is `1`, consume and switch to the
    [*Flow HTML continuation raw tag open state*][s-flow-html-continuation-raw-tag-open]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    If `kind` is `4`, consume and switch to the [*Flow HTML continuation close state*][s-flow-html-continuation-close]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003F QUESTION MARK (`?`)**

    If `kind` is `3`, consume and switch to the
    [*Flow HTML continuation declaration before state*][s-flow-html-continuation-declaration-before]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    If `kind` is `5`, consume and switch to the
    [*Flow HTML continuation character data inside state*][s-flow-html-continuation-character-data-inside].

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Consume

### 7.32 Flow HTML continuation comment inside state

*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*Flow HTML continuation declaration before state*][s-flow-html-continuation-declaration-before]
*   ↪ **Anything else**

    Reconsume in the [*Flow HTML continuation state*][s-flow-html-continuation]

### 7.33 Flow HTML continuation raw tag open state

*   ↪ **U+002F SLASH (`/`)**

    Let `tagName` be the empty string, consume, and switch to the
    [*Flow HTML continuation raw end tag state*][s-flow-html-continuation-raw-end-tag]
*   ↪ **Anything else**

    Reconsume in the [*Flow HTML continuation state*][s-flow-html-continuation]

### 7.34 Flow HTML continuation raw end tag state

> **Note**: This state can be optimized by either imposing a maximum size (the
> size of the longest possible raw tag name) or by using a trie of the possible
> raw tag names.

*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    Append the [ASCII-lowercase][ascii-lowercase]d character to `tagName` and consume
*   ↪ **U+003E GREATER THAN (`>`)**

    If `tagName` is a [raw tag][raw-tag], unset \`tagName, consume, and switch to the
    [*Flow HTML continuation close state*][s-flow-html-continuation-close]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset \`tagName and reconsume in the [*Flow HTML continuation state*][s-flow-html-continuation]

### 7.35 Flow HTML continuation character data inside state

*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Consume and switch to the [*Flow HTML continuation declaration before state*][s-flow-html-continuation-declaration-before]
*   ↪ **Anything else**

    Reconsume in the [*Flow HTML continuation state*][s-flow-html-continuation]

### 7.36 Flow HTML continuation declaration before state

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume and switch to the [*Flow HTML continuation close state*][s-flow-html-continuation-close]
*   ↪ **Anything else**

    Reconsume in the [*Flow HTML continuation state*][s-flow-html-continuation]

### 7.37 Flow HTML continuation close state

*   ↪ **[EOF][ceof]**

    Unset `kind`, enqueue an [*HTML end label*][l-html-end], and enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Unset `kind`, enqueue an [*HTML end label*][l-html-end], and enqueue an [*End-of-line token*][t-end-of-line], consume,
    and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **Anything else**

    Consume

### 7.38 Setext heading underline equals to start state

> ❗️ Todo: exit if not preceded by content

*   ↪ **U+003D EQUALS TO (`=`)**

    Enqueue a [*Setext heading underline start label*][l-setext-heading-underline-start], enqueue a [*Sequence token*][t-sequence], consume,
    and switch to the [*Setext heading underline equals to inside state*][s-setext-heading-underline-equals-to-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.39 Setext heading underline equals to inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*Setext heading underline equals to after state*][s-setext-heading-underline-equals-to-after]
*   ↪ **U+003D EQUALS TO (`=`)**

    Consume
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.40 Setext heading underline equals to after state

> ❗️ Todo: Close content if ok, create a new content if nok

*   ↪ **[EOF][ceof]**

    Enqueue a [*Setext heading underline end label*][l-setext-heading-underline-end] and enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Setext heading underline end label*][l-setext-heading-underline-end], enqueue an [*End-of-line token*][t-end-of-line], consume,
    and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.41 Thematic break underscore start state

*   ↪ **U+005F UNDERSCORE (`_`)**

    Let `sizeTotalSequence` be `1`, enqueue a [*Thematic break start label*][l-thematic-break-start], enqueue a
    [*Sequence token*][t-sequence], consume, and switch to the [*Thematic break underscore inside state*][s-thematic-break-underscore-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.42 Thematic break underscore inside state

*   ↪ **[EOF][ceof]**

    If `sizeTotalSequence` is greater than or equal to `3`, unset
    `sizeTotalSequence`, enqueue a [*Thematic break end label*][l-thematic-break-end], and enqueue an
    [*End-of-file token*][t-end-of-file]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[EOL][ceol]**

    If `sizeTotalSequence` is greater than or equal to `3`, unset
    `sizeTotalSequence`, enqueue a [*Thematic break end label*][l-thematic-break-end], enqueue an
    [*End-of-line token*][t-end-of-line], consume, and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+005F UNDERSCORE (`_`)**

    Increment `sizeTotalSequence` by `1`, ensure a [*Sequence token*][t-sequence], and consume
*   ↪ **Anything else**

    Unset `sizeTotalSequence` and enqueue a [*NOK label*][l-nok]

### 7.43 Fenced code grave accent start state

*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Let `sizeOpen` be `1`, enqueue a [*Fenced code start label*][l-fenced-code-start], enqueue a
    [*Fenced code fence start label*][l-fenced-code-fence-start], enqueue a [*Fenced code fence sequence start label*][l-fenced-code-fence-sequence-start],
    enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code grave accent open fence inside state*][s-fenced-code-grave-accent-open-fence-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.44 Fenced code grave accent open fence inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    If `sizeOpen` is greater than or equal to `3`, enqueue a
    [*Fenced code fence sequence end label*][l-fenced-code-fence-sequence-end], and reconsume in the
    [*Fenced code grave accent open fence after state*][s-fenced-code-grave-accent-open-fence-after]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Increment `sizeOpen` by `1` and consume
*   ↪ **Anything else**

    Unset `sizeOpen` and enqueue a [*NOK label*][l-nok]

### 7.45 Fenced code grave accent open fence after state

*   ↪ **[EOF][ceof]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end] and enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end], enqueue an [*End-of-line token*][t-end-of-line], consume, and
    switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Unset `sizeOpen` and enqueue a [*NOK label*][l-nok]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 7.46 Fenced code grave accent continuation state

*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Let `sizeClose` be `1`, enqueue a [*Fenced code fence sequence start label*][l-fenced-code-fence-sequence-start],
    enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code grave accent close fence inside state*][s-fenced-code-grave-accent-close-fence-inside]
*   ↪ **Anything else**

    Reconsume in the [*Fenced code grave accent continuation inside state*][s-fenced-code-grave-accent-continuation-inside]

### 7.47 Fenced code grave accent close fence inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    If `sizeClose` is greater than or equal to `sizeOpen`, enqueue a
    [*Fenced code fence sequence end label*][l-fenced-code-fence-sequence-end], and reconsume in the
    [*Fenced code grave accent close fence after state*][s-fenced-code-grave-accent-close-fence-after]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Increment `sizeClose` by `1` and consume
*   ↪ **Anything else**

    Unset `sizeClose` and reconsume in the
    [*Fenced code grave accent continuation inside state*][s-fenced-code-grave-accent-continuation-inside]

### 7.48 Fenced code grave accent close fence after state

*   ↪ **[EOF][ceof]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end], enqueue a [*Fenced code end label*][l-fenced-code-end], and enqueue
    an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end], enqueue a [*Fenced code end label*][l-fenced-code-end], enqueue an
    [*End-of-line token*][t-end-of-line], consume, and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Fenced code grave accent continuation inside state*][s-fenced-code-grave-accent-continuation-inside]

### 7.49 Fenced code grave accent continuation inside state

*   ↪ **[EOF][ceof]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end], enqueue a [*Fenced code end label*][l-fenced-code-end], and enqueue
    an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 7.50 Fenced code tilde start state

*   ↪ **U+007E TILDE (`~`)**

    Let `sizeOpen` be `1`, enqueue a [*Fenced code start label*][l-fenced-code-start], enqueue a
    [*Fenced code fence start label*][l-fenced-code-fence-start], enqueue a [*Fenced code fence sequence start label*][l-fenced-code-fence-sequence-start],
    enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code tilde open fence inside state*][s-fenced-code-tilde-open-fence-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 7.51 Fenced code tilde open fence inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    If `sizeOpen` is greater than or equal to `3`, enqueue a
    [*Fenced code fence sequence end label*][l-fenced-code-fence-sequence-end], and reconsume in the
    [*Fenced code tilde open fence after state*][s-fenced-code-tilde-open-fence-after]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+007E TILDE (`~`)**

    Increment `sizeOpen` by `1` and consume
*   ↪ **Anything else**

    Unset `sizeOpen` and enqueue a [*NOK label*][l-nok]

### 7.52 Fenced code tilde open fence after state

*   ↪ **[EOF][ceof]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end] and enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end], enqueue an [*End-of-line token*][t-end-of-line], consume, and
    switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 7.53 Fenced code tilde continuation state

*   ↪ **U+007E TILDE (`~`)**

    Let `sizeClose` be `1`, enqueue a [*Fenced code fence sequence start label*][l-fenced-code-fence-sequence-start],
    enqueue a [*Sequence token*][t-sequence], consume, and switch to the
    [*Fenced code tilde close fence inside state*][s-fenced-code-tilde-close-fence-inside]
*   ↪ **Anything else**

    Reconsume in the [*Fenced code tilde continuation inside state*][s-fenced-code-tilde-continuation-inside]

### 7.54 Fenced code tilde close fence inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    If `sizeClose` is greater than or equal to `sizeOpen`, enqueue a
    [*Fenced code fence sequence end label*][l-fenced-code-fence-sequence-end], and reconsume in the
    [*Fenced code tilde close fence after state*][s-fenced-code-tilde-close-fence-after]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+007E TILDE (`~`)**

    Increment `sizeClose` by `1` and consume
*   ↪ **Anything else**

    Unset `sizeClose` and reconsume in the
    [*Fenced code tilde continuation inside state*][s-fenced-code-tilde-continuation-inside]

### 7.55 Fenced code tilde close fence after state

*   ↪ **[EOF][ceof]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end], enqueue a [*Fenced code end label*][l-fenced-code-end], and enqueue
    an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end], enqueue a [*Fenced code end label*][l-fenced-code-end], enqueue an
    [*End-of-line token*][t-end-of-line], consume, and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Fenced code tilde continuation inside state*][s-fenced-code-tilde-continuation-inside]

### 7.56 Fenced code tilde continuation inside state

*   ↪ **[EOF][ceof]**

    Enqueue a [*Fenced code fence end label*][l-fenced-code-fence-end], enqueue a [*Fenced code end label*][l-fenced-code-end], and enqueue
    an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 7.57 Flow content state

*   ↪ **[EOF][ceof]**

    Enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the [*Flow prefix initial state*][s-flow-prefix-initial]
*   ↪ **Anything else**

    Consume

## 8 Content state machine

The <a id="content-state-machine" href="#content-state-machine">**content state machine**</a> is used to tokenize the inline constructs part of
content blocks in a document (such as regular definitions and phrasing) and must
start in the [*Content start state*][s-content-start].

### 8.1 Content start state

> **Hookable**, the regular hooks are:
>
> *   **U+005B LEFT SQUARE BRACKET (`[`)**: [*Definition label start state*][s-definition-label-start]

*   ↪ **Anything else**

    Reconsume in the [*Content initial state*][s-content-initial]

### 8.2 Content initial state

> **Hookable**, there are no regular hooks.

*   ↪ **Anything else**

    Reconsume in the [*Phrasing content state*][s-phrasing-content]

### 8.3 Definition label start state

*   ↪ **U+005B LEFT SQUARE BRACKET (`[`)**

    Enqueue a [*Content definition start label*][l-content-definition-start], enqueue a
    [*Content definition label start label*][l-content-definition-label-start], enqueue a [*Marker token*][t-marker], consume, enqueue a
    [*Content definition label open label*][l-content-definition-label-open], and switch to the [*Definition label before state*][s-definition-label-before]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 8.4 Definition label before state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*Definition label inside state*][s-definition-label-inside]

### 8.5 Definition label inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*Definition label between state*][s-definition-label-between]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the [*Definition label escape state*][s-definition-label-escape]
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Enqueue a [*Content definition label close label*][l-content-definition-label-close], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Content definition label end label*][l-content-definition-label-end], and switch to the
    [*Definition label after state*][s-definition-label-after]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 8.6 Definition label between state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Definition label inside state*][s-definition-label-inside]

### 8.7 Definition label escape state

*   ↪ **U+005C BACKSLASH (`\`)**\
    ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Consume and switch to the [*Definition label inside state*][s-definition-label-inside]
*   ↪ **Anything else**

    Reconsume in the [*Definition label inside state*][s-definition-label-inside]

### 8.8 Definition label after state

*   ↪ **U+003A COLON (`:`)**

    Enqueue a [*Marker token*][t-marker], consume, and switch to the
    [*Definition destination before state*][s-definition-destination-before]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 8.9 Definition destination before state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+003C LESS THAN (`<`)**

    Enqueue a [*Content definition destination start label*][l-content-definition-destination-start], enqueue a [*Marker token*][t-marker],
    enqueue a [*Content definition destination quoted open label*][l-content-definition-destination-quoted-open], consume, and switch
    to the [*Definition destination quoted inside state*][s-definition-destination-quoted-inside]
*   ↪ **[ASCII control][ascii-control]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **Anything else**

    Let `balance` be `0`, enqueue a [*Content definition destination start label*][l-content-definition-destination-start],
    enqueue a [*Content definition destination unquoted open label*][l-content-definition-destination-unquoted-open], enqueue a
    [*Content token*][t-content], and reconsume in the [*Definition destination unquoted inside state*][s-definition-destination-unquoted-inside]

### 8.10 Definition destination quoted inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **U+003C LESS THAN (`<`)**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **U+003E GREATER THAN (`>`)**

    Enqueue a [*Content definition destination quoted close label*][l-content-definition-destination-quoted-close], enqueue a [*Marker token*][t-marker],
    consume, enqueue a [*Content definition destination end label*][l-content-definition-destination-end], and switch to the
    [*Definition destination after state*][s-definition-destination-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the
    [*Definition destination quoted escape state*][s-definition-destination-quoted-escape]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 8.11 Definition destination quoted escape state

*   ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003E GREATER THAN (`>`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition destination quoted inside state*][s-definition-destination-quoted-inside]
*   ↪ **Anything else**

    Reconsume in the [*Definition destination quoted inside state*][s-definition-destination-quoted-inside]

### 8.12 Definition destination unquoted inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Unset `balance`, enqueue a [*Content definition destination unquoted close label*][l-content-definition-destination-unquoted-close],
    enqueue a [*Content definition destination end label*][l-content-definition-destination-end], and reconsume in the
    [*Definition title before state*][s-definition-title-before]
*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**

    Increment `balance` by `1`, ensure a [*Content token*][t-content], and consume
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    If `balance` is `0`, treat it as per the “ASCII control” entry below

    Otherwise, decrement `balance` by `1`, ensure a [*Content token*][t-content], and consume
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the
    [*Definition destination unquoted escape state*][s-definition-destination-unquoted-escape]
*   ↪ **[ASCII control][ascii-control]**

    Unset `balance` and enqueue a [*NOK label*][l-nok]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 8.13 Definition destination unquoted escape state

*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**\
    ↪ **U+0029 RIGHT PARENTHESIS (`)`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition destination unquoted inside state*][s-definition-destination-unquoted-inside]
*   ↪ **Anything else**

    Reconsume in the [*Definition destination unquoted inside state*][s-definition-destination-unquoted-inside]

### 8.14 Definition destination after state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*Definition title before state*][s-definition-title-before]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 8.15 Definition title before state

*   ↪ **[EOL][ceol]**

    Enqueue a [*Content definition partial label*][l-content-definition-partial], enqueue an [*End-of-line token*][t-end-of-line], consume,
    and switch to the [*Definition title or label before state*][s-definition-title-or-label-before]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+005B LEFT SQUARE BRACKET (`[`)**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **Anything else**

    Reconsume in the [*Definition title or label before state*][s-definition-title-or-label-before]

### 8.16 Definition title or label before state

*   ↪ **[EOF][ceof]**

    Enqueue a [*Content definition end label*][l-content-definition-end] and enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Enqueue a [*Content definition title start label*][l-content-definition-title-start], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Content definition title open label*][l-content-definition-title-open], and switch to the
    [*Definition title double quoted state*][s-definition-title-double-quoted]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Enqueue a [*Content definition title start label*][l-content-definition-title-start], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Content definition title open label*][l-content-definition-title-open], and switch to the
    [*Definition title single quoted state*][s-definition-title-single-quoted]
*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**

    Enqueue a [*Content definition title start label*][l-content-definition-title-start], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Content definition title open label*][l-content-definition-title-open], and switch to the
    [*Definition title paren quoted state*][s-definition-title-paren-quoted]
*   ↪ **Anything else**

    Reconsume in the [*Content start state*][s-content-start]

### 8.17 Definition title double quoted state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*Definition title double quoted between state*][s-definition-title-double-quoted-between]
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Enqueue a [*Content definition title close label*][l-content-definition-title-close], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Content definition title end label*][l-content-definition-title-end], and switch to the
    [*Definition title after state*][s-definition-title-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the
    [*Definition title double quoted escape state*][s-definition-title-double-quoted-escape]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 8.18 Definition title double quoted between state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Definition title double quoted state*][s-definition-title-double-quoted]

### 8.19 Definition title double quoted escape state

*   ↪ **U+0022 QUOTATION MARK (`"`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition title double quoted state*][s-definition-title-double-quoted]
*   ↪ **Anything else**

    Reconsume in the [*Definition title double quoted state*][s-definition-title-double-quoted]

### 8.20 Definition title single quoted state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*Definition title single quoted between state*][s-definition-title-single-quoted-between]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Enqueue a [*Content definition title close label*][l-content-definition-title-close], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Content definition title end label*][l-content-definition-title-end], and switch to the
    [*Definition title after state*][s-definition-title-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the
    [*Definition title single quoted escape state*][s-definition-title-single-quoted-escape]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 8.21 Definition title single quoted between state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Definition title single quoted state*][s-definition-title-single-quoted]

### 8.22 Definition title single quoted escape state

*   ↪ **U+0027 APOSTROPHE (`'`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition title single quoted state*][s-definition-title-single-quoted]
*   ↪ **Anything else**

    Reconsume in the [*Definition title single quoted state*][s-definition-title-single-quoted]

### 8.23 Definition title paren quoted state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*Definition title paren quoted between state*][s-definition-title-paren-quoted-between]
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    Enqueue a [*Content definition title close label*][l-content-definition-title-close], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Content definition title end label*][l-content-definition-title-end], and switch to the
    [*Definition title after state*][s-definition-title-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the
    [*Definition title paren quoted escape state*][s-definition-title-paren-quoted-escape]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 8.24 Definition title paren quoted between state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line] and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Definition title paren quoted state*][s-definition-title-paren-quoted]

### 8.25 Definition title paren quoted escape state

*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Definition title paren quoted state*][s-definition-title-paren-quoted]
*   ↪ **Anything else**

    Reconsume in the [*Definition title paren quoted state*][s-definition-title-paren-quoted]

### 8.26 Definition title after state

*   ↪ **[EOF][ceof]**

    Enqueue a [*Content definition end label*][l-content-definition-end] and enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Content definition end label*][l-content-definition-end], enqueue an [*End-of-line token*][t-end-of-line], consume, and
    switch to the [*Content start state*][s-content-start]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 8.27 Phrasing content state

*   ↪ **[EOF][ceof]**

    Enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **[EOL][ceol]**

    Enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the [*Content initial state*][s-content-initial]
*   ↪ **Anything else**

    Consume

## 9 Text state machine

The <a id="text-state-machine" href="#text-state-machine">**text state machine**</a> is used to tokenize the inline constructs part of
rich text (such as regular resources and emphasis) or plain text (such as
regular character escapes or character references) in a document and must start
in the [*Text start state*][s-text-start].

If text is parsed as plain text, the [*Text start state*][s-text-start], [*Text initial state*][s-text-initial], and [*Text state*][s-text]
all forward to the [*Plain text state*][s-plain-text].

If text is parsed as rich text, an additional variable `prev` must be tracked.
Initial set to [EOF][ceof], it must be set to the [input character][input-character] right before
a character is consumed.

### 9.1 Text start state

> **Hookable**, there are no regular hooks.

*   ↪ **Anything else**

    Reconsume in the [*Text initial state*][s-text-initial]

### 9.2 Text initial state

> **Hookable**, there are no regular hooks.

*   ↪ **Anything else**

    Reconsume in the [*Text state*][s-text]

### 9.3 Text state

> **Hookable**, the regular hooks are:
>
> *   **[EOL][ceol]**: [*End-of-line state*][s-end-of-line]
> *   **U+0021 EXCLAMATION MARK (`!`)**: [*Image label start state*][s-image-label-start]
> *   **U+0026 AMPERSAND (`&`)**: [*Character reference state*][s-character-reference]
> *   **U+002A ASTERISK (`*`)**: [*Delimiter run asterisk start state*][s-delimiter-run-asterisk-start]
> *   **U+003C LESS THAN (`<`)**: [*Autolink state*][s-autolink]
> *   **U+003C LESS THAN (`<`)**: [*HTML state*][s-html]
> *   **U+005B LEFT SQUARE BRACKET (`[`)**: [*Link label start state*][s-link-label-start]
> *   **U+005C BACKSLASH (`\`)**: [*Character escape state*][s-character-escape]
> *   **U+005C BACKSLASH (`\`)**: [*Break escape state*][s-break-escape]
> *   **U+005D RIGHT SQUARE BRACKET (`]`)**: [*Label resource close state*][s-label-resource-close]
> *   **U+005D RIGHT SQUARE BRACKET (`]`)**: [*Label reference close state*][s-label-reference-close]
> *   **U+005D RIGHT SQUARE BRACKET (`]`)**: [*Label reference shortcut close state*][s-label-reference-shortcut-close]
> *   **U+005F UNDERSCORE (`_`)**: [*Delimiter run underscore start state*][s-delimiter-run-underscore-start]
> *   **U+0060 GRAVE ACCENT (`` ` ``)**: [*Code start state*][s-code-start]

*   ↪ **[EOF][ceof]**

    Enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 9.4 Plain text state

> **Hookable**, the regular hooks are:
>
> *   **[EOL][ceol]**: [*Plain end-of-line state*][s-plain-end-of-line]
> *   **U+0026 AMPERSAND (`&`)**: [*Character reference state*][s-character-reference]
> *   **U+005C BACKSLASH (`\`)**: [*Character escape state*][s-character-escape]

*   ↪ **[EOF][ceof]**

    Enqueue an [*End-of-file token*][t-end-of-file]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 9.5 End-of-line state

*   ↪ **[EOL][ceol]**

    If the break represented by the character starts with two or more of
    [VIRTUAL SPACE][cvs], U+0009 CHARACTER TABULATION (HT), or U+0020 SPACE (SP), enqueue a [*Hard break label*][l-hard-break], enqueue an [*End-of-line token*][t-end-of-line],
    consume, and switch to the [*Text initial state*][s-text-initial]

    Otherwise, enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume,
    and switch to the [*Text initial state*][s-text-initial]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.6 Plain end-of-line state

*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and switch to the
    [*Text initial state*][s-text-initial]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.7 Image label start state

*   ↪ **U+0021 EXCLAMATION MARK (`!`)**

    Enqueue an [*Image label start label*][l-image-label-start], enqueue a [*Marker token*][t-marker], consume, and switch to
    the [*Image label start after state*][s-image-label-start-after]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.8 Image label start after state

*   ↪ **U+005B LEFT SQUARE BRACKET (`[`)**

    Enqueue a [*Marker token*][t-marker], consume, enqueue an [*Image label open label*][l-image-label-open], and switch to
    the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.9 Character reference state

*   ↪ **U+0026 AMPERSAND (`&`)**

    Enqueue a [*Character reference start label*][l-character-reference-start], enqueue a [*Marker token*][t-marker], consume, and
    switch to the [*Character reference start after state*][s-character-reference-start-after]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.10 Character reference start after state

*   ↪ **U+0023 NUMBER SIGN (`#`)**

    Enqueue a [*Marker token*][t-marker], consume, and switch to the [*Character reference numeric state*][s-character-reference-numeric]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    Let `entityName` be the empty string, append the character to `entityName`,
    enqueue a [*Content token*][t-content], consume, and switch to the [*Character reference named state*][s-character-reference-named]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.11 Character reference named state

> **Note**: This state can be optimized by either imposing a maximum size (the
> size of the longest possible named character reference) or by using a trie of
> the possible named character references.

*   ↪ **U+003B SEMICOLON (`;`)**

    If `entityName` is a [character reference name][character-reference-name], unset `entityName`,
    enqueue a [*Marker token*][t-marker], consume, enqueue a [*Character reference end label*][l-character-reference-end], and switch
    to the [*Text state*][s-text]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    Append the character to `entityName` and consume
*   ↪ **Anything else**

    Unset `entityName` and enqueue a [*NOK label*][l-nok]

### 9.12 Character reference numeric state

*   ↪ **U+0058 (`X`)**\
    ↪ **U+0078 (`x`)**

    Let `characterReferenceCode` be `0`, enqueue a [*Marker token*][t-marker], consume, and switch
    to the [*Character reference hexadecimal start state*][s-character-reference-hexadecimal-start]
*   ↪ **[ASCII digit][ascii-digit]**

    Let `characterReferenceCode` be `0`, enqueue a [*Content token*][t-content] and reconsume in
    the [*Character reference decimal state*][s-character-reference-decimal]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.13 Character reference hexadecimal start state

*   ↪ **[ASCII hex digit][ascii-hex-digit]**

    Enqueue a [*Content token*][t-content] and reconsume in the [*Character reference hexadecimal state*][s-character-reference-hexadecimal]
*   ↪ **Anything else**

    Unset `characterReferenceCode` and enqueue a [*NOK label*][l-nok]

### 9.14 Character reference hexadecimal state

> **Note**: This state can be optimized by imposing a maximum size (the size of
> the longest possible valid hexadecimal character reference, 6).

*   ↪ **U+003B SEMICOLON (`;`)**

    Unset `characterReferenceCode`, enqueue a [*Marker token*][t-marker], consume, enqueue a
    [*Character reference end label*][l-character-reference-end], and switch to the [*Text state*][s-text]
*   ↪ **[ASCII digit][ascii-digit]**

    Multiply `characterReferenceCode` by `0x10`, add the [digitize][digitize]d
    [input character][input-character] to `characterReferenceCode`, and consume
*   ↪ **[ASCII upper hex digit][ascii-upper-hex-digit]**

    Multiply `characterReferenceCode` by `0x10`, add the [digitize][digitize]d
    [input character][input-character] to `characterReferenceCode`, and consume
*   ↪ **[ASCII lower hex digit][ascii-lower-hex-digit]**

    Multiply `characterReferenceCode` by `0x10`, add the [digitize][digitize]d
    [input character][input-character] to `characterReferenceCode`, and consume
*   ↪ **Anything else**

    Unset `characterReferenceCode` and enqueue a [*NOK label*][l-nok]

### 9.15 Character reference decimal state

> **Note**: This state can be optimized by imposing a maximum size (the size of
> the longest possible valid decimal character reference, 7).

*   ↪ **U+003B SEMICOLON (`;`)**

    Unset `characterReferenceCode`, enqueue a [*Marker token*][t-marker], consume, enqueue a
    [*Character reference end label*][l-character-reference-end], and switch to the [*Text state*][s-text]
*   ↪ **[ASCII digit][ascii-digit]**

    Multiply `characterReferenceCode` by `10`, add the [digitize][digitize]d
    [input character][input-character] to `characterReferenceCode`, and consume
*   ↪ **Anything else**

    Unset `characterReferenceCode` and enqueue a [*NOK label*][l-nok]

### 9.16 Delimiter run asterisk start state

*   ↪ **U+002A ASTERISK (`*`)**

    Let `delimiterRunAfter` be `null` and let `delimiterRunBefore` be
    `'whitespace'` if `prev` is [EOF][ceof], [EOL][ceol], or [Unicode whitespace][unicode-whitespace],
    `'punctuation'` if it is [Unicode punctuation][unicode-punctuation], or `null` otherwise

    Enqueue a [*Delimiter run start label*][l-delimiter-run-start], enqueue a [*Sequence token*][t-sequence], consume, and switch
    to the [*Delimiter run asterisk state*][s-delimiter-run-asterisk]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.17 Delimiter run asterisk state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[Unicode whitespace][unicode-whitespace]**

    Let `delimiterRunAfter` be `'whitespace'` and treat it as per the “anything
    else” entry below
*   ↪ **U+002A ASTERISK (`*`)**

    Consume
*   ↪ **[Unicode punctuation][unicode-punctuation]**

    Let `delimiterRunAfter` be `'punctuation'` and treat it as per the “anything
    else” entry below
*   ↪ **Anything else**

    Let `leftFlanking` be whether both `delimiterRunAfter` is not
    `'whitespace'`, and that either `delimiterRunAfter` is not `'punctuation'`
    or that `delimiterRunBefore` is not `null`

    Let `rightFlanking` be whether both `delimiterRunBefore` is not
    `'whitespace'`, and that either `delimiterRunBefore` is not `'punctuation'`
    or that `delimiterRunAfter` is not `null`

    Unset `delimiterRunBefore`, unset `delimiterRunAfter`, enqueue a
    [*Delimiter run end label*][l-delimiter-run-end], and reconsume in the [*Text state*][s-text]

### 9.18 Autolink state

*   ↪ **U+003C LESS THAN (`<`)**

    Enqueue an [*Autolink start label*][l-autolink-start], enqueue a [*Marker token*][t-marker], consume, enqueue an
    [*Autolink open label*][l-autolink-open], and switch to the [*Autolink open state*][s-autolink-open]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.19 Autolink open state

*   ↪ **[ASCII alpha][ascii-alpha]**

    Consume, let `sizeScheme` be `1`, and switch to the
    [*Autolink scheme or email atext state*][s-autolink-scheme-or-email-atext]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.20 Autolink email atext state

*   ↪ **U+0040 AT SIGN (`@`)**

    Enqueue a [*Marker token*][t-marker], consume, let `sizeLabel` be `1`, enqueue a [*Content token*][t-content],
    and switch to the [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **[atext][atext]**\
    ↪ **U+002E DOT (`.`)**

    Consume
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.21 Autolink email label state

*   ↪ **U+002D DASH (`-`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*Autolink email dash state*][s-autolink-email-dash]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+002E DOT (`.`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **U+003E GREATER THAN (`>`)**

    Unset `sizeLabel`, enqueue an [*Autolink email close label*][l-autolink-email-close], enqueue a [*Marker token*][t-marker],
    consume, enqueue an [*Autolink email end label*][l-autolink-email-end], and switch to the [*Text state*][s-text]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1` and consume

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and enqueue a [*NOK label*][l-nok]

### 9.22 Autolink email at sign or dot state

*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*Autolink email label state*][s-autolink-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and enqueue a [*NOK label*][l-nok]

### 9.23 Autolink email dash state

*   ↪ **U+002D DASH (`-`)**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1` and consume

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeLabel` is not `63`, increment `sizeLabel` by `1`, consume, and
    switch to the [*Autolink email label state*][s-autolink-email-label]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Unset `sizeLabel` and enqueue a [*NOK label*][l-nok]

### 9.24 Autolink scheme or email atext state

*   ↪ **U+002B PLUS SIGN (`+`)**\
    ↪ **U+002E DOT (`.`)**\
    ↪ **U+002D DASH (`-`)**\
    ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    Increment `sizeScheme` by `1`, consume, and switch to the
    [*Autolink scheme inside or email atext state*][s-autolink-scheme-inside-or-email-atext]
*   ↪ **[atext][atext]**

    Unset `sizeScheme`, consume, and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Unset `sizeScheme` and enqueue a [*NOK label*][l-nok]

### 9.25 Autolink scheme inside or email atext state

*   ↪ **U+003A COLON (`:`)**

    Unset `sizeScheme`, enqueue a [*Marker token*][t-marker], consume, enqueue a [*Content token*][t-content], and
    switch to the [*Autolink URI inside state*][s-autolink-uri-inside]
*   ↪ **U+0040 AT SIGN (`@`)**

    Unset `sizeScheme`, enqueue a [*Marker token*][t-marker], consume, let `sizeLabel` be `1`,
    enqueue a [*Content token*][t-content], and switch to the [*Autolink email at sign or dot state*][s-autolink-email-at-sign-or-dot]
*   ↪ **U+002B PLUS SIGN (`+`)**\
    ↪ **U+002E DOT (`.`)**\
    ↪ **U+002D DASH (`-`)**\
    ↪ **[ASCII alphanumeric][ascii-alphanumeric]**

    If `sizeScheme` is not `32`, increment `sizeScheme` by `1` and consume

    Otherwise, treat it as per the “atext” entry below
*   ↪ **[atext][atext]**

    Unset `sizeScheme`, consume, and switch to the [*Autolink email atext state*][s-autolink-email-atext]
*   ↪ **Anything else**

    Unset `sizeScheme` and enqueue a [*NOK label*][l-nok]

### 9.26 Autolink URI inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[ASCII control][ascii-control]**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **U+003C LESS THAN (`<`)**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **U+003E GREATER THAN (`>`)**

    Enqueue an [*Autolink uri close label*][l-autolink-uri-close], enqueue a [*Marker token*][t-marker], consume, enqueue an
    [*Autolink uri end label*][l-autolink-uri-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Consume

### 9.27 HTML state

*   ↪ **U+003C LESS THAN (`<`)**

    Enqueue an [*HTML start label*][l-html-start], enqueue a [*Content token*][t-content], consume, and switch to the
    [*HTML open state*][s-html-open]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.28 HTML open state

*   ↪ **U+0021 EXCLAMATION MARK (`!`)**

    Consume and switch to the [*HTML declaration start state*][s-html-declaration-start]
*   ↪ **U+002F SLASH (`/`)**

    Consume and switch to the [*HTML tag close start state*][s-html-tag-close-start]
*   ↪ **U+003F QUESTION MARK (`?`)**

    Consume and switch to the [*HTML instruction inside state*][s-html-instruction-inside]
*   ↪ **[ASCII alpha][ascii-alpha]**

    Consume and switch to the [*HTML tag open inside state*][s-html-tag-open-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.29 HTML declaration start state

*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment open inside state*][s-html-comment-open-inside]
*   ↪ **`[CDATA[` (the five upper letters “CDATA” with a U+005B LEFT SQUARE BRACKET (`[`) before and
    after)**

    Consume and switch to the [*HTML CDATA inside state*][s-html-cdata-inside]
*   ↪ **[ASCII alpha][ascii-alpha]**

    Reconsume in the [*HTML declaration inside state*][s-html-declaration-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.30 HTML comment open inside state

*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment inside state*][s-html-comment-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.31 HTML comment inside state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment close inside state*][s-html-comment-close-inside]
*   ↪ **Anything else**

    Consume

### 9.32 HTML comment close inside state

*   ↪ **U+002D DASH (`-`)**

    Consume and switch to the [*HTML comment close state*][s-html-comment-close]
*   ↪ **Anything else**

    Reconsume in the [*HTML comment inside state*][s-html-comment-inside]

### 9.33 HTML comment close state

> **Note**: a CM comment may not contain two dashes (`--`), and may not end in a
> dash (which would result in `--->`).
> Here we have seen two dashes, so we can either be at the end of a comment, or
> no longer in a comment.

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.34 HTML CDATA inside state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **`]]>` (two of U+005D RIGHT SQUARE BRACKET (`]`), with a U+003E GREATER THAN (`>`) after)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Consume

### 9.35 HTML declaration inside state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Consume

### 9.36 HTML instruction inside state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **U+003F QUESTION MARK (`?`)**

    Consume and switch to the [*HTML instruction close state*][s-html-instruction-close]
*   ↪ **Anything else**

    Consume

### 9.37 HTML instruction close state

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Reconsume in the [*HTML instruction inside state*][s-html-instruction-inside]

### 9.38 HTML tag close start state

*   ↪ **[ASCII alpha][ascii-alpha]**

    Consume and switch to the [*HTML tag close inside state*][s-html-tag-close-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.39 HTML tag close inside state

*   ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*HTML tag close between state*][s-html-tag-close-between]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+002D DASH (`-`)**

    Consume
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.40 HTML tag close between state

> **Note**: an EOL is technically allowed here, but as a `>` after an EOL would
> start a blockquote, practically it’s not possible.

*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.41 HTML tag open inside state

*   ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+002D DASH (`-`)**

    Consume
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.42 HTML tag open between state

*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    Consume and switch to the [*HTML tag open self closing state*][s-html-tag-open-self-closing]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **[ASCII alpha][ascii-alpha]**\
    ↪ **U+003A COLON (`:`)**\
    ↪ **U+005F UNDERSCORE (`_`)**

    Consume and switch to the [*HTML tag open attribute name state*][s-html-tag-open-attribute-name]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.43 HTML tag open self closing state

*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.44 HTML tag open attribute name state

*   ↪ **[ASCII alphanumeric][ascii-alphanumeric]**\
    ↪ **U+002D DASH (`-`)**\
    ↪ **U+002E DOT (`.`)**\
    ↪ **U+003A COLON (`:`)**\
    ↪ **U+005F UNDERSCORE (`_`)**

    Consume
*   ↪ **Anything else**

    Reconsume in the [*HTML tag open attribute name after state*][s-html-tag-open-attribute-name-after]

### 9.45 HTML tag open attribute name after state

*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+002F SLASH (`/`)**

    Consume and switch to the [*HTML tag open self closing state*][s-html-tag-open-self-closing]
*   ↪ **U+003D EQUALS TO (`=`)**

    Consume and switch to the [*HTML tag open attribute before state*][s-html-tag-open-attribute-before]
*   ↪ **U+003E GREATER THAN (`>`)**

    Consume, enqueue an [*HTML end label*][l-html-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.46 HTML tag open attribute before state

*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Consume
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Consume and switch to the [*HTML tag open double quoted attribute state*][s-html-tag-open-double-quoted-attribute]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Consume and switch to the [*HTML tag open single quoted attribute state*][s-html-tag-open-single-quoted-attribute]
*   ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003D EQUALS TO (`=`)**\
    ↪ **U+003E GREATER THAN (`>`)**\
    ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **Anything else**

    Consume and switch to the [*HTML tag open unquoted attribute state*][s-html-tag-open-unquoted-attribute]

### 9.47 HTML tag open double quoted attribute state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Consume and switch to the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **Anything else**

    Consume

### 9.48 HTML tag open single quoted attribute state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], consume, and enqueue a
    [*Content token*][t-content]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Consume and switch to the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **Anything else**

    Consume

### 9.49 HTML tag open unquoted attribute state

*   ↪ **[EOF][ceof]**\
    ↪ **U+0022 QUOTATION MARK (`"`)**\
    ↪ **U+0027 APOSTROPHE (`'`)**\
    ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003D EQUALS TO (`=`)**\
    ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **U+003E GREATER THAN (`>`)**

    Reconsume in the [*HTML tag open between state*][s-html-tag-open-between]
*   ↪ **Anything else**

    Consume

### 9.50 Link label start state

*   ↪ **U+005B LEFT SQUARE BRACKET (`[`)**

    Enqueue a [*Link label start label*][l-link-label-start], enqueue a [*Marker token*][t-marker], consume, enqueue a
    [*Link label open label*][l-link-label-open], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.51 Character escape state

*   ↪ **U+005C BACKSLASH (`\`)**

    Enqueue a [*Character escape start label*][l-character-escape-start], enqueue a [*Marker token*][t-marker], consume, and switch
    to the [*Character escape after state*][s-character-escape-after]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.52 Character escape after state

*   ↪ **[ASCII punctuation][ascii-punctuation]**

    Enqueue a [*Content token*][t-content], consume, enqueue a [*Character escape end label*][l-character-escape-end], and switch
    to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.53 Break escape state

*   ↪ **U+005C BACKSLASH (`\`)**

    Enqueue a [*Break escape start label*][l-break-escape-start], enqueue a [*Hard break label*][l-hard-break], enqueue a [*Marker token*][t-marker],
    consume, and switch to the [*Break escape after state*][s-break-escape-after]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.54 Break escape after state

*   ↪ **[EOL][ceol]**

    If the break represented by the character does not start with a [VIRTUAL SPACE][cvs],
    U+0009 CHARACTER TABULATION (HT), or U+0020 SPACE (SP), enqueue an [*End-of-line token*][t-end-of-line], consume, enqueue a
    [*Break escape end label*][l-break-escape-end], and switch to the [*Text initial state*][s-text-initial]

    Otherwise, treat it as per the “anything else” entry below
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.55 Label resource close state

*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Enqueue a [*Label close label*][l-label-close], enqueue a [*Marker token*][t-marker], consume, enqueue a [*Label end label*][l-label-end],
    and switch to the [*Label resource end after state*][s-label-resource-end-after]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.56 Label resource end after state

*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**

    Enqueue a [*Resource information start label*][l-resource-information-start], enqueue a [*Marker token*][t-marker], consume, enqueue
    a [*Resource information open label*][l-resource-information-open], and switch to the [*Resource information open state*][s-resource-information-open]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.57 Resource information open state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    Enqueue a [*Resource information close label*][l-resource-information-close], enqueue a [*Marker token*][t-marker], consume, enqueue
    a [*Resource information end label*][l-resource-information-end], and switch to the [*Text state*][s-text]
*   ↪ **U+003C LESS THAN (`<`)**

    Enqueue a [*Resource information destination quoted start label*][l-resource-information-destination-quoted-start], enqueue a
    [*Marker token*][t-marker], consume, enqueue a [*Resource information destination quoted open label*][l-resource-information-destination-quoted-open],
    and switch to the [*Resource information destination quoted inside state*][s-resource-information-destination-quoted-inside]
*   ↪ **[ASCII control][ascii-control]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **Anything else**

    Enqueue a [*Resource information destination unquoted start label*][l-resource-information-destination-unquoted-start], enqueue a
    [*Content token*][t-content], consume, enqueue a
    [*Resource information destination unquoted open label*][l-resource-information-destination-unquoted-open], and switch to the
    [*Resource information destination unquoted inside state*][s-resource-information-destination-unquoted-inside]

### 9.58 Resource information destination quoted inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **U+003C LESS THAN (`<`)**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **U+003E GREATER THAN (`>`)**

    Enqueue a [*Resource information destination quoted close label*][l-resource-information-destination-quoted-close], enqueue a
    [*Marker token*][t-marker], consume, enqueue a [*Resource information destination quoted end label*][l-resource-information-destination-quoted-end],
    and switch to the [*Resource information destination quoted after state*][s-resource-information-destination-quoted-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the
    [*Resource information destination quoted escape state*][s-resource-information-destination-quoted-escape]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 9.59 Resource information destination quoted escape state

*   ↪ **U+003C LESS THAN (`<`)**\
    ↪ **U+003E GREATER THAN (`>`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Resource information destination quoted inside state*][s-resource-information-destination-quoted-inside]
*   ↪ **Anything else**

    Reconsume in the [*Resource information destination quoted inside state*][s-resource-information-destination-quoted-inside]

### 9.60 Resource information destination quoted after state

*   ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **U+003E GREATER THAN (`>`)**

    Reconsume in the [*Resource information between state*][s-resource-information-between]
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    Enqueue a [*Resource information close label*][l-resource-information-close], enqueue a [*Marker token*][t-marker], consume, enqueue
    a [*Resource information end label*][l-resource-information-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.61 Resource information destination unquoted inside state

*   ↪ **[EOF][ceof]**

    Unset `balance` and enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**\
    ↪ **U+003E GREATER THAN (`>`)**

    Enqueue a [*Resource information destination unquoted close label*][l-resource-information-destination-unquoted-close], enqueue a
    [*Resource information destination unquoted end label*][l-resource-information-destination-unquoted-end], and reconsume in the
    [*Resource information between state*][s-resource-information-between]
*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**

    Increment `balance` by `1` and consume
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    If `balance` is `0`, unset `balance`, enqueue a
    [*Resource information destination unquoted close label*][l-resource-information-destination-unquoted-close], enqueue a
    [*Resource information destination unquoted end label*][l-resource-information-destination-unquoted-end], and reconsume in the
    [*Resource information between state*][s-resource-information-between]

    Otherwise, decrement `balance` by `1`, and consume
*   ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Resource information destination unquoted escape state*][s-resource-information-destination-unquoted-escape]
*   ↪ **[ASCII control][ascii-control]**

    Unset `balance` and enqueue a [*NOK label*][l-nok]
*   ↪ **Anything else**

    Consume

### 9.62 Resource information destination unquoted escape state

*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**\
    ↪ **U+0029 RIGHT PARENTHESIS (`)`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Resource information destination unquoted inside state*][s-resource-information-destination-unquoted-inside]
*   ↪ **Anything else**

    Reconsume in the [*Resource information destination unquoted inside state*][s-resource-information-destination-unquoted-inside]

### 9.63 Resource information between state

*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Enqueue a [*Resource information title start label*][l-resource-information-title-start], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Resource information title open label*][l-resource-information-title-open], and switch to the
    [*Resource information title double quoted inside state*][s-resource-information-title-double-quoted-inside]
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Enqueue a [*Resource information title start label*][l-resource-information-title-start], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Resource information title open label*][l-resource-information-title-open], and switch to the
    [*Resource information title single quoted inside state*][s-resource-information-title-single-quoted-inside]
*   ↪ **U+0028 LEFT PARENTHESIS (`(`)**

    Enqueue a [*Resource information title start label*][l-resource-information-title-start], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Resource information title open label*][l-resource-information-title-open], and switch to the
    [*Resource information title paren quoted inside state*][s-resource-information-title-paren-quoted-inside]
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    Enqueue a [*Resource information close label*][l-resource-information-close], enqueue a [*Marker token*][t-marker], consume, enqueue
    a [*Resource information end label*][l-resource-information-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.64 Resource information title double quoted inside state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **U+0022 QUOTATION MARK (`"`)**

    Enqueue a [*Resource information title close label*][l-resource-information-title-close], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Resource information title end label*][l-resource-information-title-end], and switch to the
    [*Resource information title after state*][s-resource-information-title-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the
    [*Resource information title double quoted escape state*][s-resource-information-title-double-quoted-escape]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 9.65 Resource information title double quoted escape state

*   ↪ **U+0022 QUOTATION MARK (`"`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Resource information title double quoted inside state*][s-resource-information-title-double-quoted-inside]
*   ↪ **Anything else**

    Reconsume in the [*Resource information title double quoted inside state*][s-resource-information-title-double-quoted-inside]

### 9.66 Resource information title single quoted inside state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **U+0027 APOSTROPHE (`'`)**

    Enqueue a [*Resource information title close label*][l-resource-information-title-close], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Resource information title end label*][l-resource-information-title-end], and switch to the
    [*Resource information title after state*][s-resource-information-title-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the
    [*Resource information title single quoted escape state*][s-resource-information-title-single-quoted-escape]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 9.67 Resource information title single quoted escape state

*   ↪ **U+0027 APOSTROPHE (`'`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Resource information title single quoted inside state*][s-resource-information-title-single-quoted-inside]
*   ↪ **Anything else**

    Reconsume in the [*Resource information title single quoted inside state*][s-resource-information-title-single-quoted-inside]

### 9.68 Resource information title paren quoted inside state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    Enqueue a [*Resource information title close label*][l-resource-information-title-close], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Resource information title end label*][l-resource-information-title-end], and switch to the
    [*Resource information title after state*][s-resource-information-title-after]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the
    [*Resource information title paren quoted escape state*][s-resource-information-title-paren-quoted-escape]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 9.69 Resource information title paren quoted escape state

*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**\
    ↪ **U+005C BACKSLASH (`\`)**

    Consume and switch to the [*Resource information title paren quoted inside state*][s-resource-information-title-paren-quoted-inside]
*   ↪ **Anything else**

    Reconsume in the [*Resource information title paren quoted inside state*][s-resource-information-title-paren-quoted-inside]

### 9.70 Resource information title after state

*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+0029 RIGHT PARENTHESIS (`)`)**

    Enqueue a [*Resource information close label*][l-resource-information-close], enqueue a [*Marker token*][t-marker], consume, enqueue
    a [*Resource information end label*][l-resource-information-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.71 Label reference close state

*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Enqueue a [*Label close label*][l-label-close], enqueue a [*Marker token*][t-marker], consume, enqueue a [*Label end label*][l-label-end],
    and switch to the [*Label reference end after state*][s-label-reference-end-after]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.72 Label reference end after state

*   ↪ **U+005B LEFT SQUARE BRACKET (`[`)**

    Enqueue a [*Reference label start label*][l-reference-label-start], enqueue a [*Marker token*][t-marker], consume, enqueue a
    [*Reference label open label*][l-reference-label-open], and switch to the [*Reference label open state*][s-reference-label-open]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.73 Reference label open state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Enqueue a [*Reference label collapsed close label*][l-reference-label-collapsed-close], enqueue a [*Marker token*][t-marker], consume,
    enqueue a [*Reference label end label*][l-reference-label-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*Content token*][t-content], consume, and switch to the [*Reference label inside state*][s-reference-label-inside]

### 9.74 Reference label inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*Reference label between state*][s-reference-label-between]
*   ↪ **U+005C BACKSLASH (`\`)**

    Ensure a [*Content token*][t-content], consume, and switch to the [*Reference label escape state*][s-reference-label-escape]
*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Enqueue a [*Reference label full close label*][l-reference-label-full-close], enqueue a [*Marker token*][t-marker], consume, enqueue
    a [*Reference label end label*][l-reference-label-end], and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 9.75 Reference label between state

*   ↪ **[EOF][ceof]**

    Enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Reference label inside state*][s-reference-label-inside]

### 9.76 Reference label escape state

*   ↪ **U+005C BACKSLASH (`\`)**\
    ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Consume and switch to the [*Reference label inside state*][s-reference-label-inside]
*   ↪ **Anything else**

    Reconsume in the [*Reference label inside state*][s-reference-label-inside]

### 9.77 Label reference shortcut close state

*   ↪ **U+005D RIGHT SQUARE BRACKET (`]`)**

    Enqueue a [*Label close label*][l-label-close], enqueue a [*Marker token*][t-marker], consume, enqueue a [*Label end label*][l-label-end],
    and switch to the [*Text state*][s-text]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.78 Delimiter run underscore start state

*   ↪ **U+005F UNDERSCORE (`_`)**

    Let `delimiterRunAfter` be `null` and let `delimiterRunBefore` be
    `'whitespace'` if `prev` is [EOF][ceof], [EOL][ceol], or [Unicode whitespace][unicode-whitespace],
    `'punctuation'` if it is [Unicode punctuation][unicode-punctuation], or `null` otherwise

    Enqueue a [*Delimiter run start label*][l-delimiter-run-start], enqueue a [*Sequence token*][t-sequence], consume, and switch
    to the [*Delimiter run underscore state*][s-delimiter-run-underscore]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.79 Delimiter run underscore state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[Unicode whitespace][unicode-whitespace]**

    Let `delimiterRunAfter` be `'whitespace'` and treat it as per the “anything
    else” entry below
*   ↪ **U+005F UNDERSCORE (`_`)**

    Consume
*   ↪ **[Unicode punctuation][unicode-punctuation]**

    Let `delimiterRunAfter` be `'punctuation'` and treat it as per the “anything
    else” entry below
*   ↪ **Anything else**

    Let `leftFlanking` be whether both `delimiterRunAfter` is not
    `'whitespace'`, and that either `delimiterRunAfter` is not `'punctuation'`
    or that `delimiterRunBefore` is not `null`

    Let `rightFlanking` be whether both `delimiterRunBefore` is not
    `'whitespace'`, and that either `delimiterRunBefore` is not `'punctuation'`
    or that `delimiterRunAfter` is not `null`

    Unset `delimiterRunBefore`, unset `delimiterRunAfter`, enqueue a
    [*Delimiter run end label*][l-delimiter-run-end], and reconsume in the [*Text state*][s-text]

### 9.80 Code start state

*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Let `sizeOpen` be `1`, enqueue a [*Code start label*][l-code-start], enqueue a [*Code fence start label*][l-code-fence-start],
    enqueue a [*Marker token*][t-marker], consume, and switch to the [*Code open fence inside state*][s-code-open-fence-inside]
*   ↪ **Anything else**

    Enqueue a [*NOK label*][l-nok]

### 9.81 Code open fence inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Enqueue a [*Code fence end label*][l-code-fence-end] and reconsume in the [*Code between state*][s-code-between]
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Increment `sizeOpen` by `1` and consume
*   ↪ **Anything else**

    Enqueue a [*Code fence end label*][l-code-fence-end], enqueue a [*Content token*][t-content], consume, and switch to the
    [*Code inside state*][s-code-inside]

### 9.82 Code between state

*   ↪ **[EOF][ceof]**

    Unset `sizeOpen` and enqueue a [*NOK label*][l-nok]
*   ↪ **[EOL][ceol]**

    Enqueue a [*Soft break label*][l-soft-break], enqueue an [*End-of-line token*][t-end-of-line], and consume
*   ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Ensure a [*Whitespace token*][t-whitespace] and consume
*   ↪ **Anything else**

    Reconsume in the [*Code inside state*][s-code-inside]

### 9.83 Code inside state

*   ↪ **[EOF][ceof]**\
    ↪ **[EOL][ceol]**\
    ↪ **[VIRTUAL SPACE][cvs]**\
    ↪ **U+0009 CHARACTER TABULATION (HT)**\
    ↪ **U+0020 SPACE (SP)**

    Reconsume in the [*Code between state*][s-code-between]
*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Let `sizeClose` be `1`, enqueue a [*Code fence start label*][l-code-fence-start], enqueue a [*Marker token*][t-marker],
    consume, and switch to the [*Code close fence inside state*][s-code-close-fence-inside]
*   ↪ **Anything else**

    Ensure a [*Content token*][t-content] and consume

### 9.84 Code close fence inside state

*   ↪ **U+0060 GRAVE ACCENT (`` ` ``)**

    Increment `sizeClose` by `1` and consume
*   ↪ **Anything else**

    If `sizeOpen` is `sizeClose`, unset `sizeOpen`, unset `sizeClose`, enqueue a
    [*Code fence end label*][l-code-fence-end], enqueue a [*Code end label*][l-code-end], and reconsume in the [*Text state*][s-text]

    Otherwise, unset `sizeClose` and reconsume in the [*Code inside state*][s-code-inside]

## 10 Labels

### 10.1 NOK label

### 10.2 Blank line end label

### 10.3 ATX heading start label

### 10.4 ATX heading fence start label

### 10.5 ATX heading fence end label

### 10.6 ATX heading end label

### 10.7 Thematic break start label

### 10.8 Thematic break end label

### 10.9 Setext heading underline start label

### 10.10 Setext heading underline end label

### 10.11 Fenced code start label

### 10.12 Fenced code fence start label

### 10.13 Fenced code fence sequence start label

### 10.14 Fenced code fence sequence end label

### 10.15 Fenced code fence end label

### 10.16 Fenced code end label

### 10.17 Content definition partial label

### 10.18 Content definition start label

### 10.19 Content definition label start label

### 10.20 Content definition label open label

### 10.21 Content definition label close label

### 10.22 Content definition label end label

### 10.23 Content definition destination start label

### 10.24 Content definition destination quoted open label

### 10.25 Content definition destination quoted close label

### 10.26 Content definition destination unquoted open label

### 10.27 Content definition destination unquoted close label

### 10.28 Content definition destination end label

### 10.29 Content definition title start label

### 10.30 Content definition title open label

### 10.31 Content definition title close label

### 10.32 Content definition title end label

### 10.33 Content definition end label

### 10.34 Hard break label

### 10.35 Soft break label

### 10.36 Image label start label

### 10.37 Image label open label

### 10.38 Character reference start label

### 10.39 Character reference end label

### 10.40 Delimiter run start label

### 10.41 Delimiter run end label

### 10.42 Autolink start label

### 10.43 Autolink open label

### 10.44 Autolink email close label

### 10.45 Autolink email end label

### 10.46 Autolink uri close label

### 10.47 Autolink uri end label

### 10.48 HTML start label

### 10.49 HTML end label

### 10.50 Link label start label

### 10.51 Link label open label

### 10.52 Character escape start label

### 10.53 Character escape end label

### 10.54 Break escape start label

### 10.55 Break escape end label

### 10.56 Label close label

### 10.57 Label end label

### 10.58 Resource information start label

### 10.59 Resource information open label

### 10.60 Resource information destination quoted start label

### 10.61 Resource information destination quoted open label

### 10.62 Resource information destination quoted close label

### 10.63 Resource information destination quoted end label

### 10.64 Resource information destination unquoted start label

### 10.65 Resource information destination unquoted open label

### 10.66 Resource information destination unquoted close label

### 10.67 Resource information destination unquoted end label

### 10.68 Resource information title start label

### 10.69 Resource information title open label

### 10.70 Resource information title close label

### 10.71 Resource information title end label

### 10.72 Resource information close label

### 10.73 Resource information end label

### 10.74 Reference label start label

### 10.75 Reference label open label

### 10.76 Reference label collapsed close label

### 10.77 Reference label full close label

### 10.78 Reference label end label

### 10.79 Code start label

### 10.80 Code fence start label

### 10.81 Code fence end label

### 10.82 Code end label

## 11 Tokens

### 11.1 Whitespace token

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

### 11.2 Line terminator token

A [*Line terminator token*][t-line-terminator] represents a line break.

```idl
interface LineEnding <: Token {}
```

```js
{type: 'lineEnding'}
```

### 11.3 End-of-file token

An [*End-of-file token*][t-end-of-file] represents the end of the syntax.

```idl
interface EndOfFile <: Token {}
```

```js
{type: 'endOfFile'}
```

### 11.4 End-of-line token

An [*End-of-line token*][t-end-of-line] represents a point between two runs of text in content.

```idl
interface EndOfLine <: Token {}
```

```js
{type: 'endOfLine'}
```

### 11.5 Marker token

A [*Marker token*][t-marker] represents one punctuation character that is part of syntax instead
of content.

```idl
interface Marker <: Token {}
```

```js
{type: 'marker'}
```

### 11.6 Sequence token

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

### 11.7 Content token

A [*Content token*][t-content] represents content.

```idl
interface Content <: Token {
  prefix: string
}
```

```js
{type: 'content', prefix: '  '}
```

## 12 Appendix

### 12.1 Raw tags

A <a id="raw-tag" href="#raw-tag">**raw tag**</a> is one of: `script`, `pre`, and `style`.

### 12.2 Basic tags

A <a id="basic-tag" href="#basic-tag">**basic tag**</a> is one of: `address`, `article`, `aside`, `base`, `basefont`,
`blockquote`, `body`, `caption`, `center`, `col`, `colgroup`, `dd`, `details`,
`dialog`, `dir`, `div`, `dl`, `dt`, `fieldset`, `figcaption`, `figure`,
`footer`, `form`, `frame`, `frameset`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`,
`head`, `header`, `hr`, `html`, `iframe`, `legend`, `li`, `link`, `main`,
`menu`, `menuitem`, `nav`, `noframes`, `ol`, `optgroup`, `option`, `p`,
`param`, `section`, `source`, `summary`, `table`, `tbody`, `td`, `tfoot`, `th`,
`thead`, `title`, `tr`, `track`, and `ul`.

### 12.3 Named character references

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

## 13 References

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

[unicode-whitespace]: #unicode-whitespace

[unicode-punctuation]: #unicode-punctuation

[atext]: #atext

[ascii-lowercase]: #ascii-lowercase

[digitize]: #digitize

[cvs]: #cvs

[ceol]: #ceol

[ceof]: #ceof

[input-stream]: #input-stream

[input-character]: #input-character

[shared-space]: #shared-space

[queue]: #queue

[current-token]: #current-token

[construct]: #construct

[switch]: #switch

[consume]: #consume

[reconsume]: #reconsume

[enqueue]: #enqueue

[flow-state-machine]: #flow-state-machine

[content-state-machine]: #content-state-machine

[text-state-machine]: #text-state-machine

[raw-tag]: #raw-tag

[basic-tag]: #basic-tag

[character-reference-name]: #character-reference-name

[s-flow-prefix-start]: #71-flow-prefix-start-state

[s-flow-start]: #72-flow-start-state

[s-flow-prefix-initial]: #73-flow-prefix-initial-state

[s-flow-initial]: #74-flow-initial-state

[s-blank-line]: #75-blank-line-state

[s-atx-heading-start]: #76-atx-heading-start-state

[s-atx-heading-fence-open-inside]: #77-atx-heading-fence-open-inside-state

[s-atx-heading-inside]: #78-atx-heading-inside-state

[s-thematic-break-asterisk-start]: #79-thematic-break-asterisk-start-state

[s-thematic-break-asterisk-inside]: #710-thematic-break-asterisk-inside-state

[s-setext-heading-underline-dash-start]: #711-setext-heading-underline-dash-start-state

[s-setext-heading-underline-dash-inside]: #712-setext-heading-underline-dash-inside-state

[s-setext-heading-underline-dash-after]: #713-setext-heading-underline-dash-after-state

[s-thematic-break-dash-start]: #714-thematic-break-dash-start-state

[s-thematic-break-dash-inside]: #715-thematic-break-dash-inside-state

[s-flow-html-start]: #716-flow-html-start-state

[s-flow-html-tag-open]: #717-flow-html-tag-open-state

[s-flow-html-markup-declaration-open]: #718-flow-html-markup-declaration-open-state

[s-flow-html-end-tag-open]: #719-flow-html-end-tag-open-state

[s-flow-html-tag-name]: #720-flow-html-tag-name-state

[s-flow-html-basic-self-closing]: #721-flow-html-basic-self-closing-state

[s-flow-html-complete-attribute-name-before]: #722-flow-html-complete-attribute-name-before-state

[s-flow-html-complete-attribute-name]: #723-flow-html-complete-attribute-name-state

[s-flow-html-complete-attribute-name-after]: #724-flow-html-complete-attribute-name-after-state

[s-flow-html-complete-attribute-value-before]: #725-flow-html-complete-attribute-value-before-state

[s-flow-html-complete-attribute-value-double-quoted]: #726-flow-html-complete-attribute-value-double-quoted-state

[s-flow-html-complete-attribute-value-single-quoted]: #727-flow-html-complete-attribute-value-single-quoted-state

[s-flow-html-complete-attribute-value-unquoted]: #728-flow-html-complete-attribute-value-unquoted-state

[s-flow-html-complete-self-closing]: #729-flow-html-complete-self-closing-state

[s-flow-html-complete-tag-after]: #730-flow-html-complete-tag-after-state

[s-flow-html-continuation]: #731-flow-html-continuation-state

[s-flow-html-continuation-comment-inside]: #732-flow-html-continuation-comment-inside-state

[s-flow-html-continuation-raw-tag-open]: #733-flow-html-continuation-raw-tag-open-state

[s-flow-html-continuation-raw-end-tag]: #734-flow-html-continuation-raw-end-tag-state

[s-flow-html-continuation-character-data-inside]: #735-flow-html-continuation-character-data-inside-state

[s-flow-html-continuation-declaration-before]: #736-flow-html-continuation-declaration-before-state

[s-flow-html-continuation-close]: #737-flow-html-continuation-close-state

[s-setext-heading-underline-equals-to-start]: #738-setext-heading-underline-equals-to-start-state

[s-setext-heading-underline-equals-to-inside]: #739-setext-heading-underline-equals-to-inside-state

[s-setext-heading-underline-equals-to-after]: #740-setext-heading-underline-equals-to-after-state

[s-thematic-break-underscore-start]: #741-thematic-break-underscore-start-state

[s-thematic-break-underscore-inside]: #742-thematic-break-underscore-inside-state

[s-fenced-code-grave-accent-start]: #743-fenced-code-grave-accent-start-state

[s-fenced-code-grave-accent-open-fence-inside]: #744-fenced-code-grave-accent-open-fence-inside-state

[s-fenced-code-grave-accent-open-fence-after]: #745-fenced-code-grave-accent-open-fence-after-state

[s-fenced-code-grave-accent-continuation]: #746-fenced-code-grave-accent-continuation-state

[s-fenced-code-grave-accent-close-fence-inside]: #747-fenced-code-grave-accent-close-fence-inside-state

[s-fenced-code-grave-accent-close-fence-after]: #748-fenced-code-grave-accent-close-fence-after-state

[s-fenced-code-grave-accent-continuation-inside]: #749-fenced-code-grave-accent-continuation-inside-state

[s-fenced-code-tilde-start]: #750-fenced-code-tilde-start-state

[s-fenced-code-tilde-open-fence-inside]: #751-fenced-code-tilde-open-fence-inside-state

[s-fenced-code-tilde-open-fence-after]: #752-fenced-code-tilde-open-fence-after-state

[s-fenced-code-tilde-continuation]: #753-fenced-code-tilde-continuation-state

[s-fenced-code-tilde-close-fence-inside]: #754-fenced-code-tilde-close-fence-inside-state

[s-fenced-code-tilde-close-fence-after]: #755-fenced-code-tilde-close-fence-after-state

[s-fenced-code-tilde-continuation-inside]: #756-fenced-code-tilde-continuation-inside-state

[s-flow-content]: #757-flow-content-state

[s-content-start]: #81-content-start-state

[s-content-initial]: #82-content-initial-state

[s-definition-label-start]: #83-definition-label-start-state

[s-definition-label-before]: #84-definition-label-before-state

[s-definition-label-inside]: #85-definition-label-inside-state

[s-definition-label-between]: #86-definition-label-between-state

[s-definition-label-escape]: #87-definition-label-escape-state

[s-definition-label-after]: #88-definition-label-after-state

[s-definition-destination-before]: #89-definition-destination-before-state

[s-definition-destination-quoted-inside]: #810-definition-destination-quoted-inside-state

[s-definition-destination-quoted-escape]: #811-definition-destination-quoted-escape-state

[s-definition-destination-unquoted-inside]: #812-definition-destination-unquoted-inside-state

[s-definition-destination-unquoted-escape]: #813-definition-destination-unquoted-escape-state

[s-definition-destination-after]: #814-definition-destination-after-state

[s-definition-title-before]: #815-definition-title-before-state

[s-definition-title-or-label-before]: #816-definition-title-or-label-before-state

[s-definition-title-double-quoted]: #817-definition-title-double-quoted-state

[s-definition-title-double-quoted-between]: #818-definition-title-double-quoted-between-state

[s-definition-title-double-quoted-escape]: #819-definition-title-double-quoted-escape-state

[s-definition-title-single-quoted]: #820-definition-title-single-quoted-state

[s-definition-title-single-quoted-between]: #821-definition-title-single-quoted-between-state

[s-definition-title-single-quoted-escape]: #822-definition-title-single-quoted-escape-state

[s-definition-title-paren-quoted]: #823-definition-title-paren-quoted-state

[s-definition-title-paren-quoted-between]: #824-definition-title-paren-quoted-between-state

[s-definition-title-paren-quoted-escape]: #825-definition-title-paren-quoted-escape-state

[s-definition-title-after]: #826-definition-title-after-state

[s-phrasing-content]: #827-phrasing-content-state

[s-text-start]: #91-text-start-state

[s-text-initial]: #92-text-initial-state

[s-text]: #93-text-state

[s-plain-text]: #94-plain-text-state

[s-end-of-line]: #95-end-of-line-state

[s-plain-end-of-line]: #96-plain-end-of-line-state

[s-image-label-start]: #97-image-label-start-state

[s-image-label-start-after]: #98-image-label-start-after-state

[s-character-reference]: #99-character-reference-state

[s-character-reference-start-after]: #910-character-reference-start-after-state

[s-character-reference-named]: #911-character-reference-named-state

[s-character-reference-numeric]: #912-character-reference-numeric-state

[s-character-reference-hexadecimal-start]: #913-character-reference-hexadecimal-start-state

[s-character-reference-hexadecimal]: #914-character-reference-hexadecimal-state

[s-character-reference-decimal]: #915-character-reference-decimal-state

[s-delimiter-run-asterisk-start]: #916-delimiter-run-asterisk-start-state

[s-delimiter-run-asterisk]: #917-delimiter-run-asterisk-state

[s-autolink]: #918-autolink-state

[s-autolink-open]: #919-autolink-open-state

[s-autolink-email-atext]: #920-autolink-email-atext-state

[s-autolink-email-label]: #921-autolink-email-label-state

[s-autolink-email-at-sign-or-dot]: #922-autolink-email-at-sign-or-dot-state

[s-autolink-email-dash]: #923-autolink-email-dash-state

[s-autolink-scheme-or-email-atext]: #924-autolink-scheme-or-email-atext-state

[s-autolink-scheme-inside-or-email-atext]: #925-autolink-scheme-inside-or-email-atext-state

[s-autolink-uri-inside]: #926-autolink-uri-inside-state

[s-html]: #927-html-state

[s-html-open]: #928-html-open-state

[s-html-declaration-start]: #929-html-declaration-start-state

[s-html-comment-open-inside]: #930-html-comment-open-inside-state

[s-html-comment-inside]: #931-html-comment-inside-state

[s-html-comment-close-inside]: #932-html-comment-close-inside-state

[s-html-comment-close]: #933-html-comment-close-state

[s-html-cdata-inside]: #934-html-cdata-inside-state

[s-html-declaration-inside]: #935-html-declaration-inside-state

[s-html-instruction-inside]: #936-html-instruction-inside-state

[s-html-instruction-close]: #937-html-instruction-close-state

[s-html-tag-close-start]: #938-html-tag-close-start-state

[s-html-tag-close-inside]: #939-html-tag-close-inside-state

[s-html-tag-close-between]: #940-html-tag-close-between-state

[s-html-tag-open-inside]: #941-html-tag-open-inside-state

[s-html-tag-open-between]: #942-html-tag-open-between-state

[s-html-tag-open-self-closing]: #943-html-tag-open-self-closing-state

[s-html-tag-open-attribute-name]: #944-html-tag-open-attribute-name-state

[s-html-tag-open-attribute-name-after]: #945-html-tag-open-attribute-name-after-state

[s-html-tag-open-attribute-before]: #946-html-tag-open-attribute-before-state

[s-html-tag-open-double-quoted-attribute]: #947-html-tag-open-double-quoted-attribute-state

[s-html-tag-open-single-quoted-attribute]: #948-html-tag-open-single-quoted-attribute-state

[s-html-tag-open-unquoted-attribute]: #949-html-tag-open-unquoted-attribute-state

[s-link-label-start]: #950-link-label-start-state

[s-character-escape]: #951-character-escape-state

[s-character-escape-after]: #952-character-escape-after-state

[s-break-escape]: #953-break-escape-state

[s-break-escape-after]: #954-break-escape-after-state

[s-label-resource-close]: #955-label-resource-close-state

[s-label-resource-end-after]: #956-label-resource-end-after-state

[s-resource-information-open]: #957-resource-information-open-state

[s-resource-information-destination-quoted-inside]: #958-resource-information-destination-quoted-inside-state

[s-resource-information-destination-quoted-escape]: #959-resource-information-destination-quoted-escape-state

[s-resource-information-destination-quoted-after]: #960-resource-information-destination-quoted-after-state

[s-resource-information-destination-unquoted-inside]: #961-resource-information-destination-unquoted-inside-state

[s-resource-information-destination-unquoted-escape]: #962-resource-information-destination-unquoted-escape-state

[s-resource-information-between]: #963-resource-information-between-state

[s-resource-information-title-double-quoted-inside]: #964-resource-information-title-double-quoted-inside-state

[s-resource-information-title-double-quoted-escape]: #965-resource-information-title-double-quoted-escape-state

[s-resource-information-title-single-quoted-inside]: #966-resource-information-title-single-quoted-inside-state

[s-resource-information-title-single-quoted-escape]: #967-resource-information-title-single-quoted-escape-state

[s-resource-information-title-paren-quoted-inside]: #968-resource-information-title-paren-quoted-inside-state

[s-resource-information-title-paren-quoted-escape]: #969-resource-information-title-paren-quoted-escape-state

[s-resource-information-title-after]: #970-resource-information-title-after-state

[s-label-reference-close]: #971-label-reference-close-state

[s-label-reference-end-after]: #972-label-reference-end-after-state

[s-reference-label-open]: #973-reference-label-open-state

[s-reference-label-inside]: #974-reference-label-inside-state

[s-reference-label-between]: #975-reference-label-between-state

[s-reference-label-escape]: #976-reference-label-escape-state

[s-label-reference-shortcut-close]: #977-label-reference-shortcut-close-state

[s-delimiter-run-underscore-start]: #978-delimiter-run-underscore-start-state

[s-delimiter-run-underscore]: #979-delimiter-run-underscore-state

[s-code-start]: #980-code-start-state

[s-code-open-fence-inside]: #981-code-open-fence-inside-state

[s-code-between]: #982-code-between-state

[s-code-inside]: #983-code-inside-state

[s-code-close-fence-inside]: #984-code-close-fence-inside-state

[l-nok]: #101-nok-label

[l-blank-line-end]: #102-blank-line-end-label

[l-atx-heading-start]: #103-atx-heading-start-label

[l-atx-heading-fence-start]: #104-atx-heading-fence-start-label

[l-atx-heading-fence-end]: #105-atx-heading-fence-end-label

[l-atx-heading-end]: #106-atx-heading-end-label

[l-thematic-break-start]: #107-thematic-break-start-label

[l-thematic-break-end]: #108-thematic-break-end-label

[l-setext-heading-underline-start]: #109-setext-heading-underline-start-label

[l-setext-heading-underline-end]: #1010-setext-heading-underline-end-label

[l-fenced-code-start]: #1011-fenced-code-start-label

[l-fenced-code-fence-start]: #1012-fenced-code-fence-start-label

[l-fenced-code-fence-sequence-start]: #1013-fenced-code-fence-sequence-start-label

[l-fenced-code-fence-sequence-end]: #1014-fenced-code-fence-sequence-end-label

[l-fenced-code-fence-end]: #1015-fenced-code-fence-end-label

[l-fenced-code-end]: #1016-fenced-code-end-label

[l-content-definition-partial]: #1017-content-definition-partial-label

[l-content-definition-start]: #1018-content-definition-start-label

[l-content-definition-label-start]: #1019-content-definition-label-start-label

[l-content-definition-label-open]: #1020-content-definition-label-open-label

[l-content-definition-label-close]: #1021-content-definition-label-close-label

[l-content-definition-label-end]: #1022-content-definition-label-end-label

[l-content-definition-destination-start]: #1023-content-definition-destination-start-label

[l-content-definition-destination-quoted-open]: #1024-content-definition-destination-quoted-open-label

[l-content-definition-destination-quoted-close]: #1025-content-definition-destination-quoted-close-label

[l-content-definition-destination-unquoted-open]: #1026-content-definition-destination-unquoted-open-label

[l-content-definition-destination-unquoted-close]: #1027-content-definition-destination-unquoted-close-label

[l-content-definition-destination-end]: #1028-content-definition-destination-end-label

[l-content-definition-title-start]: #1029-content-definition-title-start-label

[l-content-definition-title-open]: #1030-content-definition-title-open-label

[l-content-definition-title-close]: #1031-content-definition-title-close-label

[l-content-definition-title-end]: #1032-content-definition-title-end-label

[l-content-definition-end]: #1033-content-definition-end-label

[l-hard-break]: #1034-hard-break-label

[l-soft-break]: #1035-soft-break-label

[l-image-label-start]: #1036-image-label-start-label

[l-image-label-open]: #1037-image-label-open-label

[l-character-reference-start]: #1038-character-reference-start-label

[l-character-reference-end]: #1039-character-reference-end-label

[l-delimiter-run-start]: #1040-delimiter-run-start-label

[l-delimiter-run-end]: #1041-delimiter-run-end-label

[l-autolink-start]: #1042-autolink-start-label

[l-autolink-open]: #1043-autolink-open-label

[l-autolink-email-close]: #1044-autolink-email-close-label

[l-autolink-email-end]: #1045-autolink-email-end-label

[l-autolink-uri-close]: #1046-autolink-uri-close-label

[l-autolink-uri-end]: #1047-autolink-uri-end-label

[l-html-start]: #1048-html-start-label

[l-html-end]: #1049-html-end-label

[l-link-label-start]: #1050-link-label-start-label

[l-link-label-open]: #1051-link-label-open-label

[l-character-escape-start]: #1052-character-escape-start-label

[l-character-escape-end]: #1053-character-escape-end-label

[l-break-escape-start]: #1054-break-escape-start-label

[l-break-escape-end]: #1055-break-escape-end-label

[l-label-close]: #1056-label-close-label

[l-label-end]: #1057-label-end-label

[l-resource-information-start]: #1058-resource-information-start-label

[l-resource-information-open]: #1059-resource-information-open-label

[l-resource-information-destination-quoted-start]: #1060-resource-information-destination-quoted-start-label

[l-resource-information-destination-quoted-open]: #1061-resource-information-destination-quoted-open-label

[l-resource-information-destination-quoted-close]: #1062-resource-information-destination-quoted-close-label

[l-resource-information-destination-quoted-end]: #1063-resource-information-destination-quoted-end-label

[l-resource-information-destination-unquoted-start]: #1064-resource-information-destination-unquoted-start-label

[l-resource-information-destination-unquoted-open]: #1065-resource-information-destination-unquoted-open-label

[l-resource-information-destination-unquoted-close]: #1066-resource-information-destination-unquoted-close-label

[l-resource-information-destination-unquoted-end]: #1067-resource-information-destination-unquoted-end-label

[l-resource-information-title-start]: #1068-resource-information-title-start-label

[l-resource-information-title-open]: #1069-resource-information-title-open-label

[l-resource-information-title-close]: #1070-resource-information-title-close-label

[l-resource-information-title-end]: #1071-resource-information-title-end-label

[l-resource-information-close]: #1072-resource-information-close-label

[l-resource-information-end]: #1073-resource-information-end-label

[l-reference-label-start]: #1074-reference-label-start-label

[l-reference-label-open]: #1075-reference-label-open-label

[l-reference-label-collapsed-close]: #1076-reference-label-collapsed-close-label

[l-reference-label-full-close]: #1077-reference-label-full-close-label

[l-reference-label-end]: #1078-reference-label-end-label

[l-code-start]: #1079-code-start-label

[l-code-fence-start]: #1080-code-fence-start-label

[l-code-fence-end]: #1081-code-fence-end-label

[l-code-end]: #1082-code-end-label

[t-whitespace]: #111-whitespace-token

[t-line-terminator]: #112-line-terminator-token

[t-end-of-file]: #113-end-of-file-token

[t-end-of-line]: #114-end-of-line-token

[t-marker]: #115-marker-token

[t-sequence]: #116-sequence-token

[t-content]: #117-content-token
