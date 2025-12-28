import AdminHome from './pages/AdminHome';
import AdminLayout from './components/AdminLayout';
import './App.css';
import User from './getuser/User';
import AddUser from './adduser/AddUser';
import Update from './updateuser/Update';
import Login from './pages/Login';
import Register from './pages/Register';
import ClassManagement from './pages/ClassManagement';
import MajorManagement from './pages/MajorManagement';
import CourseManagement from './pages/CourseManagement';
import GradeManagement from './pages/GradeManagement';
import AllFeatures from './pages/AllFeatures';
import Profile from './pages/Profile';
import ProtectRoute from './components/ProtectRoute';
// Header is shown only inside AdminLayout for authenticated routes
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
  // Header is always shown (auth pages use standalone layout where needed)

  const route = createBrowserRouter([
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },

    // Admin layout mounted at root so the admin single-page UI is served at '/'
    {
      path: '/',
      element: (
        <ProtectRoute>
          <AdminLayout />
        </ProtectRoute>
      ),
      children: [
        { index: true, element: <AdminHome /> },
        { path: 'students', element: <User /> },
        { path: 'students/add', element: <AddUser /> },
        { path: 'students/update/:id', element: <Update /> },
        { path: 'classes', element: <ClassManagement /> },
        { path: 'majors', element: <MajorManagement /> },
        { path: 'courses', element: <CourseManagement /> },
        { path: 'grades', element: <GradeManagement /> },
          // Finance routes removed per user request (feature disabled)
        { path: 'all-features', element: <AllFeatures /> },
  { path: 'profile', element: <Profile /> },
      ]
    },

    // Legacy direct routes removed in favor of the single AdminLayout mounted at '/'
  ]);

  return (
    <div className="App" style={{ display: 'flex', minHeight: '100vh', background: '#EDF2F7', paddingTop: 64 }}>
      <RouterProvider router={route} />
    </div>
  );
}

export default App;
