import { useState, useEffect } from 'react';
import { WeatherFeatureIcon, FilesFeatureIcon, DebugFeatureIcon, OnlineIcon, OfflineIcon } from '../icons';

function HomePage({ onNavigate }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFeatureClick = (feature, page) => {
    if (page) {
      onNavigate(page);
    }
  };

  return (
    <div className="home-page">
      <div className="status-info">
        <p>Статус сети:
          <span className={isOnline ? 'online' : 'offline'}>
            {isOnline ? <><OnlineIcon /> Онлайн</> : <><OfflineIcon /> Офлайн</>}
          </span>
        </p>
      </div>

      <div className="features-window">
        <div className="window-header">
          <h2>Функции PWA</h2>
        </div>

        <div className="features-horizontal">
          <div className="feature-item" onClick={() => handleFeatureClick('Погода', 'weather')}>
            <div className="feature-icon">
              <WeatherFeatureIcon />
            </div>
            <div className="feature-content">
              <h3>Погода</h3>
              <p>Актуальные прогнозы</p>
            </div>
          </div>

          <div className="feature-item" onClick={() => handleFeatureClick('Файлы', 'files')}>
            <div className="feature-icon">
              <FilesFeatureIcon />
            </div>
            <div className="feature-content">
              <h3>Файлы</h3>
              <p>Работа с файлами</p>
            </div>
          </div>

          <div className="feature-item" onClick={() => handleFeatureClick('Debug', 'debug')}>
            <div className="feature-icon">
              <DebugFeatureIcon />
            </div>
            <div className="feature-content">
              <h3>Debug Панель</h3>
              <p>Мониторинг PWA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
