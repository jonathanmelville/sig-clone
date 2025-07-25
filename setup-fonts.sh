#!/bin/bash

# Script to set up Apercu fonts
echo "Setting up Apercu fonts..."

# Check if fonts directory exists
if [ ! -d "public/fonts" ]; then
    echo "Creating public/fonts directory..."
    mkdir -p public/fonts
fi

# Check if font files exist
FONT_FILES=(
    "apercu_regular_pro.woff"
    "apercu_medium_pro.woff"
    "apercu_bold_pro.woff"
)

MISSING_FONTS=()

for font in "${FONT_FILES[@]}"; do
    if [ ! -f "public/fonts/$font" ]; then
        MISSING_FONTS+=("$font")
    fi
done

if [ ${#MISSING_FONTS[@]} -eq 0 ]; then
    echo "✅ All font files found!"
    echo "Uncommenting font declarations in src/fonts.css..."
    
    # Uncomment the font declarations
    sed -i '' 's|^/\*$|/*|g' src/fonts.css
    sed -i '' 's|^ \*/$|*/|g' src/fonts.css
    
    echo "✅ Font setup complete! The app should now use Apercu fonts."
    echo "Restart your development server with 'npm start'"
else
    echo "❌ Missing font files:"
    for font in "${MISSING_FONTS[@]}"; do
        echo "   - $font"
    done
    echo ""
    echo "Please copy your Apercu font files to public/fonts/ with these exact names:"
    for font in "${MISSING_FONTS[@]}"; do
        echo "   - $font"
    done
    echo ""
    echo "Then run this script again."
fi 