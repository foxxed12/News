import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Category from '../pages/Category';
import NewsDetail from '../pages/NewsDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Admin from '../pages/Admin';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/category/:category', element: <Category /> },
  { path: '/news/:id', element: <NewsDetail /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/admin', element: <Admin /> },
]);
