# Turn-By-Turn Route Generator

## About

The Turn-By-Turn Route Generator is a web application that helps users plan long-distance road trips by automatically calculating optimal stop points based on a predefined daily mileage. It leverages the Google Maps Directions API to get route information and then logically determines overnight stops, providing a clear itinerary with estimated daily mileage and a direct link to Google Maps for navigation.

This project consists of a Firebase Cloud Function backend for handling route calculations and a React frontend for user interaction.

## Features

- **Route Calculation:** Generate a multi-stop itinerary between an origin and destination.
- **Automated Stop Planning:** Calculates logical stop points based on a configurable initial daily mileage (e.g., 500 miles per stop).
- **Address Resolution:** Uses reverse geocoding to provide human-readable addresses for calculated stops.
- **Google Maps Integration:** Generates a Google Maps URL with all calculated stops as waypoints.
- **Turn-By-Turn Navigation Link:** Provides a specific link to open Google Maps directly in turn-by-turn navigation mode.
- **User-Friendly Interface:** Simple and intuitive form for entering origin, destination, and start date.
- **Error Handling:** Provides informative error messages for API failures or invalid input.
- **Responsive Design:** Adapts to different screen sizes for a seamless user experience on desktop and mobile.

## Technologies Used

This project utilizes a combination of modern web technologies:

**Frontend:**

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static typing.
- **Tailwind CSS (DaisyUI)**: A utility-first CSS framework for rapid UI development.
- **Vite**: A fast build tool for modern web projects.

**Backend (Firebase Cloud Functions):**

- **Node.js**: JavaScript runtime environment.
- **Firebase Functions (v2)**: Serverless functions for backend logic.
- **Firebase Functions Params (defineSecret)**: Securely managing API keys.
- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
- **Axios**: Promise-based HTTP client for making API requests.
- **Google Maps Directions API**: For calculating routes and distances.
- **Google Maps Geocoding API**: For reverse geocoding coordinates to addresses.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** (comes with Node.js) or **Yarn**
- **Firebase CLI**: `npm install -g firebase-tools` or `brew install firebase-cli`
- **Google Cloud Project**: A project with billing enabled and the Google Maps Directions API and Geocoding API enabled.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install frontend dependencies:**

    ```bash
    cd src
    npm install
    ```

3.  **Install backend (Firebase Functions) dependencies:**

    ```bash
    cd ../functions
    npm install
    ```

### Environment Variables

This project uses a secret for the Google Maps API Key, managed by Firebase Functions.

1.  **Create a Google Maps API Key:**

    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Select your project.
    - Navigate to "APIs & Services" \> "Credentials".
    - Click "Create Credentials" \> "API Key".
    - **Restrict your API key** to prevent unauthorized use.
      - **API restrictions:** Restrict to "Google Maps Directions API" and "Google Maps Geocoding API".
      - **Application restrictions:** For local development, you might set it to "HTTP referrers (web sites)" and add `http://localhost:5173/*`. For deployment, ensure you add your deployed frontend URLs (e.g., `https://turnbyturn.netlify.app/*`, `https://turnbyturn.app/*`).

2.  **Set the Firebase Function Secret:**

    ```bash
    firebase functions:secrets:set Maps_API_KEY
    ```

    When prompted, paste your Google Maps API Key.

    _Note: Firebase Function Secrets are securely stored and injected at runtime. You don't store this key directly in your codebase._

### Deployment (Firebase Functions)

To deploy the backend to Firebase:

1.  **Login to Firebase:**

    ```bash
    firebase login
    ```

2.  **Initialize Firebase (if not already done):**

    ```bash
    firebase init
    ```

    Follow the prompts, selecting "Functions" and choosing your project.

3.  **Deploy your functions:**

    ```bash
    firebase deploy --only functions
    ```

    After deployment, Firebase will provide an endpoint URL for your `routeCalculator` function (e.g., `https://<region>-<project-id>.cloudfunctions.net/routeCalculator`). You'll need to update `src/App.tsx` with this URL.

