import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  async copyToClipboard(text: string): Promise<boolean> {
    if (!text) {
      return false;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Use modern Clipboard API
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        return this.fallbackCopyToClipboard(text);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }

  private fallbackCopyToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      document.body.removeChild(textArea);
      return false;
    }
  }

  async readFromClipboard(): Promise<string | null> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return await navigator.clipboard.readText();
      }
      return null;
    } catch (error) {
      console.error('Read from clipboard failed:', error);
      return null;
    }
  }

  isClipboardSupported(): boolean {
    return !!(navigator.clipboard || document.execCommand);
  }
}