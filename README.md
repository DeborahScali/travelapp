# Travel Planner App

A comprehensive travel planning web application built with React, Vite, and Tailwind CSS. Plan your perfect trip with flight management, daily itineraries, expense tracking, and more!

## Features

- **Flight Management** - Add/delete flights with airline, times, and booking references
- **Daily Itinerary Planning** - Day-by-day organization with customizable titles
- **Google Maps Integration** - Automatic distance/time calculation between places
- **Transportation Tracking** - Support for walking, metro, bus, train, and car with distances and times
- **Expense Tracking** - Track expenses by category, city, and country
- **Analytics Dashboard** - View expense and distance breakdowns
- **Visit Tracking** - Check off places as visited (they collapse when done)
- **City/Country Autocomplete** - Built-in database with 180+ cities in Switzerland, Italy, and France
- **Data Persistence** - Everything auto-saves to localStorage
- **Mobile-Responsive** - Optimized for iPhone and all screen sizes
- **Inline Editing** - Click to edit trip name, dates, and day titles

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide Icons
- Google Maps API (optional)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/travelapp.git
cd travelapp
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser to `http://localhost:5173`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist` folder.

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Create a GitHub repository** named `travelapp`

2. **Update the base path** in `vite.config.js`:
   - If your repo URL is `https://github.com/username/travelapp`
   - Then the base should be `/travelapp/` (already configured)

3. **Enable GitHub Pages** in your repository:
   - Go to Settings > Pages
   - Under "Build and deployment", select "GitHub Actions" as the source

4. **Push your code**:
\`\`\`bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/travelapp.git
git push -u origin main
\`\`\`

5. **Wait for deployment**:
   - GitHub Actions will automatically build and deploy your app
   - Check the "Actions" tab to monitor progress
   - Your app will be live at `https://YOUR_USERNAME.github.io/travelapp/`

## Configuration

### Google Maps API (Optional)

To enable automatic distance and travel time calculations:

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Distance Matrix API" and "Maps JavaScript API"
3. Click the "Setup API" button in the app header
4. Enter your API key (stored securely in your browser's localStorage)

**Note:** Google provides $200 free credit per month.

## Project Structure

\`\`\`
travelapp/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── src/
│   ├── TravelPlanner.jsx       # Main React component
│   ├── main.jsx                # React app entry point
│   └── index.css               # Global styles with Tailwind
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── package.json                # Dependencies and scripts
\`\`\`

## Usage Tips

- **Trip Name & Dates**: Click on them to edit inline
- **Day Titles**: Default to "Day 1", "Day 2", etc. Click to customize
- **City/Country**: Type to see autocomplete suggestions
- **Visit Tracking**: Click the checkbox to mark places as visited
- **Google Maps**: Click the map icon to open locations or get directions
- **Data Persistence**: All data is auto-saved to your browser

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
