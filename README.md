# Claude on Chrome

A powerful Chrome extension that integrates Anthropic's Claude AI directly into your browsing experience. Analyze text selections or entire web pages with customizable prompts, track token usage costs, and get instant AI-powered insights without leaving your browser.

[Demo Video](https://youtu.be/vb2UpbOv3KI)

## Features

- **Text Analysis**: Analyze highlighted text or full web pages with Claude AI
- **Multiple Models**: Choose between Claude 3 Opus, Sonnet, Haiku, or other available models
- **Customizable Prompts**: Use pre-configured prompt templates or create your own custom prompts
- **Token Usage Tracking**: Monitor your API usage with detailed cost estimation
- **Context Menu Integration**: Right-click access for seamless analysis 
- **Response Caching**: Save on API costs with local response caching

## Quick Start

1. **Install the extension**:
   - Clone the repository and run `npm install` followed by `npm run build`
   - Load the extension in Chrome via `chrome://extensions/` in developer mode
   - Select the `dist` directory when prompted to load unpacked

2. **Set up your API key**:
   - Get your Claude API key from [Anthropic Console](https://console.anthropic.com/)
   - Add credits to your account and click the "Set up your organization" button, failure to do so will lead to CORS errors.
   - Enter your API key when first opening the extension
   
3. **Start analyzing content**:
   - Highlight text on any webpage and right-click → "Analyze with Claude"
   - Or right-click anywhere and select "Analyze Page with Claude"
   - View Claude's response in the popup with token usage and cost estimates

## Security & Data Usage

### API Key Security
- Your Anthropic API key is stored securely using Chrome's built-in `chrome.storage.sync` encrypted storage
- The key is never exposed to websites you visit and is only used for authenticated requests to Anthropic's API
- It is recommended to rotate your API key periodically as a security best practice
- If you suspect your key has been compromised, immediately regenerate it in the Anthropic Console

### Data Privacy
- Text analysis happens through direct communication with Anthropic's API servers
- Your selected text or page content is sent to Anthropic for processing
- Analysis results are cached locally in your browser to reduce API calls and costs
- No user data is collected by the extension developers
- Usage statistics are stored only on your local device for your reference

### Local Storage
- The extension stores configuration and cached responses in your browser's local storage
- Cached responses are automatically cleared after 7 days
- Usage tracking information stays on your device and is not transmitted anywhere

## Usage Guide

### Core Features

- **Text Selection Analysis**: Highlight text → Right-click → "Analyze with Claude"
- **Page Analysis**: Right-click anywhere (without highlighting) → "Analyze Page with Claude"
- **TLDR Mode**: Quick summaries of content with the TLDR template
- **Detailed Analysis**: In-depth insights with the Analyze template
- **Custom Prompts**: Create specialized instructions for specific needs

### Settings
Access settings via the gear icon in the bottom navigation:
- Change models (Opus, Sonnet, Haiku)
- Select response style (Default, Creative, Precise)
- Choose or create custom prompt templates
- Update your API key

### Usage Tracking
Track token consumption and costs through the chart icon:
- View total requests, tokens used, and costs
- See breakdown by model and date
- Toggle between weekly, monthly, or all-time views

## Development

### Project Structure
```
claude-on-chrome/
├── src/                   # Source code
│   ├── components/        # React components
│   ├── services/          # API and utility services
│   ├── hooks/             # React hooks
│   ├── types/             # TypeScript type definitions
│   ├── background.ts      # Extension background script
│   └── content.ts         # Content script for page interaction
├── public/                # Static assets
└── ...                    # Configuration files
```


