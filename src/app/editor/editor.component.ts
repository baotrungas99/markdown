import { Component, Output, EventEmitter, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as marked from 'marked';
// import { QuillModule } from 'ngx-quill';
// import { CodemirrorModule } from 'ngx-codemirror';
// import { NgxEditorModule, Editor } from 'ngx-editor';
import { Headingreserve, BoldPreserve, StrikePreserve, ItalicPreserve, CodePreserve, HighlightPreserve ,QuotePreserve} from "../tiptapExtension/TipTapExtension.component";
import DOMPurify from 'dompurify';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { Editor, mergeAttributes, Extension, Node, InputRule } from '@tiptap/core';
import { TextSelection } from "prosemirror-state";
import StarterKit from '@tiptap/starter-kit';
//không dùng StarterKit
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";
import Document from "@tiptap/extension-document";
import { Markdown } from 'tiptap-markdown';
import { Highlight } from '@tiptap/extension-highlight';
import { TiptapEditorDirective } from 'ngx-tiptap';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, LMarkdownEditorModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnDestroy {
  markdownText: string = '';
  editor!: Editor;
  // @Input() editor!: Editor ;
  previewContent: string = '';
  @Output() previewTextChange = new EventEmitter<string>();
  @ViewChild('editorComponent') editorElement!: ElementRef;
  // @ViewChild('editor', { static: true }) editor!: ElementRef<HTMLDivElement>;
  // editor!: Editor;

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Markdown.configure({
          html: true,                  // Allow HTML input/output
          tightLists: true,            // No <p> inside <li> in markdown output
          tightListClass: 'tight',     // Add class to <ul> allowing you to remove <p> margins when tight
          bulletListMarker: '-',       // <li> prefix in markdown output
          linkify: true,              // Create links from "https://..." text
          breaks: true,               // New lines (\n) in markdown input are converted to <br>
          transformPastedText: false,  // Allow to paste markdown text in the editor
          transformCopiedText: false,  // Copied text is transformed to markdown
        }),
        Headingreserve,
        BoldPreserve,
        ItalicPreserve,
        StrikePreserve,
        CodePreserve,
        HighlightPreserve,
        QuotePreserve
      ],

      content: this.markdownText,

    });

    this.editor.on('update', ({ editor }) => {
      this.markdownText = editor.storage['markdown'].getMarkdown();
      this.previewTextChange.emit(this.markdownText);
      // this.updatePreview();
    });
  }

  ngAfterViewInit() {
    const container = this.elRef.nativeElement.querySelector("#editor");
    if (container) {
      container.appendChild(this.editor.view.dom);
    }
    this.editor.commands.focus();
  }

  ngOnDestroy() {
    this.editor.destroy();
  }

  // onInput(event: Event) {
    // this.markdownText = (event.target as HTMLElement).innerText;
    // this.updatePreview();
    // this.markdownText = this.convertMarkdownToHtml(this.markdownText);
  // }

  // async updatePreview() {
  //   // this.markdownText = await marked.parse(this.markdownText);
  //   this.previewTextChange.emit(this.markdownText);
  // }

  // convertMarkdownToHtml(text: string): string {
  //   let html = text;

  //   // Chuyển đổi Markdown thành HTML
  //   html = html.replace(/^# (.*$)/gm, '<h1># $1</h1>');  // Heading 1
  //   html = html.replace(/^## (.*$)/gm, '<h2>## $1</h2>');          // Heading 2
  //   html = html.replace(/^### (.*$)/gm, '<h3>### $1</h3>');         // Heading 3
  //   html = html.replace(/\*\*(.*?)\*\*/gm, '<b>**$1**</b>');        // Bold
  //   html = html.replace(/\*(.*?)\*/gm, '<i>*$1*</i>');           // Italic
  //   html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>'); // Blockquote
  //   html = html.replace(/`([^`]+)`/gm, '<code>$1</code>');
  //        // Inline code
  //   return html;
  // }

  formatText(command: string) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      if (!selectedText) return;

      let formattedText = selectedText;

      if (command === 'bold') {
        if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
          formattedText = selectedText.slice(0, 0);
        } else {
          formattedText = `**${selectedText}**`;
        }
      } else if (command === 'italic') {
        if (selectedText.startsWith('*') && selectedText.endsWith('*')) {
          formattedText = selectedText.slice(0, 0);
        } else {
          formattedText = `${selectedText}`;
        }
      } else if (command === 'underline') {
        if (selectedText.startsWith('<ins>') && selectedText.endsWith('</ins>')) {
          formattedText = selectedText.replace(/^<ins>(.*?)<\/ins>$/, '$1');
        } else {
          formattedText = `<ins>${selectedText}</ins>`;
        }
      }

      range.deleteContents();
      range.insertNode(document.createTextNode(formattedText));

      this.markdownText = (document.querySelector('.editor') as HTMLElement).innerText;
      // this.updatePreview();
      this.previewTextChange.emit(this.markdownText);

    }
  }
}