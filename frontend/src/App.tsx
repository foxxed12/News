import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Category from './pages/Category';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Header from './components/Header';
import ThemeWrapper from './components/ThemeWrapper';

const App: React.FC = () => {
  return (
    <ThemeWrapper>
      <Header />
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </ThemeWrapper>
  );
};

export default App;
