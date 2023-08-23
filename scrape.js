const { chromium } = require('playwright');
const fs = require('fs');


async function getElementXPath(page, elementHandle) {
    return await page.evaluate(el => {
        function getXPath(element) {
            if (element.id !== '') {
                return `//*[@id="${element.id}"]`;
            }
            if (element === document.body) {
                return element.tagName;
            }
            const siblings = element.parentNode.childNodes;
            let count = 0;
            for (let i = 0; i < siblings.length; i++) {
                const sibling = siblings[i];
                if (sibling === element) {
                    return `${getXPath(element.parentNode)}/${element.tagName}[${count + 1}]`;
                }
                if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                    count++;
                }
            }
        }
        return getXPath(el);
    }, elementHandle);
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    // await page.goto('https://example.com/login); // Replace with your target URL
    // // Fill in the login form and submit
    // await page.fill('#usernameOrEmailField', 'your_username_or_email');
    // await page.fill('#passwordField', 'your_password');
    // await page.click('#submitButton');

    // // Wait for successful login, e.g., by waiting for a specific element that appears after login
    // await page.waitForSelector('#elementAfterSuccessfulLogin');
    await page.goto('https://www.google.com/'); // Replace with your target URL
    const elements = await page.$$('*');
    const results = [];
    for (const element of elements) {
        const tagName = await element.evaluate(el => el.tagName);

        // Filter out only user-interactive elements
        if (['BUTTON', 'INPUT', 'A', 'TEXTAREA', 'SELECT'].includes(tagName)) {
            const xpath = await getElementXPath(page, element);

            // Determine the purpose/value of the element
            let elementValue = '';
            if (tagName === 'BUTTON' || tagName === 'A') {
                elementValue = await element.evaluate(el => el.innerText.trim());
            } else if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
                elementValue = await element.evaluate(el => el.value || el.getAttribute('placeholder'));
            } else if (tagName === 'SELECT') {
                elementValue = await element.evaluate(el => {
                    const selectedOption = el.options[el.selectedIndex];
                    return selectedOption ? selectedOption.text : '';
                });
            }

            results.push({ 'Element Type': tagName, 'Purpose/Value': elementValue, 'XPath Locator': xpath });
        }
    }

    console.table(results);
    function toValidPropertyName(name) {
        // Ensure the name starts with a letter and contains only alphanumeric characters
        const validName = "Prop_" + name.replace(/[^a-zA-Z0-9]/g, "_");
        return validName;
    }

// Initialize classContent with import and the start of class declaration
let classContent = `
import { Page } from 'playwright';

export class PageObject {
    private readonly page: Page;
`;

const usedNames = new Set();
const uniqueElementTypes = new Set(); // To store unique element types
const propertyInitializations = [];  // Array to store initialization logic for properties

for (const result of results) {
    let elementType;
    switch (result['Element Type']) {
        case 'BUTTON':
            elementType = 'Button';
            break;
        case 'INPUT':
            elementType = 'Input';
            break;
        case 'A':
            elementType = 'Link';
            break;
        case 'TEXTAREA':
            elementType = 'TextArea';
            break;
        case 'SELECT':
            elementType = 'Dropdown';
            break;
        default:
            elementType = 'Element';
            break;
    }
    uniqueElementTypes.add(elementType);

    let proposedName = result['Purpose/Value'] ? result['Purpose/Value'].replace(/\s+/g, '') : elementType;
    const baseName = toValidPropertyName(proposedName);
    let uniqueName = baseName;

    let counter = 1;
    while (usedNames.has(uniqueName)) {
        uniqueName = `${baseName}_${counter}`;
        counter++;
    }
    usedNames.add(uniqueName);

    // Store the initialization logic in the array
    propertyInitializations.push(`this.${uniqueName} = this.page.locator('${result['XPath Locator']}');`);

    // Add a declaration for the property without initialization
    classContent += `
    public readonly ${uniqueName}: ${elementType};
    `;
}

// Generate dummy type definitions AFTER processing all results, outside the loop
for (const elementType of uniqueElementTypes) {
    classContent = `type ${elementType} = any;\n` + classContent; // Prepend the types to the beginning
}

// Add the property initializations to the constructor
classContent += `
    constructor(page: Page) {
        this.page = page;
        ${propertyInitializations.join('\n        ')}
    }
`;

// Close the PageObject class declaration
classContent += `
}
`;

fs.writeFileSync('PageObject.ts', classContent);
await browser.close();

})();
