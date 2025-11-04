# Classic Messenger App - Frontend

[You can experience the Classic Messenger app here!](https://classic-messenger-app-frontend-c6da0795ba58.herokuapp.com/)
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

Note that this setup needs to be married with the installation provided in the Backend repository: https://github.com/Chris-Merced/Classic-Messenger-App-Backend

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

## Testing

The frontend includes a comprehensive test suite using **Jest** and  **React Testing Library**, targeting both component behavior and context-based application logic.

### Test Coverage Includes:
#### Components:
- `chatSideBar.test.js` - Unit testing sidebar functions like pagination for both search and chat list loading as well as interaction to load appropriate chats
- `friends.test.js` - Unit testing friends page for accurate depiction of passed through data and expected interactions of list items
- `header.test.js` - Unit testing for expected interaction of login, logout, search, and theme functionality
- `home.test.js` - Unit testing for loading crucial selected chat data
- `oauth.test.js` - Unit testing for alternative login functionality
- `signup.test.js` - Unit testing for expected functionality on user signup
- `userProfile.test.js` - Unit testing for accurate depiction of data depending on relationship parameters

#### Context Providers:
- `chatListContext.test.js` - Unit testing to ensure context for user's chats are loaded and passed through to components accurately
- `userContext.test.js` - Unit testing to ensure context for logged in user is accurately holding the appropriate data and passing to components
- `websocketContext.test.js` - Unit testing to ensure that websocket is being instantiated correctly and made available to components

### Running Tests

To run the test suite:

```bash
npm test
```

## Future Improvements

* Integration of notifications and alerts.
* Enhanced media support (image/video messaging).

## Contributions

Feel free to fork and submit pull requests for features, enhancements, or bug fixes.

## Author

Chris Merced

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
