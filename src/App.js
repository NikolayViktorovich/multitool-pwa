import { useState, useEffect, useCallback } from 'react';
import { registerServiceWorker } from './registerServiceWorker';
import './App.css';
import HomePage from './pages/HomePage';
import WeatherPage from './pages/WeatherPage';
import FilesPage from './pages/FilesPage';
import DebugPage from './pages/DebugPage';
import {
  HomeIcon,
  WeatherIcon,
  FilesIcon,
  DebugIcon,
  MenuIcon,
  CloseIcon,
  BackIcon
} from './icons';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme] = useState('dark');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState(['home']);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((title, message, type = 'info') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
    }
  }, [deferredPrompt]);

  const handleNavigation = useCallback(
    page => {
      if (page !== currentPage) {
        setNavigationHistory(prev => [...prev, page]);
        setCurrentPage(page);
      }
      setMenuOpen(false);
    },
    [currentPage]
  );

  const handleBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentPage(previousPage);
    }
  }, [navigationHistory]);

  const canGoBack = navigationHistory.length > 1;

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'weather':
        return <WeatherPage />;
      case 'files':
        return <FilesPage />;
      case 'debug':
        return <DebugPage showNotification={showNotification} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  }, [currentPage, showNotification]);

  useEffect(() => {
    registerServiceWorker();

    const handleBeforeInstallPrompt = e => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
    };

    const handleClickOutside = event => {
      if (
        menuOpen &&
        !event.target.closest('.main-nav') &&
        !event.target.closest('.menu-toggle')
      ) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className={`App ${theme}`}>
      {showInstallPrompt && (
        <div
          className="modal-overlay"
          onClick={() => setShowInstallPrompt(false)}
        >
          <div
            className="modal install-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Установить приложение</h3>
              <button
                className="modal-close"
                onClick={() => setShowInstallPrompt(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Установите Multitool PWA для лучшего опыта использования.
                Приложение будет работать быстрее и доступно без интернета.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowInstallPrompt(false)}
              >
                Позже
              </button>
              <button className="btn btn-primary" onClick={handleInstallClick}>
                Установить
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className={`menu-toggle ${menuOpen ? 'hidden' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Открыть меню"
      >
        <MenuIcon />
      </button>

      <div className={`main-nav ${menuOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <div className="nav-brand">
            <h1>Multitool</h1>
          </div>
          <button className="nav-close" onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <nav className="page-nav">
          <button
            className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('home')}
          >
            <HomeIcon />
            <span>Главная</span>
          </button>
          <button
            className={`nav-btn ${currentPage === 'weather' ? 'active' : ''}`}
            onClick={() => handleNavigation('weather')}
          >
            <WeatherIcon />
            <span>Погода</span>
          </button>
          <button
            className={`nav-btn ${currentPage === 'files' ? 'active' : ''}`}
            onClick={() => handleNavigation('files')}
          >
            <FilesIcon />
            <span>Файлы</span>
          </button>
          <button
            className={`nav-btn ${currentPage === 'debug' ? 'active' : ''}`}
            onClick={() => handleNavigation('debug')}
          >
            <DebugIcon />
            <span>Debug</span>
          </button>
        </nav>
      </div>

      <div className="page-content">
        {canGoBack && (
          <button className="btn btn-secondary back-btn" onClick={handleBack}>
            <BackIcon />
            Назад
          </button>
        )}
        {renderPage()}
      </div>

      {notification && (
        <div className="notification-overlay" onClick={closeNotification}>
          <div
            className={`notification ${notification.type}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="notification-header">
              <h3>{notification.title}</h3>
              <button
                className="notification-close"
                onClick={closeNotification}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="notification-body">
              <p>{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
