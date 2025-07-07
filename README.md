# Classic Messenger App - Frontend

Classic Messenger is a responsive, intuitive, and modern real-time messaging application built with React. The frontend seamlessly integrates with a backend API to provide secure and efficient messaging capabilities, user authentication, friend management, and a sleek user interface that enhances user experience.

## Features

* **Real-Time Messaging:** Implements WebSocket integration for instant message sending and receiving.
* **User Authentication:** Provides secure signup and login functionalities, complete with session handling and persistence.
* **Dynamic Routing:** Uses React Router to handle dynamic routes and conditional rendering based on user authentication status.
* **State Management:** Efficiently handles global state using modern React patterns (Hooks, Context API).
* **Responsive Design:** Fully responsive and mobile-friendly user interface, optimized for all device sizes.
* **Friend Management:** Allows users to send, accept, or reject friend requests and manage friend lists intuitively.
* **Private and Group Chats:** Supports both direct messaging and group conversations.
* **User Profiles:** Enables profile customization, such as profile pictures and "About Me" sections.
* **Error Handling & Form Validation:** Implements robust client-side validation and user-friendly error messaging.

## Technology Stack

* **React** with **Hooks & Context API** for dynamic UI rendering and state management.
* **React Router** for handling dynamic client-side routing.
* **WebSocket API** for real-time communication.
* **CSS** for responsive and clean UI design.

## Installation & Setup

### Prerequisites

* Node.js v16+ and npm installed on your machine.

### Steps

1. **Clone the Repository:**

```bash
git clone [repository-url]
cd Classic-Messenger-App-Frontend
```

2. **Install Dependencies:**

```bash
npm install
```

3. **Configure Environment:** Create a `.env` file in the project root with the following configuration:

```env
REACT_APP_BACKEND_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_FRONTEND_URL=http://localhost:9000
REACT_APP_OAUTH_CLIENTID=[your-google-oauth-client-id]
```

4. **Start the Application:**

```bash
npm run dev
```

Your frontend application will be running at `http://localhost:9000`.

## Usage

* **Login / Signup:** Access through intuitive forms at the homepage.
* **Messaging:** Initiate or join conversations from your friend list.
* **Friend Requests:** Manage friend requests and explore user profiles effortlessly.

## Future Improvements

* Integration of notifications and alerts.
* Enhanced media support (image/video messaging).

## Contributions

Feel free to fork and submit pull requests for features, enhancements, or bug fixes.

## Author

Chris Merced

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
