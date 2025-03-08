// markdown-preserve.ts
import { Node, mergeAttributes, InputRule } from "@tiptap/core";
import { Transaction, EditorState, TextSelection } from "prosemirror-state";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    markdownPreserve: {
      setMarkdownPreserve: () => ReturnType;
    };
  }
}

const MarkdownPreserve = Node.create({
  name: "markdownPreserve",
  group: "block",
  content: "inline*", // Important change: Use inline* instead of text*
  defining: true,

  parseHTML() {
    return [
      {
        tag: "h1",
        getAttrs: (node) => ({ level: 1, prefix: "# " }),
      },
      {
        tag: "h2",
        getAttrs: (node) => ({ level: 2, prefix: "## " }),
      },
      {
        tag: "h3",
        getAttrs: (node) => ({ level: 3, prefix: "### " }),
      },
      { tag: "blockquote", getAttrs: () => ({ prefix: "> " }) },
      { tag: "pre",  }, // Keep <pre> for code blocks, but handle differently
      { tag: "strong", getAttrs: () => ({ prefix: "**", suffix: "**"}) }, // Use strong for bold
      { tag: "em", getAttrs: () => ({prefix: "*", suffix: "*"}) },   // Use em for italic
      { tag: "code", getAttrs: () => ({prefix: "`", suffix: "`"}) },
      { tag: "p" },
    ];
  },


  renderHTML({ HTMLAttributes, node }) {
      const { prefix = '', suffix = ''} = HTMLAttributes;
      const level = HTMLAttributes['level'] || null;

      if (level) {
          return [`h${level}`, mergeAttributes(HTMLAttributes, {'data-prefix': "#".repeat(level) + " "}), 0];
      }
      if (HTMLAttributes['prefix'] === "> ") {
          return ["blockquote", mergeAttributes(HTMLAttributes, {'data-prefix': '> '}), 0];
      }
      if (HTMLAttributes['prefix'] === "**" && HTMLAttributes['suffix'] === "**") {
          return ["strong", mergeAttributes(HTMLAttributes), 0];
      }

      if (HTMLAttributes['prefix'] === "*" && HTMLAttributes['suffix'] === "*") {
          return ["em", mergeAttributes(HTMLAttributes), 0];
      }

      if(HTMLAttributes['prefix'] === "`" && HTMLAttributes['suffix'] === "`"){
          return ["code", mergeAttributes(HTMLAttributes), 0]
      }

      return ["p", mergeAttributes(HTMLAttributes), 0];
  },


  addAttributes() {
    return {
      level: {
        default: null,
      },
      prefix: {
        default: null,
      },
      suffix: {
          default: null,
      }
    };
  },


  addInputRules() {
    return [
      // Heading 1
      new InputRule({
        find: /^(#\s)(.*)$/m,  // Added 'm' flag (multiline)
        handler: ({ state, match, range }) => {
          const { tr } = state;
          const startOfLine = range.from;  // Capture start of line position
          const endOfLine = range.to;       // Capture end of the line position
          if(match[2].length > 0) {
              tr.replaceWith(startOfLine, endOfLine, this.type.create({ level: 1, prefix: "# " }, state.schema.text(match[2])));
              tr.setSelection(TextSelection.near(tr.doc.resolve(startOfLine + 3))); // +3 to move after "# "
          }
        },
      }),
      // Heading 2
      new InputRule({
          find: /^(##\s)(.*)$/m, // Added 'm' flag (multiline)
          handler: ({state, match, range}) => {
            const { tr } = state;
            const startOfLine = range.from;
            const endOfLine = range.to;
              if(match[2].length > 0) {
                tr.replaceWith(startOfLine, endOfLine, this.type.create({ level: 2, prefix: "## " }, state.schema.text(match[2])));
                tr.setSelection(TextSelection.near(tr.doc.resolve(startOfLine + 4))); // +4 after "## "
              }
          }
      }),
       // Heading 3
       new InputRule({
        find: /^(###\s)(.*)$/m,  // Added 'm' flag (multiline)
        handler: ({state, match, range}) => {
            const { tr } = state;
            const startOfLine = range.from;
            const endOfLine = range.to;
            if(match[2].length > 0){
              tr.replaceWith(startOfLine, endOfLine, this.type.create({ level: 3, prefix: "### " }, state.schema.text(match[2])));
              tr.setSelection(TextSelection.near(tr.doc.resolve(startOfLine + 5))); // +5 after "### "
            }
        }
    }),

      // Blockquote
        new InputRule({
            find: /^(>\s)(.*)$/m, // Added 'm' flag
            handler: ({ state, match, range }) => {
                const { tr } = state;
                const startOfLine = range.from;
                const endOfLine = range.to;
                if(match[2].length > 0) {
                    tr.replaceWith(startOfLine, endOfLine, this.type.create({ prefix: "> " }, state.schema.text(match[2])));
                    tr.setSelection(TextSelection.near(tr.doc.resolve(startOfLine + 3))); // +3
                }

            }
        }),
      // Bold
      new InputRule({
        find: /(\*\*)((?:[^*]+))(\*\*)$/, // No 'm' flag needed here
        handler: ({ state, match, range }) => {
          const { tr } = state;
          const startOfMatch = range.from;
          const endOfMatch = range.to;
          if(match[2].length > 0){
            tr.replaceWith(startOfMatch, endOfMatch, this.type.create({ prefix: "**", suffix: "**" }, state.schema.text(match[2])));
            tr.setSelection(TextSelection.near(tr.doc.resolve(startOfMatch + match[2].length + 2))); // cursor inside the ** **
          }

        },
      }),

      // Italic
        new InputRule({
            find: /(\*)((?:[^*]+))(\*)$/, // No 'm' flag
            handler: ({ state, match, range }) => {
                const {tr} = state;
                const startOfMatch = range.from;
                const endOfMatch = range.to;
              if(match[2].length > 0){
                tr.replaceWith(startOfMatch, endOfMatch, this.type.create({prefix: "*", suffix: "*"}, state.schema.text(match[2])));
                tr.setSelection(TextSelection.near(tr.doc.resolve(startOfMatch + match[2].length + 1))); // cursor inside * *
              }

            }
        }),
        //Code
        new InputRule({
            find: /(`)([^`]+)(`)$/, // No 'm' flag
            handler: ({state, match, range}) => {
                const {tr} = state;
                const startOfMatch = range.from;
                const endOfMatch = range.to;
                if(match[2].length > 0) {
                  tr.replaceWith(startOfMatch, endOfMatch, this.type.create({prefix: "`", suffix: "`"}, state.schema.text(match[2])));
                  tr.setSelection(TextSelection.near(tr.doc.resolve(startOfMatch + match[2].length + 1)));
                }
            }
        })
    ];
  },
});

export default MarkdownPreserve;