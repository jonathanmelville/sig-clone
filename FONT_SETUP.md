# Apercu Font Setup Guide

## Font Files Needed

Copy your Apercu font files to the `public/fonts/` directory with these exact names:

### Required Files:
- `apercu_regular_pro.woff` - Regular weight (400)
- `apercu_medium_pro.woff` - Medium weight (500)
- `apercu_bold_pro.woff` - Bold weight (700)

### Optional Files (uncomment in fonts.css if you have them):
- `apercu_regular_pro_italic.woff` - Regular italic
- `apercu_bold_pro_italic.woff` - Bold italic

## How to Set Up Your Font Files

### Step 1: Copy Your Font Files
Copy your Apercu font files to `public/fonts/` with these exact names:
- `apercu_regular_pro.woff`
- `apercu_medium_pro.woff`
- `apercu_bold_pro.woff`

### Step 2: Run the Setup Script
```bash
./setup-fonts.sh
```

This script will:
- Check if all font files are present
- Uncomment the font declarations in `src/fonts.css`
- Tell you if any files are missing

### Manual Setup (Alternative)
If you prefer to do it manually:
1. Copy font files to `public/fonts/`
2. Edit `src/fonts.css` and uncomment the font declarations (remove the `/*` and `*/` around the @font-face rules)
3. Restart your development server

## Font Weights Available

The dashboard now uses these Apercu weights:
- **Regular (400)**: Default body text
- **Medium (500)**: Buttons, labels, and medium emphasis
- **Bold (700)**: Headers, numbers, and strong emphasis

## Testing the Font

After copying your font files:
1. Run `npm start`
2. Open http://localhost:3000
3. The dashboard should now use Apercu throughout

## Troubleshooting

If the font doesn't load:
1. Check that file names match exactly (case-sensitive)
2. Verify files are in `public/fonts/` directory
3. Check browser developer tools for font loading errors
4. Ensure font files are valid .woff format 