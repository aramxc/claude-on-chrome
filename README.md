# Claude on Chrome

A powerful Chrome extension that integrates Anthropic's Claude AI directly into your browsing experience. Analyze text selections or entire web pages with customizable prompts, track token usage costs, and get instant AI-powered insights without leaving your browser.

## Features

- **Text Analysis**: Analyze highlighted text or full web pages with Claude AI
- **Multiple Models**: Choose between Claude 3 Opus, Sonnet, Haiku, or other available models
- **Customizable Prompts**: Use pre-configured prompt templates or create your own custom prompts
- **Token Usage Tracking**: Monitor your API usage with detailed cost estimation
- **Context Menu Integration**: Right-click access for seamless analysis 
- **Response Caching**: Save on API costs with local response caching

## Security & Data Usage

### API Key Security
- Your Anthropic API key is stored securely using Chrome's built-in `chrome.storage.sync` encrypted storage
- The key is never exposed to websites you visit and is only used for authenticated requests to Anthropic's API
- We recommend rotating your API key periodically as a security best practice
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

### Best Practices
- Only install the extension from trusted sources
- Review the permissions requested during installation
- Keep your Chrome browser and extensions updated
- Consider using a dedicated API key for this extension with appropriate usage limits

## Installation

### From Source (Developer Mode)

1. **Clone the repository**:
   ```
   git clone https://github.com/yourusername/claude-on-chrome.git
   cd claude-on-chrome
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Build the extension**:
   ```
   npm run build
   ```

4. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` directory created by the build process
   - The extension should now appear in your extensions list

### API Key Setup

1. Get your Claude API key from [Anthropic Console](https://console.anthropic.com/)
2. IMPORTANT: You will need to add credits AND set up your organization to use the API key (If you don't do this, you'll run into CORS issues)
3. When you first open the extension, you'll be prompted to enter this key
4. Your key is stored securely in Chrome's extension storage

## Usage Guide

### Initial Setup

1. Click the Claude on Chrome extension icon in your toolbar
2. Enter your Anthropic API key
3. Select your preferred model (Opus for highest quality, Haiku for speed/economy)
4. Choose a default analysis style
5. Select a system prompt template (Summarize is recommended to start)
6. Click "Get Started"

### Analyzing Text

#### Method 1: Using Text Selection
1. Highlight any text on a webpage
2. Right-click and select "Analyze with Claude" from the context menu
3. The extension popup will open with Claude's analysis

#### Method 2: Analyzing a Full Page
1. Right-click anywhere on a webpage (without highlighting text)
2. Select "Analyze Page with Claude" from the context menu
3. The extension will automatically extract the main content from the page
4. View Claude's analysis in the popup

#### Method 3: Direct Extension Use
1. Click the extension icon to open it
2. If you've already highlighted text, it will be automatically analyzed
3. If not, you'll see instructions for selecting content to analyze

### Understanding the Results

The analysis screen shows:
- The input text that was analyzed
- Claude's response (with markdown formatting)
- Model information (which Claude model was used)
- System prompt type (Analyze, Summarize, or Custom)
- Estimated token usage and cost

### Customizing Settings

Access settings by clicking the gear icon in the bottom navigation:

1. **API Key**: Update your Claude API key
2. **Model**: Switch between different Claude models
   - Opus: Highest quality, most expensive
   - Sonnet: Balanced quality and cost
   - Haiku: Fastest and most economical
3. **Style**: Adjust Claude's response style
   - Default: Balanced responses
   - Creative: More inventive and varied responses
   - Precise: More factual and concise responses
4. **System Prompt**: Choose or customize prompt templates
   - Analyze: Detailed analysis of content
   - Summarize: Concise summary of key points
   - Custom: Create your own specialized instruction

### Tracking Usage

The extension includes built-in token usage tracking:

1. Click the chart/graph icon in the bottom navigation
2. View your total requests, token usage, and estimated costs
3. See usage broken down by model and by date
4. Toggle between weekly, monthly, or all-time views

## Development

### Project Structure

## Configuration

- **API Key**: Enter your Anthropic API key to authenticate requests.
- **Model**: Select the Claude model to use for analysis (e.g., claude-3-opus-20240229).
- **Style**: Choose the style of the analysis (default, creative, or precise).
- **Prompt Template**: Select a pre-defined prompt template or customize your own.

## TODO: Publishing

To publish the extension on the Chrome Web Store:

1. Create a developer account on the Chrome Web Store if you haven't already.
2. Prepare the necessary assets (icons, screenshots, description, etc.).
3. Pack the extension by running `npm run build` to generate the production-ready files.
4. Create a new item on the Chrome Web Store developer dashboard.
5. Upload the packed extension (`dist.zip` generated in step 3).
6. Fill in the required information (name, description, icons, screenshots, etc.).
7. Submit the extension for review.
8. Once approved, the extension will be available on the Chrome Web Store.

## Contributing

Feel free to open issues or submit pull requests for improvements, bug fixes, or new features.

## License

This project is licensed under the [MIT License](LICENSE).