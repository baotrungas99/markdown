import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as katex from 'katex';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';
import * as marked from 'marked';
import { markdownItTable } from 'markdown-it-table';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnChanges, AfterViewInit { 

  @Input() previewText: string = ''; //lấy editor output
  renderedText: string = ''; // Biến lưu html md render
  // mermaidInitialized: boolean = false; 
  private md = new MarkdownIt({ html: true, breaks: true ,linkify: true, });

  @ViewChild('preview') previewElement!: ElementRef;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['previewText']) {
      if (!this.previewText.trim()) { 
        this.renderedText = '';  // Nếu input rỗng, xóa nội dung hiển thị
        return;
      }
      this.renderFullMarkdown();
    }
  }

  ngAfterViewInit(): void {
    console.log(this.previewText);
    mermaid.initialize({ startOnLoad: true });
    this.renderFullMarkdown();
    // this.mermaidInitialized = true;
  }

  renderFullMarkdown() {
    let cleanText = this.previewText.replace(
      /(\|.*\|)\n+(\|[-:| ]+\|)\n+((\|.*\|\n*)+)(?=\n[^|]|\n*$)/gi,
      (match) => {
        return match.replace(/\s*\n\s*/g, '\n').trim();
      }
    ).replace(/\\\[/g, '[').replace(/\\\]/g, ']').replace(/\\\*/g, '*');
    // console.log(cleanText);
    // let html = await marked.parse(cleanText);
    let html = this.md.render(cleanText); // 1. Render Markdown
    // console.log(html);
    html = this.renderKaTeX(html);               // 2. Render KaTeX
    html = this.renderMermaid(html);             // 3. Render Mermaid
    // Loại bỏ thẻ <p> trong <li>
    html = html.replace(/<li>\s*<p>(.*?)<\/p>\s*/g, '<li>$1');
    this.renderedText = DOMPurify.sanitize(html);// 4. Sanitize kết quả cuối
  }
 
  renderKaTeX(html: string): string {
    html = html.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_, equation) => {
      try { //block mode canh giữa (xử lý trong $$...$$)
        let cleanEquation = equation.replace(/<\/?p>/g, ''); // Xóa thẻ <p> chỉ trong KaTeX
        return `<div class="katex-block">${katex.renderToString(cleanEquation.trim(), { throwOnError: false, displayMode: true })}</div>`;
      } catch (error) {
        console.error('KaTeX render error:', error);
        return `<span class="katex-error">$$${equation}$$</span>`;
      }
    });

    html = html.replace(/(?<!\\)\$(.*?)\$/g, (_, equation) => {
      try { //inline mode trên cùng dòng (xử lý trong $...$)
        let cleanEquation = equation.replace(/<\/?p>/g, ''); // Xóa thẻ <p> chỉ trong KaTeX inline
        return `<span class="katex-inline">${katex.renderToString(cleanEquation.trim(), { throwOnError: false, displayMode: false })}</span>`;
      } catch (error) {
        console.error('KaTeX render error:', error);
        return `<span class="katex-error">$${equation}$</span>`;
      }
    });

    return html;
  }

  renderMermaid(html: string): string {
    const regex = /```mermaid\s*([\s\S]*?)```/g;
    let match;
    let mermaidBlocks: { id: string; code: string }[] = [];

    while ((match = regex.exec(html)) !== null) {
      let mermaidCode = match[1].trim().replace(/<\/?p>/g, ''); // Xóa thẻ <p> chỉ trong Mermaid
      const mermaidDivId = 'mermaid-' + Math.random().toString(36).substring(2, 15);
      html = html.replace(match[0], `<div id="${mermaidDivId}" class="mermaid">${mermaidCode}</div>`);
      mermaidBlocks.push({ id: mermaidDivId, code: mermaidCode });
    }

    // Kích hoạt Mermaid sau khi render xong
    setTimeout(() => {
      mermaid.init();
    }, 100);

    return html;
  }
  
}