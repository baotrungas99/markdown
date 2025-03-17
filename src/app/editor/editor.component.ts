import { Component, Output, EventEmitter, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as marked from 'marked';
// import { QuillModule } from 'ngx-quill';
// import { CodemirrorModule } from 'ngx-codemirror';
// import { NgxEditorModule, Editor } from 'ngx-editor';
import { Headingreserve, BoldPreserve, StrikePreserve, ItalicPreserve, CodePreserve, HighlightPreserve, QuotePreserve } from "../tiptapExtension/TipTapExtension.component";
import DOMPurify from 'dompurify';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { Editor, mergeAttributes, Extension, Node, InputRule } from '@tiptap/core';
import { TextSelection } from "prosemirror-state";
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

//không dùng StarterKit
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";
import Document from "@tiptap/extension-document";
import { Highlight } from '@tiptap/extension-highlight';
import { TiptapEditorDirective } from 'ngx-tiptap';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, LMarkdownEditorModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnDestroy, OnInit {
  inputText: string = '';
  editor!: Editor;
  // @Input() editor!: Editor ;
  // previewContent: string = '';
  @Output() editorOutputText = new EventEmitter<string>();
  // @ViewChild('editorComponent') editorElement!: ElementRef;
  // @ViewChild('editor', { static: true }) editor!: ElementRef<HTMLDivElement>;
  // editor!: Editor;
  constructor(private elRef: ElementRef, private http: HttpClient) { }

  ngOnInit() {
    this.http.get('placehoder.txt', { responseType: 'text' }).subscribe(
      data => {
        this.inputText = data; // Gán dữ liệu sau khi tải xong
        this.initEditor(); // Chỉ khởi tạo Editor khi có dữ liệu
      },
      error => console.error('Không thể tải file:', error)
    );
  }
  
  initEditor() {
    this.editor = new Editor({
      
      extensions: [
        StarterKit.configure({heading: false, blockquote:false}),
        Markdown.configure({
          html: true,
          tightLists: false,
          bulletListMarker: '-',
          linkify: true,
          breaks: true,
          transformCopiedText:false,
          transformPastedText: false,
        }),
        Headingreserve, BoldPreserve, StrikePreserve, ItalicPreserve, CodePreserve, HighlightPreserve, QuotePreserve
      ],
      content: this.inputText,
    });
    this.attachEditorToDOM();
    this.editor.on('update', ({ editor }) => {
      this.inputText = editor.storage['markdown'].getMarkdown();
      this.editorOutputText.emit(this.inputText);
    });
  }
  
  attachEditorToDOM() {
    const container = this.elRef.nativeElement.querySelector("#editor");
    if (container && this.editor) {
      container.appendChild(this.editor.view.dom);
      this.editor.commands.focus();
      this.editorOutputText.emit(this.inputText);
    }
  }

  // ngAfterViewInit() {
  //   const container = this.elRef.nativeElement.querySelector("#editor");
  //   if (container) {
  //     container.appendChild(this.editor.view.dom);
  //   }
  //   this.editor.commands.focus();
  //   this.editorOutputText.emit(this.inputText);
  // }

  ngOnDestroy() {
    this.editor.destroy();
  }

  // onInput(event: Event) {
  // this.inputText = (event.target as HTMLElement).innerText;
  // this.updatePreview();
  // this.inputText = this.convertMarkdownToHtml(this.inputText);
  // }

  // async updatePreview() {
  //   // this.inputText = await marked.parse(this.inputText);
  //   this.editorOutputText.emit(this.inputText);
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
    if (!this.editor) return;

    switch (command) {
      case 'bold':
        this.editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        this.editor.chain().focus().toggleItalic().run();
        break;
      // case 'underline':
      //   this.editor.chain().focus().toggleUnderline().run();
      //   break;
      case 'strike':
        this.editor.chain().focus().toggleStrike().run();
        break;
      case 'code':
        this.editor.chain().focus().toggleCode().run();
        break;
      case 'blockquote':
        this.editor.chain().focus().toggleBlockquote().run();
        break;
    }

    // Cập nhật inputText
    this.inputText = this.editor.storage['markdown'].getMarkdown();
    this.editorOutputText.emit(this.inputText);
  }
}