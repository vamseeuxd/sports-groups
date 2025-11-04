# Copy to Clipboard Directive

A comprehensive Angular directive for copying text to clipboard with modern API support, fallback mechanisms, and enhanced user experience.

## Features

- ✅ Modern Clipboard API with fallback support
- ✅ Custom success/error messages
- ✅ Animated tooltips and visual feedback
- ✅ Copy animation effects
- ✅ Works with any HTML element
- ✅ Programmatic clipboard service
- ✅ Browser compatibility detection

## Installation

The directive is already implemented in the project. Import it where needed:

```typescript
import { CopyToClipboardDirective } from './directives';
```

## Basic Usage

### Simple Text Copy
```html
<button appCopyToClipboard="Text to copy">Copy</button>
```

### Copy Element Content
```html
<div appCopyToClipboard>This text will be copied when clicked</div>
```

### Copy Dynamic Content
```html
<button appCopyToClipboard="{{ dynamicText }}">Copy Dynamic Text</button>
```

## Advanced Usage

### Custom Messages
```html
<button 
  appCopyToClipboard="Text to copy"
  copySuccessMessage="✅ Successfully copied!"
  copyErrorMessage="❌ Copy failed!">
  Copy with Custom Messages
</button>
```

### Disable Tooltip
```html
<button 
  appCopyToClipboard="Text to copy"
  [showTooltip]="false">
  Silent Copy
</button>
```

## Programmatic Usage

Use the `ClipboardService` for programmatic operations:

```typescript
import { ClipboardService } from './services';

export class MyComponent {
  private clipboardService = inject(ClipboardService);

  async copyText(text: string) {
    const success = await this.clipboardService.copyToClipboard(text);
    if (success) {
      console.log('Text copied successfully');
    }
  }

  async readClipboard() {
    const content = await this.clipboardService.readFromClipboard();
    console.log('Clipboard content:', content);
  }

  checkSupport() {
    return this.clipboardService.isClipboardSupported();
  }
}
```

## Sports App Examples

### Tournament Code Copy
```html
<div class="d-flex align-items-center gap-2">
  <code class="bg-light p-2 rounded">{{ tournamentCode }}</code>
  <button 
    class="btn btn-sm btn-outline-primary"
    appCopyToClipboard="{{ tournamentCode }}"
    copySuccessMessage="Tournament code copied!">
    <i class="fas fa-copy"></i>
  </button>
</div>
```

### Player Email Copy
```html
<button 
  class="btn btn-sm btn-outline-success"
  appCopyToClipboard="{{ playerEmail }}"
  copySuccessMessage="Email copied!"
  title="Copy player email">
  <i class="fas fa-envelope"></i>
</button>
```

### Team Invite Link
```html
<div class="input-group">
  <input type="text" class="form-control" [value]="inviteLink" readonly>
  <button 
    class="btn btn-warning"
    appCopyToClipboard="{{ inviteLink }}"
    copySuccessMessage="Invite link copied! Share with your team.">
    <i class="fas fa-share me-1"></i>Share
  </button>
</div>
```

## API Reference

### Directive Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `appCopyToClipboard` | `string` | `''` | Text to copy. If empty, copies element content |
| `copySuccessMessage` | `string` | `'Copied to clipboard!'` | Success message shown in tooltip |
| `copyErrorMessage` | `string` | `'Failed to copy'` | Error message shown in tooltip |
| `showTooltip` | `boolean` | `true` | Whether to show tooltip feedback |

### Service Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `copyToClipboard` | `text: string` | `Promise<boolean>` | Copy text to clipboard |
| `readFromClipboard` | - | `Promise<string \| null>` | Read text from clipboard |
| `isClipboardSupported` | - | `boolean` | Check if clipboard is supported |

## Browser Support

- **Modern browsers**: Uses Clipboard API
- **Older browsers**: Falls back to `document.execCommand`
- **HTTPS required**: Clipboard API requires secure context

## Demo

Visit `/copy-demo` route to see all features in action with interactive examples.

## Implementation Details

### Files Created
- `src/app/directives/copy-to-clipboard.directive.ts` - Main directive
- `src/app/services/clipboard.service.ts` - Programmatic service
- `src/app/pages/copy-demo/` - Demo page with examples

### Integration
- Added to tournament teams component for copying player emails and team names
- Integrated with existing Bootstrap theme styling
- Responsive design with mobile optimizations

## Styling

The directive uses CSS variables from the existing theme:
- `--theme-primary` for success tooltips
- `--theme-accent` for hover effects
- Smooth animations and transitions
- Position-aware tooltip placement