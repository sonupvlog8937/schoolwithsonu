# Parent Panel

This folder contains the Parent role panel for the school management system.

## Structure

```
parent/
├── Parent.jsx                      # Main parent dashboard with sidebar navigation
├── components/
│   ├── ParentDetails.jsx          # Parent profile details page
│   └── ChildrenList.jsx           # List of parent's children
└── README.md                       # This file
```

## Features

### Navigation Menu
- **My Profile** - View parent profile details
- **My Children** - View list of linked children
- **Attendance** - View children's attendance records
- **Homework** - View children's homework assignments
- **Exams & Results** - View children's exam results
- **Fees** - View and manage fee payments
- **Notice** - View school notices
- **Log Out** - Sign out from the system

## Components

### Parent.jsx
Main dashboard component with:
- Collapsible sidebar navigation
- Responsive design
- Material-UI styled components
- Route-based active state highlighting

### ParentDetails.jsx
Displays parent information:
- Name, email, phone
- Address, occupation, relation
- Number of children
- School information
- Print functionality
- Copy to clipboard for contact details

### ChildrenList.jsx
Shows all linked children with:
- Student name and photo
- Roll number and class
- Contact information
- Admission number
- Status (Active/Inactive)
- Responsive grid layout

## Usage

### Adding to Routes
Add these routes to your `AppRoutes.jsx`:

```jsx
import Parent from "./parent/Parent";
import ParentDetails from "./parent/components/ParentDetails";
import ChildrenList from "./parent/components/ChildrenList";

// Inside your routes:
<Route path="/parent" element={<ProtectedRoute><Parent /></ProtectedRoute>}>
  <Route index element={<ParentDetails />} />
  <Route path="details" element={<ParentDetails />} />
  <Route path="children" element={<ChildrenList />} />
  {/* Add more routes as needed */}
</Route>
```

### API Endpoints Required
- `GET /api/parent/details` - Get parent profile and children list

## Styling
- Uses Material-UI components
- Gradient backgrounds (Orange/Yellow theme)
- Responsive design for mobile, tablet, and desktop
- Print-friendly profile page

## Future Enhancements
- Attendance tracking component
- Homework viewing component
- Exam results component
- Fee payment component
- Notice board component
- Real-time notifications
- Chat with teachers
