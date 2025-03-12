import { Bold } from '@tiptap/extension-bold'
import { Strike } from '@tiptap/extension-strike'
import { Code } from '@tiptap/extension-code'
import { Highlight } from '@tiptap/extension-highlight'
import { Italic } from '@tiptap/extension-italic'
import { Heading } from '@tiptap/extension-heading'
import { textblockTypeInputRule } from '@tiptap/core'
import { Blockquote } from '@tiptap/extension-blockquote'
import { mergeAttributes, PasteRule } from '@tiptap/core'

export const QuotePreserve = Blockquote.extend({
  renderHTML({ HTMLAttributes }) {
    return ['blockquote', mergeAttributes(HTMLAttributes, { 'data-prefix': '>' }), 0]
  },
})
export const ItalicPreserve = Italic.extend({
  renderHTML({ HTMLAttributes }) {
    return ['em', mergeAttributes(HTMLAttributes, { 'data-prefix': '*', 'data-suffix': '*' }), 0]
  },
})
export const BoldPreserve = Bold.extend({
  renderHTML({ HTMLAttributes }) {
    return ['strong', mergeAttributes(HTMLAttributes, { 'data-prefix': '**', 'data-suffix': '**' }), 0]
  },
});


export const StrikePreserve = Strike.extend({
  renderHTML({ HTMLAttributes }) {
    return ['s', mergeAttributes(HTMLAttributes, { 'data-prefix': '~~', 'data-suffix': '~~' }), 0]
  },
});

export const CodePreserve = Code.extend({
  renderHTML({ HTMLAttributes }) {
    return ['code', mergeAttributes(HTMLAttributes, { 'data-prefix': '`', 'data-suffix': '`' }), 0]
  },
});

export const HighlightPreserve = Highlight.extend({
  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(HTMLAttributes, { 'data-prefix': '==', 'data-suffix': '==' }), 0]
  },
});


export const Headingreserve = Heading.extend({
  name: 'Headingreserve',

  renderHTML({ node, HTMLAttributes }) {
    const level = this.options.levels.includes(node.attrs['level'])
      ? node.attrs['level']
      : this.options.levels[0]

    return [`h${level}`, mergeAttributes(HTMLAttributes, {
      'data-prefix': '#'.repeat(level) + ' ',
    }), 0]
  },

  addInputRules() {
    return this.options.levels.map(level => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{${level}})\\s(.*)`), // Giữ dấu #
        type: this.type,
        getAttributes: (match) => ({
          level: match[1].length, // Xác định số # từ đầu vào
        }),
      })
    })
  },

  addPasteRules() {
    return [
      new PasteRule({
        find: /^(#{1,6})\s(.+)/gm,
        handler: ({ state, range, match }) => {
          const level = match[1].length
          const { tr } = state
          
          tr.replaceWith(range.from, range.to, this.type.create({ level }, state.schema.text(match[2])))
        },
      }),
    ]
  },

  parseMarkdown: {
    match: ({ type }: { type: string }) => type === 'heading',
    runner: (state : any, node : any, type: any) => {
      state.openNode(type, { level: node.depth })
      state.next(node.children)
      state.closeNode()
    },
    },

    toMarkdown: {
    match: (node: { type: { name: string } }) => node.type.name === 'markdownHeading',
    runner: (state: any, node: any) => {
      state.write('#'.repeat(node.attrs.level) + ' ')
      state.next(node)
      state.closeBlock(node)
    },
  },
});