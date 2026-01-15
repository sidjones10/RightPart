# RightPart - Car Parts Marketplace 🦅

An innovative car parts marketplace app with Iron Man themed UI, helping technicians find car parts globally and car owners diagnose issues with 3D visualization.

## Features

### For Car Owners
- Input car model, make, and issue
- View 3D model of the car with highlighted affected parts
- Receive diagnostic reports via email
- **Track multiple vehicles with maintenance reminders**
- **Get predictive maintenance alerts based on data from other users**
- **Automatic oil change reminders based on mileage**
- **Registration and inspection tag renewal reminders**
- **Smart notifications for high-priority maintenance items**

### Maintenance Hub
- Add and manage multiple vehicles
- Track current mileage and maintenance history
- **Predictive part failure alerts** - Based on aggregated data from other users' reports
- **Oil change tracking** - Automatic reminders every 5,000 miles
- **Tag renewal reminders** - Never miss registration or inspection deadlines
- **Priority-based alerts** - Critical, high, medium, and low priority reminders
- **Part quality insights** - See how long parts typically last based on community data
- Real-time maintenance statistics dashboard

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
