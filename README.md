# Travel Planner App

A comprehensive travel planning web application built with React, Vite, and Tailwind CSS. Plan your perfect trip with flight management, daily itineraries, expense tracking, and more!

## Features

- **Flight Management** - Add/delete flights with airline, times, and booking references
- **Daily Itinerary Planning** - Day-by-day organization with customizable titles (default "Day 1", "Day 2", etc.)
- **Google Maps Integration** - Automatic distance/time calculation between places
- **Transportation Tracking** - Support for walking, metro, bus, train, and car with distances and times
- **Expense Tracking** - Track expenses by category, city, and country
- **Analytics Dashboard** - View expense and distance breakdowns by category, city, and country
- **Visit Tracking** - Check off places as visited (they collapse when done)
- **City/Country Autocomplete** - Built-in database with 180+ cities in Switzerland, Italy, and France
- **Google Authentication** - Sign in with your Google account
- **Data Persistence** - All data auto-saves to the cloud via Firebase
- **Mobile-Responsive** - Optimized for iPhone and all screen sizes
- **Native iOS Feel** - Built with SF Pro font for authentic Apple experience
- **Inline Editing** - Click to edit trip name, dates, and day titles (grey background for edit mode)
- **Multi-device Access** - Access your trips from any device after signing in

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide Icons
- Firebase (Authentication & Firestore Database)
- Google Maps API (for distance/time calculations)

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

## Firebase Setup (Required)

This app uses Firebase for authentication and data storage. Follow these steps to set up Firebase:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and enter a project name (e.g., "travel-planner")
3. Disable Google Analytics (optional) or keep it enabled
4. Click "Create project"

### 2. Register Web App

1. In your Firebase project, click the Web icon (`</>`) to add a web app
2. Enter app nickname: "Travel Planner Web"
3. Don't check "Firebase Hosting" (we use GitHub Pages)
4. Click "Register app"
5. Copy the Firebase configuration values - you'll need them next

### 3. Enable Google Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Google** provider
4. Select a support email
5. Click **Save**

### 4. Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Select **Start in production mode**
3. Choose a location (closest to you)
4. Click **Enable**

### 5. Set Firestore Security Rules

1. In Firestore, go to **Rules** tab
2. Replace existing rules with:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

3. Click **Publish**

### 6. Configure Environment Variables

1. Copy `.env.example` to `.env`:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Open `.env` and add your Firebase configuration values from step 2:
\`\`\`env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
\`\`\`

### 7. Add Authorized Domain (for GitHub Pages)

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your GitHub Pages domain: `YOUR_USERNAME.github.io`
3. Click **Add domain**

Now you're ready to run the app locally or deploy it!

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Create a GitHub repository** named `travelapp`

2. **Update the base path** in `vite.config.js`:
   - If your repo URL is `https://github.com/username/travelapp`
   - Then the base should be `/travelapp/` (already configured)

3. **Add Firebase secrets to GitHub**:
   - Go to your repository → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret** and add each of these:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

4. **Enable GitHub Pages** in your repository:
   - Go to Settings > Pages
   - Under "Build and deployment", select "GitHub Actions" as the source

5. **Push your code**:
\`\`\`bash
git add .
git commit -m "Add Firebase authentication"
git push
\`\`\`

6. **Wait for deployment**:
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

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

**Recommended:** Use on iPhone for the best mobile experience with SF Pro font.

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

- **Trip Name & Dates**: Click on them to edit inline (grey background indicates edit mode)
- **Day Titles**: Default to "Day 1", "Day 2", etc. Click to customize
- **City/Country**: Type to see autocomplete suggestions from our 180+ city database
- **Visit Tracking**: Click the checkbox to mark places as visited (they'll collapse)
- **Google Maps**: Click the map icon to open locations or get directions
- **Expenses**: Add expenses with amounts and they'll be automatically categorized and broken down by city/country
- **Data Persistence**: All data is auto-saved to your Firebase account
- **Sign Out**: Use the profile menu to safely sign out and access your data on other devices
- **Google Maps API**: Optional - Click the "Setup API" button to enable automatic distance calculations

## Troubleshooting

### "Failed to sign in with Google"
- Make sure your Firebase project has Google authentication enabled
- Check that your authorized domains include your app's domain
- Clear browser cache and try again

### Data not syncing across devices
- Ensure you've signed in with the same Google account
- Data syncs when you open the app (not real-time)
- Try refreshing the page

### Google Maps not calculating distances
- Click "Setup API" in the header to add your API key
- Make sure your API key has Distance Matrix API enabled
- Check the browser console for API errors

### Data disappeared after signing out
- Your data is saved in your Google account, not on this device
- Sign back in with the same Google account to see your trips

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
