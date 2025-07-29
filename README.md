# MCP Chat Interface Experiment

A clone of the Signal homepage interface, mimicking the Signal application UI with a simulated order modification experience via a natual language chat interface.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jonathanmelville/sig-clone.git
cd sig-clone
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up custom fonts** (Optional)
```bash
# Copy your Apercu font files to public/fonts/
# Then run the setup script:
./setup-fonts.sh
```

4. **Start the development server**
```bash
npm start
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.js          # Left navigation sidebar
│   ├── Sidebar.css
│   ├── Header.js           # Top header with title
│   ├── Header.css
│   ├── ActionCards.js      # Action buttons section
│   ├── ActionCards.css
│   ├── Overview.js         # Orders and transfers overview
│   ├── Overview.css
│   ├── Icon.js             # Reusable icon component
│   └── Icon.css
├── App.js                  # Main application component
├── App.css                 # Main layout styles
├── fonts.css               # Custom font declarations
├── index.js                # Application entry point
└── index.css               # Global styles
```

## 🔧 Font Setup

### Required Apercu Font Files
- `apercu_regular_pro.woff`
- `apercu_medium_pro.woff`
- `apercu_bold_pro.woff`

### Optional Italic Variants
- `apercu_regular_italic_pro.woff`
- `apercu_medium_italic_pro.woff`
- `apercu_bold_italic_pro.woff`

### Setup Instructions
1. Copy font files to `public/fonts/`
2. Run `./setup-fonts.sh` to activate fonts
3. Restart development server

## 📄 License

UNLICENSED
