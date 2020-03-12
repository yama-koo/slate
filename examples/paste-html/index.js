import Html from 'slate-html-serializer'
import { Editor, getEventTransfer } from 'slate-react'
import { Value } from 'slate'

import React from 'react'
import initialValueAsJson from './value.json'
import { css } from 'emotion'

/**
 * Deserialize the initial editor value.
 *
 * @type {Object}
 */

const initialValue = Value.fromJSON(initialValueAsJson)

/**
 * Tags to blocks.
 *
 * @type {Object}
 */

const BLOCK_TAGS = {
  p: 'paragraph',
  li: 'list_item',
  // ul: 'bulleted-list',
  ul: 'ul_list',
  // ol: 'numbered-list',
  ol: 'ol_list',
  blockquote: 'quote',
  pre: 'code',
  h1: 'heading_one',
  h2: 'heading_two',
  h3: 'heading_three',
  h4: 'heading_four',
  h5: 'heading_five',
  h6: 'heading_six',
}

/**
 * Tags to marks.
 *
 * @type {Object}
 */

const MARK_TAGS = {
  strong: 'bold',
  em: 'italic',
  u: 'underline',
  s: 'strikethrough',
  code: 'code',
}

/**
 * Serializer rules.
 *
 * @type {Array}
 */

const RULES = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS[el.tagName.toLowerCase()]

      if (block) {
        return {
          object: 'block',
          type: block,
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if (obj.object === 'block') {
        console.log(obj.type)

        switch (obj.type) {
          case BLOCK_TAGS.p:
            return <p className={obj.data.get('className')}>{children}</p>
          case BLOCK_TAGS.li:
            return <li>{children}</li>
          case BLOCK_TAGS.ul:
            return <ul className={obj.data.get('className')}>{children}</ul>
          case BLOCK_TAGS.ol:
            return <ol className={obj.data.get('className')}>{children}</ol>
          case BLOCK_TAGS.blockquote:
            return <blockquote>{children}</blockquote>
          case BLOCK_TAGS.pre:
            return (
              <pre>
                <code>{children}</code>
              </pre>
            )
          case BLOCK_TAGS.h1:
            return <h1 className={obj.data.get('className')}>{children}</h1>
          case BLOCK_TAGS.h2:
            return <h2 className={obj.data.get('className')}>{children}</h2>
          case BLOCK_TAGS.h3:
            return <h3 className={obj.data.get('className')}>{children}</h3>
          case BLOCK_TAGS.h4:
            return <h4 className={obj.data.get('className')}>{children}</h4>
          case BLOCK_TAGS.h5:
            return <h5 className={obj.data.get('className')}>{children}</h5>
          case BLOCK_TAGS.h6:
            return <h6 className={obj.data.get('className')}>{children}</h6>
          // case 'img':
          //   return <img></img>
        }
      }
    },
  },
  {
    deserialize(el, next) {
      const mark = MARK_TAGS[el.tagName.toLowerCase()]

      if (mark) {
        return {
          object: 'mark',
          type: mark,
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case MARK_TAGS.strong:
            return <strong>{children}</strong>
          case MARK_TAGS.em:
            return <em>{children}</em>
          case MARK_TAGS.u:
            return <u>{children}</u>
          case MARK_TAGS.s:
            return <s>{children}</s>
        }
      }
    },
  },
  {
    // Special case for code blocks, which need to grab the nested childNodes.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === 'pre') {
        const code = el.childNodes[0]
        const childNodes =
          code && code.tagName.toLowerCase() === 'code'
            ? code.childNodes
            : el.childNodes

        return {
          object: 'block',
          type: 'code',
          nodes: next(childNodes),
        }
      }
    },
  },
  {
    // Special case for images, to grab their src.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === 'img') {
        return {
          object: 'block',
          type: 'image',
          nodes: next(el.childNodes),
          data: {
            src: el.getAttribute('src'),
          },
        }
      }
    },
    // serialize(obj, children) {
    // },
  },
  {
    // Special case for links, to grab their href.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === 'a') {
        return {
          object: 'inline',
          type: 'link',
          nodes: next(el.childNodes),
          data: {
            href: el.getAttribute('href'),
          },
        }
      }
    },
  },
]

