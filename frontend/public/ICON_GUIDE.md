# Home Screen Icon Setup Guide

## Quick Setup

To add icons for your workout calendar app, you need to create icon files and place them in the `public` folder.

## Required Icon Files

Place these files in the `frontend/public/` directory:

1. **favicon-32x32.png** - 32x32 pixels (browser tab icon)
2. **favicon-16x16.png** - 16x16 pixels (browser tab icon)
3. **apple-touch-icon.png** - 180x180 pixels (iOS home screen)
4. **icon-192.png** - 192x192 pixels (Android home screen)
5. **icon-512.png** - 512x512 pixels (Android home screen, high-res)

## How to Create Icons

### Option 1: Use an Online Icon Generator (Easiest)

1. Go to https://realfavicongenerator.net/ or https://www.favicon-generator.org/
2. Upload a square image (at least 512x512 pixels)
3. Download the generated icons
4. Place them in `frontend/public/` folder

### Option 2: Create Manually

1. Create a square image (512x512 or larger) with your app icon
2. Use an image editor to resize to each size:
   - 32x32, 16x16, 180x180, 192x192, 512x512
3. Save as PNG files with the exact names listed above

### Option 3: Use a Simple Design Tool

You can create a simple icon using:
- Canva (https://canva.com) - Free design tool
- Figma (https://figma.com) - Free design tool
- Or any image editor

## Icon Design Tips

- Use a simple, recognizable design
- Make sure it looks good at small sizes (16x16)
- Use high contrast colors
- Consider using a dumbbell, calendar, or fitness-related symbol
- Match your app's color scheme (#667eea purple gradient)

## Example Icon Ideas

- 💪 Dumbbell icon
- 📅 Calendar icon
- 🏋️ Fitness icon
- Simple "WC" letters
- Fire/flame icon (for streaks)

## Testing

After adding icons:

1. **iOS (iPhone/iPad)**:
   - Open the app in Safari
   - Tap Share button
   - Tap "Add to Home Screen"
   - You should see the icon

2. **Android**:
   - Open the app in Chrome
   - Tap menu (3 dots)
   - Tap "Add to Home screen" or "Install app"
   - You should see the icon

3. **Desktop**:
   - Check the browser tab - you should see the favicon

## Current Status

The HTML and manifest.json are already configured. You just need to add the actual icon image files to the `public` folder.

