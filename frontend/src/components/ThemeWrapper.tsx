import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { themes } from '../styles/themes';

const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const category = location.pathname.split('/')[2]; // /category/экономика
    const theme = themes[category as keyof typeof themes] || themes.default;
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
  }, [location]);

  return <>{children}</>;
};

export default ThemeWrapper;
