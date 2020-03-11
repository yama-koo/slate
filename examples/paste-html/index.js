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
  li: 'list-item',
  ul: 'bulleted-list',
  ol: 'numbered-list',
  blockquote: 'quote',
  pre: 'code',
  h1: 'heading-one',
  h2: 'heading-two',
  h3: 'heading-three',
  h4: 'heading-four',
  h5: 'heading-five',
  h6: 'heading-six',
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
    value: serializer.deserialize('<p></p>'),
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
        // defaultValue={initialValue}
        value={this.state.value}
        schema={this.schema}
        onPaste={this.onPaste}
        renderBlock={this.renderBlock}
        renderInline={this.renderInline}
        renderMark={this.renderMark}
        onChange={({ value }) => {
          // When the document changes, save the serialized HTML to Local Storage.
          if (value.document !== this.state.value.document) {
            const string = serializer.serialize(value)
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

    switch (node.type) {
      case 'paragraph':
        return <p {...attributes}>{children}</p>
      case 'quote':
        return <blockquote {...attributes}>{children}</blockquote>
      case 'code':
        return (
          <pre>
            <code {...attributes}>{children}</code>
          </pre>
        )
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>
      case 'heading-four':
        return <h4 {...attributes}>{children}</h4>
      case 'heading-five':
        return <h5 {...attributes}>{children}</h5>
      case 'heading-six':
        return <h6 {...attributes}>{children}</h6>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'numbered-list':
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
