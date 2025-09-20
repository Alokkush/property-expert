# Property Expert - Cloud-Based Real Estate Management System

A modern, responsive real estate management system built with HTML, CSS, JavaScript, Bootstrap, and Firebase. This application allows users to list, view, manage, and search properties with a beautiful UI and smooth user experience.

## Features

### 🌐 Frontend
- **Home Page**: Displays all property listings in a beautiful card/grid layout
- **Login/Signup**: Secure authentication with Firebase Authentication
- **Add Property**: Modern form to add new properties with image URL
- **Manage Properties**: View, update, and delete your own property listings
- **Responsive Design**: Works on all device sizes with Bootstrap
- **Animations**: Smooth CSS animations for enhanced user experience
- **Automatic Demo Properties**: Sample properties are automatically inserted when the database is empty

### 🔑 Backend (Firebase)
- **Authentication**: Email/Password authentication
- **Database**: Firestore for storing property details
- **CRUD Operations**: Create, Read, Update, Delete properties
- **Security**: Users can only manage their own properties

### 🖼 Images
- No Firebase Storage required
- Uses public image URLs from services like Unsplash or Picsum
- Supports "none" or "no" as image URL for properties without images

## Project Structure

```
property-expert/
│
├── index.html              # Home page
├── add-property.html       # Add property page
├── manage-properties.html  # Manage properties page
├── README.md               # Project documentation
├── FIREBASE_SETUP.md       # Firebase setup guide
│
├── css/
│   └── style.css           # Custom styles
│
├── js/
│   ├── firebase-config.js   # Firebase configuration
│   ├── auth.js             # Authentication handling
│   ├── main.js             # Home page functionality
│   ├── add-property.js     # Add property functionality
│   └── manage-properties.js # Manage properties functionality
│
└── images/                 # (Created after deployment)
```

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (for Firebase deployment)
- A Google account for Firebase

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser to view the application

### Firebase Setup
Follow the detailed instructions in [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to:
1. Create a Firebase project
2. Enable Authentication and Firestore
3. Update the Firebase configuration
4. Deploy the application

## Demo Data

The application automatically inserts sample properties when the database is empty:
- 6 professionally curated property listings with realistic data
- High-quality images from Unsplash
- Diverse property types (apartments, houses, villas, etc.)
- Properties from different locations (New York, Austin, Miami, etc.)

To add your own properties:
1. Sign up for an account
2. Log in to the application
3. Click "Add Property" to create your own listings

## Demo Image URLs

You can use these sample image URLs when adding properties:

- https://picsum.photos/400/300
- https://images.unsplash.com/photo-1507089947368-19c1da9775ae
- https://images.unsplash.com/photo-1560184897-c21f986c5f16

Alternatively, you can type "none" or "no" in the image URL field to display a "No Image Available" placeholder.

## Troubleshooting

If you encounter issues with property loading or other functionality:

1. Check the browser console for error messages (press F12)
2. Verify your Firebase configuration in `js/firebase-config.js`
3. Ensure Firestore security rules are properly set up
4. Refer to the detailed [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide

## Deployment

This project is ready for deployment on Firebase Hosting. Follow the deployment instructions in [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

## Customization

You can customize the application by modifying:

- **CSS**: Update [css/style.css](css/style.css) for styling changes
- **JavaScript**: Modify files in the [js/](js/) directory for functionality changes
- **HTML**: Edit the HTML files directly for layout changes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a complete project ready for use. If you'd like to contribute improvements, please fork the repository and submit a pull request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, please refer to the documentation or contact the developer.