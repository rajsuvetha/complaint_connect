# Complaint Connect

Complaint Connect is a full-stack web application designed to streamline complaint management and booking systems. It provides a user-friendly interface for submitting complaints, managing bookings, and a dashboard for administrative oversight.

## 🚀 Features

- **User Authentication**: Secure login and registration using Passport.js.
- **Dashboard**: Interactive dashboard for users and admins to view status and analytics.
- **Complaint Management**: Submit, track, and manage complaints.
- **Booking System**: Feature for managing bookings (e.g., facilities or appointments).
- **Responsive Design**: Built with Tailwind CSS for a seamless experience across devices.
- **Dark/Light Mode**: Integrated theme switching capability.

## 🛠️ Tech Stack

### Frontend
- **React**: UI library for building interactive interfaces.
- **TypeScript**: Statically typed JavaScript for better developer experience and code quality.
- **Vite**: Fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Radix UI**: Unstyled, accessible components for building high-quality design systems.
- **Wouter**: Minimalist routing for React.
- **TanStack Query**: Powerful asynchronous state management.

### Backend
- **Node.js & Express**: Fast, unopinionated web framework for Node.js.
- **MongoDB**: NoSQL database for flexible data storage.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **Passport.js**: Authentication middleware for Node.js.

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd complaint_connect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   # Database Configuration
   MONGO_URL=mongodb://0.0.0.0:27017/complaint_connect

   # Server Configuration
   port=5001

   # Email Configuration (for notifications)
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-specific-password

   # Session Secret
   SESSION_SECRET=your-secret-key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The server should start on `http://localhost:5001`.

## 📜 Scripts

- `npm run dev`: Starts the development server (client + server).
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run check`: Runs TypeScript type checking.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