/**
 * Create a new HTML serializer with `RULES`.
 *
 * @type {Html}
 */

const serializer = new Html({ rules: RULES })

/**
 * The pasting html example.
 *
 * @type {Component}
 */

class PasteHtml extends React.Component {
  /**
   * The editor's schema.
   *
   * @type {Object}
   */

  schema = {
    blocks: {
      image: {
        isVoid: true,
      },
    },
  }

  state = {
    // value: serializer.deserialize('<p>hogehoge</p>'),
    value: Value.fromJSON({
      object: 'value',
      document: {
        object: 'document',
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            nodes: [
              {
                object: 'text',
                text: 'てすと',
                marks: [],
              },
              {
                object: 'text',
                text: 'ほげ_ほげ_',
                marks: [
                  {
                    object: 'mark',
                    type: 'bold',
                    data: {},
                  },
                ],
              },
              {
                object: 'text',
                text: '_ふが_ぴよ',
                marks: [],
              },
            ],
            data: {},
          },
          {
            object: 'block',
            data: {
              tight: 'true',
            },
            type: 'ul_list',
            nodes: [
              {
                object: 'block',
                type: 'list_item',
                data: {},
                nodes: [
                  {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                      {
                        object: 'text',
                        text: 'aaa',
                        marks: [],
                      },
                    ],
                    data: {},
                  },
                ],
              },
              {
                object: 'block',
                type: 'list_item',
                data: {},
                nodes: [
                  {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                      {
                        object: 'text',
                        text: 'bbb',
                        marks: [],
                      },
                    ],
                    data: {},
                  },
                ],
              },
              {
                object: 'block',
                type: 'list_item',
                data: {},
                nodes: [
                  {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                      {
                        object: 'text',
                        text: 'ccc',
                        marks: [],
                      },
                    ],
                    data: {},
                  },
                ],
              },
            ],
          },
          {
            object: 'block',
            data: {
              tight: 'true',
              start: '1',
              delimiter: 'period',
            },
            type: 'ol_list',
            nodes: [
              {
                object: 'block',
                type: 'list_item',
                data: {},
                nodes: [
                  {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                      {
                        object: 'text',
                        text: 'ddd',
                        marks: [],
                      },
                    ],
                    data: {},
                  },
                ],
              },
              {
                object: 'block',
                type: 'list_item',
                data: {},
                nodes: [
                  {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                      {
                        object: 'text',
                        text: 'eee',
                        marks: [],
                      },
                    ],
                    data: {},
                  },
                ],
              },
              {
                object: 'block',
                type: 'list_item',
                data: {},
                nodes: [
                  {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                      {
                        object: 'text',
                        text: 'fff',
                        marks: [],
                      },
                    ],
                    data: {},
                  },
                  {
                    object: 'block',
                    data: {
                      tight: 'true',
                      start: '1',
                      delimiter: 'period',
                    },
                    type: 'ol_list',
                    nodes: [
                      {
                        object: 'block',
                        type: 'list_item',
                        data: {},
                        nodes: [
                          {
                            object: 'block',
                            type: 'paragraph',
                            nodes: [
                              {
                                object: 'text',
                                text: 'hoge**',
                                marks: [],
                              },
                              {
                                object: 'text',
                                text: 'hoge',
                                marks: [
                                  {
                                    object: 'mark',
                                    type: 'italic',
                                    data: {},
                                  },
                                ],
                              },
                              {
                                object: 'text',
                                text: '**_ fuga_ piyo',
                                marks: [],
                              },
                            ],
                            data: {},
                          },
                        ],
                      },
                      {
                        object: 'block',
                        type: 'list_item',
                        data: {},
                        nodes: [
                          {
                            object: 'block',
                            type: 'paragraph',
                            nodes: [
                              {
                                object: 'text',
                                text: 'hhh',
                                marks: [],
                              },
                            ],
                            data: {},
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        data: {},
      },
    }),
  }

  /**
   * Render.
   *
   * @return {Component}
   */

  render() {
    return (
      <Editor
        placeholder="Paste in some HTML..."
        defaultValue={this.state.value}
        // value={this.state.value}
        schema={this.schema}
        onPaste={this.onPaste}
        renderBlock={this.renderBlock}
        renderInline={this.renderInline}
        renderMark={this.renderMark}
        onChange={({ value }) => {
          // console.log(value.document.toJS())
          // console.log(this.state.value.document.toJS())

          // When the document changes, save the serialized HTML to Local Storage.
          if (value.document !== this.state.value.document) {
            console.log('save')
            const string = serializer.serialize(value)
            console.log(string)
            localStorage.setItem('content', string)
          }

          this.setState({ value })
        }}
      />
    )
  }

  /**
   * Render a Slate block.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderBlock = (props, editor, next) => {
    const { attributes, children, node, isFocused } = props
    // console.log(node.type)

    switch (node.type) {
      case BLOCK_TAGS.p:
        return <p {...attributes}>{children}</p>
      case BLOCK_TAGS.blockquote:
        return <blockquote {...attributes}>{children}</blockquote>
      case BLOCK_TAGS.pre:
        return (
          <pre>
            <code {...attributes}>{children}</code>
          </pre>
        )
      case BLOCK_TAGS.ul: {
        console.log(BLOCK_TAGS.ul)
        return <ul {...attributes}>{children}</ul>
      }
      case BLOCK_TAGS.h1:
        return <h1 {...attributes}>{children}</h1>
      case BLOCK_TAGS.h2:
        return <h2 {...attributes}>{children}</h2>
      case BLOCK_TAGS.h3:
        return <h3 {...attributes}>{children}</h3>
      case BLOCK_TAGS.h4:
        return <h4 {...attributes}>{children}</h4>
      case BLOCK_TAGS.h5:
        return <h5 {...attributes}>{children}</h5>
      case BLOCK_TAGS.h6:
        return <h6 {...attributes}>{children}</h6>
      case BLOCK_TAGS.li:
        return <li {...attributes}>{children}</li>
      case BLOCK_TAGS.ol:
        return <ol {...attributes}>{children}</ol>
      case 'image':
        const src = node.data.get('src')
        return (
          <img
            {...attributes}
            src={src}
            className={css`
              display: block;
              max-width: 100%;
              max-height: 20em;
              box-shadow: ${isFocused ? '0 0 0 2px blue;' : 'none'};
            `}
          />
        )
      default:
        return next()
    }
  }

  /**
   * Render a Slate inline.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderInline = (props, editor, next) => {
    const { attributes, children, node } = props

    switch (node.type) {
      case 'link':
        const { data } = node
        const href = data.get('href')
        return (
          <a href={href} {...attributes}>
            {children}
          </a>
        )
      default:
        return next()
    }
  }

  /**
   * Render a Slate mark.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props

    switch (mark.type) {
      case MARK_TAGS.strong:
        return <strong {...attributes}>{children}</strong>
      case MARK_TAGS.code:
        return <code {...attributes}>{children}</code>
      case MARK_TAGS.em:
        return <em {...attributes}>{children}</em>
      case MARK_TAGS.u:
        return <u {...attributes}>{children}</u>
      default:
        return next()
    }
  }

  /**
   * On paste, deserialize the HTML and then insert the fragment.
   *
   * @param {Event} event
   * @param {Editor} editor
   */

  onPaste = (event, editor, next) => {
    event.preventDefault()
    const transfer = getEventTransfer(event)
    if (transfer.type !== 'html' && transfer.type !== 'fragment') return next()
    const { document } = serializer.deserialize(transfer.html)
    editor.insertFragment(document)
  }
}

/**
 * Export.
 */

export default PasteHtml
