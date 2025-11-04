import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CopyToClipboardDirective } from '../../directives';
import { ClipboardService } from '../../services';

@Component({
  selector: 'app-copy-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, CopyToClipboardDirective],
  templateUrl: './copy-demo.html',
  styleUrls: ['./copy-demo.scss']
})
export class CopyDemo {
  private clipboardService = inject(ClipboardService);
  
  sampleText = 'This is a sample text to copy!';
  customText = 'Custom text from input';
  tournamentCode = 'TOUR-2024-001';
  playerEmail = 'player@example.com';
  teamInviteLink = 'https://sportsgroups.app/join/team/abc123';
  programmaticText = 'Text copied programmatically';
  clipboardContent = '';
  
  codeSnippet = `
import { CopyToClipboardDirective } from './directives';

// Usage in template:
<button appCopyToClipboard="Text to copy">Copy</button>
  `.trim();

  jsonData = {
    tournament: 'Championship 2024',
    teams: ['Team A', 'Team B', 'Team C'],
    startDate: '2024-11-01'
  };

  get jsonString(): string {
    return JSON.stringify(this.jsonData, null, 2);
  }

  async copyProgrammatically(text: string) {
    const success = await this.clipboardService.copyToClipboard(text);
    if (success) {
      alert('✅ Copied programmatically!');
    } else {
      alert('❌ Copy failed!');
    }
  }

  async readFromClipboard() {
    const content = await this.clipboardService.readFromClipboard();
    if (content !== null) {
      this.clipboardContent = content;
    } else {
      alert('❌ Could not read from clipboard');
    }
  }

  get isClipboardSupported(): boolean {
    return this.clipboardService.isClipboardSupported();
  }
}