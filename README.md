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

4. **Initialize data files** (Automatic)
```bash
# Data files are automatically initialized on startup
# Or run manually:
npm run init-data
```

5. **Start the development server**
```bash
npm start
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Local Development
- Uses `orders.json` file for data persistence
- No external dependencies required
- Full functionality for development and testing

### Production (Vercel)
- Uses Edge Config for global data storage
- Automatic environment detection
- See [Edge Config Setup Guide](./EDGE_CONFIG_SETUP.md) for deployment instructions

## 📁 Project Structure

```
signal-dashboard/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── services/           # API services
│   ├── config/             # Configuration files
│   └── App.js              # Main application
├── mcp-server/            # MCP server backend
│   ├── api/               # Serverless functions
│   ├── data/              # Data files
│   └── package.json       # Server dependencies
├── scripts/               # Utility scripts
│   └── init-data.js       # Data initialization
├── public/                # Static assets
└── package.json           # Frontend dependencies
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

- `npm start` - Start both frontend and MCP server
- `npm run start:frontend` - Start only the React frontend
- `npm run start:mcp` - Start only the MCP server
- `npm run build` - Build the React app for production
- `npm run init-data` - Initialize data files from template

## 📦 Technologies Used

- **React 18**: Modern React with hooks
- **Lucide React**: Icon library for consistent iconography
- **CSS3**: Custom styling with modern CSS features
- **Flexbox**: Responsive layout system
- **Apercu Font**: Custom typography
- **Node.js**: Backend server with Express
- **Vercel Edge Config**: Production data storage

## 📊 Data Management

### Data Abstraction Layer
The project uses a data abstraction layer that automatically switches between storage methods:

- **Local Development**: File-based storage (`orders.json`)
- **Production**: Edge Config for global caching

### Data Flow
1. **Frontend** → **MCP Server** → **Data Service**
2. **Data Service** detects environment and routes accordingly
3. **Same API interface** for both environments

### Files
- `src/services/dataService.js` - Data abstraction layer
- `api/orders.js` - Local file operations
- `api/edge-config/update.js` - Edge Config operations
- `mcp-server/data/orders.template.json` - Template data
- `mcp-server/data/orders.json` - Local data (gitignored)

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