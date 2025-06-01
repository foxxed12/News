import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          Новости
        </Link>
        <nav className="space-x-4">
          <Link to="/category/economy">Экономика</Link>
          <Link to="/category/society">Общество</Link>
          <Link to="/category/science">Наука</Link>
          <Link to="/category/military">Армия</Link>
          {isLoggedIn ? (
            <>
              <Link to="/admin">Админ</Link>
              <button onClick={logout} className="ml-2 underline">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Вход</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
