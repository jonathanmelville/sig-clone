# Signal Dashboard

A modern React dashboard interface that recreates the Signal application UI with custom Apercu typography and interactive components.

## 🎯 Features

- **Modern Design**: Clean, minimalist interface with proper spacing and typography
- **Custom Typography**: Apercu font family with multiple weights (Regular, Medium, Bold)
- **Interactive Components**: Hover effects and clickable elements
- **Responsive Layout**: Flexbox-based responsive design
- **Sidebar Navigation**: Vertical navigation with active states and notifications
- **Action Cards**: Prominent call-to-action buttons for key functions
- **Overview Section**: Real-time data display for orders and transfers
- **Status Indicators**: Color-coded status tags for different states
- **Custom Icon System**: Flexible icon component with border support

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd signal-dashboard
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

## 🎨 Design System

### Colors
- **Primary Text**: `rgb(55, 66, 74)`
- **Accent Color**: `#dc2626` (Red)
- **Background**: `#f5f5f5` (Light Gray)
- **Status Tags**: 
  - Acknowledged: Blue (`#1e40af`)
  - Action Required: Orange (`#d97706`)

### Typography
- **Font Family**: Apercu (with system font fallbacks)
- **Weights**: Regular (400), Medium (500), Bold (700)
- **Sizes**: 14px to 75px depending on hierarchy

### Components
- **Cards**: White background with subtle shadows
- **Buttons**: Red accent color with hover effects
- **Icons**: Lucide React icons with custom styling
- **Navigation**: Active states with red indicators

## 🛠️ Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## 📦 Technologies Used

- **React 18**: Modern React with hooks
- **Lucide React**: Icon library for consistent iconography
- **CSS3**: Custom styling with modern CSS features
- **Flexbox**: Responsive layout system
- **Apercu Font**: Custom typography

## 🎯 Customization

The application is built with modular components, making it easy to:

- **Modify colors and styling** via CSS variables
- **Add new navigation items** in the sidebar
- **Extend the overview sections** with new data
- **Add new action cards** for additional functionality
- **Implement actual functionality** for buttons and links
- **Customize icons** using the flexible Icon component

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

## 📝 Development Notes

- **Icon Component**: Flexible icon wrapper with border support
- **CSS Variables**: Centralized color and font management
- **Responsive Design**: Mobile-friendly layout structure
- **Performance**: Optimized font loading with `font-display: swap`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 