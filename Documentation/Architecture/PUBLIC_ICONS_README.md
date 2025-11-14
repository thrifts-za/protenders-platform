# Icons Directory

This directory should contain the following icon files for SEO and PWA support:

## Required Files

1. **favicon.ico** - Main favicon (16x16, 32x32, 48x48)
2. **favicon-16x16.png** - 16x16 PNG favicon
3. **favicon-32x32.png** - 32x32 PNG favicon
4. **apple-touch-icon.png** - 180x180 PNG for iOS devices
5. **safari-pinned-tab.svg** - SVG icon for Safari pinned tabs

## Icon Generation

You can generate these icons from your main logo using tools like:
- [Favicon Generator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)
- [IconKitchen](https://icon.kitchen/)

## Image Requirements

- **OG Image**: `/public/images/og-image.png` (1200x630px) - For social media sharing
- **Logo**: `/public/images/logo.png` (200x50px) - Main logo

## Next Steps

1. Create or obtain your ProTenders logo
2. Generate all icon sizes using one of the tools above
3. Place generated files in this directory
4. Update the metadata in `src/app/layout.tsx` if needed

**Note**: These files are referenced in the root layout metadata but need to be created/added from your design assets.