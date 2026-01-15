# RightPart - Car Parts Marketplace 🦅

An innovative car parts marketplace app with Iron Man themed UI, helping technicians find car parts globally and car owners diagnose issues with 3D visualization.

## Features

### For Car Owners
- Input car model, make, and issue
- View 3D model of the car with highlighted affected parts
- Receive diagnostic reports via email

### For Mechanics/Technicians
- Search for car parts globally
- Bid on parts from sellers worldwide
- Track parts supply and cost

### For Sellers
- List car parts for sale
- Receive and manage bids from mechanics
- Accept or reject bids

## Design
- **Theme**: Iron Man colors (red and gold)
- **Logo**: Red Falcon

## Installation

```bash
# Install all dependencies
npm run install-all

# Start development server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your configuration:
- MongoDB connection string
- Email service credentials
- JWT secret

## Tech Stack

- **Frontend**: React, Vite, Three.js (@react-three/fiber)
- **Backend**: Node.js, Express, MongoDB
- **3D Graphics**: Three.js
- **Email**: Nodemailer
