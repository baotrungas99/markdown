import { Component, OnDestroy, ViewChild, ElementRef, Output, HostListener, computed} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor/editor.component'; // Import EditorComponent
import { PreviewComponent } from './preview/preview.component'; // Import PreviewComponent
import { MatToolbarModule } from '@angular/material/toolbar'; // Import MatToolbarModule
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule (nếu sử dụng mat-icon)
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule (nếu sử dụng mat-button)
import { FormsModule } from '@angular/forms';
// import { NgxEditorModule, Editor } from 'ngx-editor';
import { Editor,mergeAttributes,Extension, Node, InputRule } from '@tiptap/core';
import { SyncScrollDirective } from './sync-scroll.directive';
// import { TiptapEditorDirective,TiptapFloatingMenuDirective } from 'ngx-tiptap';
// import StarterKit from '@tiptap/starter-kit';
// import Quill from 'quill';

@Component({
  selector: 'app-root',
  standalone: true, // Khai báo component là standalone
  imports: [RouterOutlet, CommonModule, EditorComponent, PreviewComponent, MatButtonModule, MatIconModule, MatToolbarModule, FormsModule , SyncScrollDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'markdown';
  mdText: string = '';
  syncScrollEnabled = true;
  isFullScreen = false;

  // wordCount = computed(() => this.mdText.trim().split(/\s+/).filter(word => word).length);
  // charCount = computed(() => this.mdText.length);
  // lineCount = computed(() => this.mdText.split(/\n/).length);
  // paragraphCount = computed(() => this.mdText.split(/\n\s*\n/).filter(p => p).length);

  get wordCount() {
    return this.mdText.trim().split(/\s+/).filter(word => word).length;
  }
  get charCount() {
    return this.mdText.length;
  }
  get lineCount() {
    return this.mdText.split(/\n/).length;
  }
  get paragraphCount() {
    return this.mdText.split(/\n\s*\n/).filter(p => p).length;
  }
  // ngOnInit(){
  //   const scrollPosition = localStorage.getItem('scrollPosition');
  //   if (scrollPosition) {
  //     window.scrollTo(0, Number(scrollPosition));
  //   }
  // }
  toggleSyncScroll() {
    this.syncScrollEnabled = !this.syncScrollEnabled;
    // console.log('Sync Scroll State:', this.syncScrollEnabled);
  }

  ngOnDestroy(): void {
    // this.editor.destroy();
  }
  saveContent() {
    // console.log(this.charCount(),this.wordCount(),this.lineCount(),this.paragraphCount());
    const blob = new Blob([this.mdText], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    // console.log('Full Screen State:', this.isFullScreen);
  }
  
  // @HostListener('window:beforeunload', ['$event'])
  // saveScrollPosition() {
  //   // Lưu vị trí cuộn trước khi reload hoặc chuyển trang
  //   localStorage.setItem('scrollPosition', String(window.scrollY));
  // }
}
