# Playwright Page Object Model (POM) Generator

A tool that automatically scrapes web pages using Playwright and generates a TypeScript-based Page Object Model (POM) for UI automation.

## Description

This project provides a simple yet powerful way to automatically generate a Page Object Model from a given website. By navigating to a website and analyzing its interactive elements (buttons, links, input fields, etc.), it creates a TypeScript class representing the page's structure. This can be a great starting point for setting up UI automation tests.

## Features

- **Automatic Element Detection**: Automatically detects interactive elements on a web page.
- **XPath Generation**: For each detected element, an XPath locator is generated.
- **TypeScript-Based**: The output is a TypeScript class, ready to be used in Playwright-based testing frameworks.

## Requirements

- Node.js
- Playwright

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ilamvazhuthi/PlaywrightPageObjectGenerator.git
   ```

2. Navigate to the project directory and install the dependencies:
   ```bash
   cd PlaywrightPageObjectGenerator
   npm install
   ```

## Usage

1. Modify the script to navigate to your desired website.
2. Run the script:
   ```bash
   node scrape.js
   ```

3. Once executed, the script will generate a `PageObject.ts` file in the project directory.

## Contributions

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ilamvazhuthi/PlaywrightPageObjectGenerator/issues).

## License

Distributed under the MIT License. See `LICENSE` for more information.

