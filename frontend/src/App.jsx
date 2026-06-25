import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/authSlice.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Pages (to be implemented next)
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import PostDetails from './pages/PostDetails.jsx';
import CreateEditPost from './pages/CreateEditPost.jsx';
import Profile from './pages/Profile.jsx';
import Bookmarks from './pages/Bookmarks.jsx';

// Protected Route wrapper component
function PrivateRoute({ children }) {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  // If there's a token but not yet authenticated, we let it check session.
  // If no token at all, redirect to login.
  if (!token && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // If there is a token on startup, fetch user details to verify session
    if (token && !isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Home / Feed depending on auth */}
          <Route path="/" element={<Home />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Public View Post */}
          <Route path="/posts/:slug" element={<PostDetails />} />
          
          {/* Protected Routes */}
          <Route 
            path="/create-post" 
            element={
              <PrivateRoute>
                <CreateEditPost />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/edit-post/:id" 
            element={
              <PrivateRoute>
                <CreateEditPost />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/bookmarks" 
            element={
              <PrivateRoute>
                <Bookmarks />
              </PrivateRoute>
            } 
          />

          {/* Redirect to Home for any unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
