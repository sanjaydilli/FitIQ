import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const HOME_ROUTES = ['/home', '/login', '/'];

export function useAndroidBack() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handler = App.addListener('backButton', ({ canGoBack }) => {
      if (HOME_ROUTES.includes(location.pathname)) {
        // At root — minimize app instead of going back
        App.minimizeApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        App.minimizeApp();
      }
    });

    return () => { handler.then(h => h.remove()); };
  }, [navigate, location.pathname]);
}
