import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Welcome from "../pages/Welcome";
import EditProfile from "../pages/EditProfile";
import AdminDashboard from "../pages/AdminDashboard";
import UserManagement from "../pages/Users";
import TimeslotManager from "../pages/TimeslotManager";

import TherapyBooking from "../pages/TherapyBooking";
import AddTherapist from "../pages/AddTherapist";
import TherapyManager from "../pages/TherapyManager";
import CartPage from "../pages/Cart";
import UpcomingMeetingsPage from "../pages/UpcomingMeetingsPage";
import AllOrdersPage from "../pages/AllOrdersPage";
import MeetingPage from "../pages/MeetingPage";
import AdminUpcomingBookingsPage from "../pages/AdminUpcomingBookingsPage";
import AdminAllBookingsPage from "../pages/AdminAllBookingsPage";
import AdminBookingDetailPage from "../pages/AdminBookingDetailPage";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '',
                element: <Home />,
            },
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '/signup',
                element: <Signup />,
            },
            {
                path: '/dashboard',
                element: <Dashboard />,
                children: [
                    {
                        path: 'home',
                        element: <Welcome />,
                    },
                    {
                        path:'edit-profile',
                        element: <EditProfile />,
                    },
                    {
                        path:'book-therapy',
                        element:<TherapyBooking/>
                    },
                    {
                        path:'cart',
                        element:<CartPage/>
                    },
                    {
                        path:'upcoming-meetings',
                        element:<UpcomingMeetingsPage/>
                    },
                    {
                        path:'all-orders',
                        element:<AllOrdersPage/>
                    },
                    
                ],
            },{
                path:'meeting/:bookingId',
                element:<MeetingPage/>
            },
            {
                path: 'admin-dashboard',
                element: <AdminDashboard />,
                children:[
                    {
                        path: 'users',
                        element: <UserManagement/>,
                    },
                    {
                        path: 'timeslots',
                        element: <TimeslotManager/>
                    },
                    {
                        path: 'therapy-manager',
                        element:<TherapyManager/>
                    },
                    {
                        path:'add-expert',
                        element:<AddTherapist/>
                    },
                    {
                        path: 'upcoming',
                        element: <AdminUpcomingBookingsPage/>
                    },
                    {
                        path: 'all-bookings',
                        element: <AdminAllBookingsPage/>
                    },
                    {
                        path: 'bookings/detail/:bookingId',
                        element: <AdminBookingDetailPage/>
                    }
                    
                ]
            }
        ],
    },
]);

export default router;
