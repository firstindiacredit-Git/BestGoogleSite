# Color Replacement Script

This script helps replace hardcoded color values with dynamic Tailwind classes throughout your codebase. It's designed to support the theme customization feature that allows users to change the primary and secondary colors of the application.

## What it does

The script searches for hardcoded color values in your JavaScript, JSX, and CSS files and replaces them with dynamic Tailwind classes or CSS variables:

- Replaces `dark:bg-[#28283a]` with `dark:bg-primary`
- Replaces `dark:bg-[#513a7a]` with `dark:bg-secondary`
- Handles opacity variants like `dark:bg-[#28283a]/[var(--widget-opacity)]`
- Updates CSS properties like `background`, `color`, and `border-color`

## How to use

1. Make sure you have Node.js installed
2. Place the `color-replace.js` file in the root of your project
3. Run the script:

```bash
node color-replace.js
```

4. The script will scan all JS, JSX, and CSS files in your project (excluding node_modules and .git)
5. It will log each replacement it makes and which files were updated

## Benefits

- **Consistency**: Ensures all color references use the same dynamic system
- **Maintainability**: Makes it easier to update the theme system in the future
- **User Experience**: Allows the theme customization to affect all parts of the application

## Important Notes

- The script makes changes directly to your files, so it's recommended to commit your changes before running it
- You may need to manually review some replacements, especially for complex styling patterns
- After running the script, test your application thoroughly to ensure all styles are applied correctly

## Customization

If you need to add more replacement patterns, you can edit the `replacements` array in the script. Each replacement object has a `search` and `replace` property.

## Troubleshooting

If you encounter any issues:

1. Check the console output for error messages
2. Verify that the file paths are correct
3. Make sure the search patterns match the actual code in your files
4. For complex replacements, you might need to manually update some files
