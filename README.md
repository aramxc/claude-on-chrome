# Claude on Chrome

This Chrome extension allows you to analyze highlighted text or entire web pages using Anthropic's Claude AI. You can configure the model, style, and prompt template to customize the analysis.

## Features

- Analyze highlighted text or full web pages
- Configure API key, model, style, and prompt template
- Display analysis results in a popup
- Context menu integration for easy access

## Installation

1. Clone the repository or download the source code.
2. Open Chrome and go to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click on "Load unpacked" and select the project directory.
5. The extension should now be installed and visible in Chrome.

## Usage

1. Click on the extension icon to open the popup.
2. If it's the first time using the extension, you'll be prompted to enter your Anthropic API key and select the model, style, and prompt template.
3. Once configured, you can analyze text by:
   - Highlighting text on a web page and right-clicking to select "Analyze with Claude" from the context menu.
   - Right-clicking anywhere on a web page (without highlighting) and selecting "Analyze Page with Claude" to analyze the entire page.
4. The analysis results will be displayed in the popup.
5. To change the settings, click on the options cogwheel in the popup to go back to the configuration page.

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