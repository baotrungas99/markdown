import { Component, OnDestroy, ViewChild, ElementRef, Output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor/editor.component'; // Import EditorComponent
import { PreviewComponent } from './preview/preview.component'; // Import PreviewComponent
import { MatToolbarModule } from '@angular/material/toolbar'; // Import MatToolbarModule
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule (nếu sử dụng mat-icon)
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule (nếu sử dụng mat-button)
import { FormsModule } from '@angular/forms';
import { NgxEditorModule, Editor } from 'ngx-editor';
import { SyncScrollDirective } from './sync-scroll.directive';

// import Quill from 'quill';

@Component({
  selector: 'app-root',
  standalone: true, // Khai báo component là standalone
  imports: [RouterOutlet, CommonModule, EditorComponent, PreviewComponent, MatButtonModule, MatIconModule, MatToolbarModule, FormsModule, NgxEditorModule, SyncScrollDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  title = 'markdown';
  previewText: string = '';
  // quill!: Quill;
  editor = new Editor();
  syncScrollEnabled = true;

  toggleSyncScroll() {
    this.syncScrollEnabled = !this.syncScrollEnabled;
    // console.log('Sync Scroll State:', this.syncScrollEnabled);
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  saveContent() {
    const blob = new Blob([this.previewText], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