4.  **Update Frontend API URL:**
    Open `src/App.tsx` and change the `functionUrl` variable to your deployed Firebase Function URL:

    ```typescript
    const functionUrl = "https://YOUR_DEPLOYED_FUNCTION_URL/calculate-route";
    ```

5.  **Build and serve the frontend locally (or deploy):**
    To run locally after backend deployment:

    ```bash
    cd src
    npm run dev
    ```

    To build for deployment (e.g., to Netlify, Vercel, or Firebase Hosting):

    ```bash
    cd src
    npm run build
    ```

    The build output will be in the `dist` directory.

## Usage

1.  **Access the Application:** Once the frontend is running (either locally or deployed), open your web browser and navigate to the application URL.
2.  **Enter Origin and Destination:**
    - In the "Origin" field, type your starting location (e.g., "Boston, MA").
    - In the "Destination" field, type your final destination (e.g., "Luke AFB").
3.  **Select Start Date:** Choose the date you plan to begin your trip using the date picker.
4.  **Generate Route:** Click the "Generate Route" button.
5.  **View Itinerary:** The application will calculate the route and display a table of stops, including dates, departure/arrival points, and estimated mileage per segment.
6.  **Google Maps Links:**
    - Click "Google Maps" to open the entire route with all stops as waypoints in Google Maps.
    - Click "Turn By Turn" to open Google Maps directly in turn-by-turn navigation mode for the full route.

## Project Structure

```
.
├── functions/               # Firebase Cloud Functions (backend)
│   ├── index.js             # Main entry point for Firebase Functions
│   ├── package.json         # Node.js dependencies for functions
│   └── ...
├── src/                     # React Frontend
│   ├── assets/              # Static assets (images, etc.)
│   ├── components/          # Reusable React components
│   │   ├── Actions.tsx
│   │   ├── Table.tsx
│   │   └── TableData.tsx
│   ├── utils/               # Utility functions
│   │   ├── helpers.ts
│   │   └── types.ts         # TypeScript type definitions
│   ├── App.tsx              # Main React application component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global CSS (TailwindCSS imports)
│   ├── package.json         # React project dependencies
│   └── ...
├── .gitignore
├── firebase.json            # Firebase project configuration
├── README.md                # This file
└── ...
```

## API Endpoints

The Firebase Cloud Function exposes a single API endpoint:

### `POST /calculate-route`

Calculates a multi-stop route between an origin and destination.

- **URL:** `https://YOUR_DEPLOYED_FUNCTION_URL/calculate-route`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "origin": "string", // The starting point of the journey (e.g., "Boston, MA")
  "destination": "string" // The final destination (e.g., "Los Angeles, CA")
}
```

**Successful Response (200 OK):**

```json
{
  "totalDistanceMiles": "string", // Total route distance in miles
  "totalDuration": "string",     // Total estimated duration of the route (e.g., "1 day 10 hours")
  "stops": [                     // Array of calculated stop points
    {
      "address": "string",       // Resolved address of the stop
      "distanceFromStart": "string", // Distance from the origin to this stop in miles
      "lat": number,             // Latitude of the stop
      "lng": number,             // Longitude of the stop
      "actualDistanceAdded": number // Miles added in this segment
    }
  ],
  "googleMapsUrl": "string"      // Google Maps URL with origin, waypoints, and destination
}
```

**Error Response (400 Bad Request / 500 Internal Server Error):**

```json
{
  "error": "string" // A descriptive error message
}
```

## Contributing

Contributions are welcome\! If you have suggestions for improvements, new features, or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the existing style and conventions.

## License

This project is open-sourced under the [MIT License](https://www.google.com/search?q=MITLICENSE).

## Contact

If you have any questions or feedback, feel free to open an issue in this repository.
