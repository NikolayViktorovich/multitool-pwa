import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Multitool app', () => {
  render(<App />);

  const appTitle = screen.getByText(/Multitool/i);
  expect(appTitle).toBeInTheDocument();

  const homeButton = screen.getByRole('button', { name: /Главная/i });
  expect(homeButton).toBeInTheDocument();
});

test('renders network status', () => {
  render(<App />);

  const networkStatus = screen.getByText(/Статус сети:/i);
  expect(networkStatus).toBeInTheDocument();

  const onlineStatus = screen.getByText(/Онлайн/i);
  expect(onlineStatus).toBeInTheDocument();
});

test('renders PWA features', () => {
  render(<App />);

  const featuresTitle = screen.getByText(/Функции PWA/i);
  expect(featuresTitle).toBeInTheDocument();

  const weatherFeature = screen.getByRole('heading', {
    name: /Погода/i,
    level: 3
  });
  expect(weatherFeature).toBeInTheDocument();

  const filesFeature = screen.getByRole('heading', {
    name: /Файлы/i,
    level: 3
  });
  expect(filesFeature).toBeInTheDocument();

  const debugFeature = screen.getByRole('heading', {
    name: /Debug Панель/i,
    level: 3
  });
  expect(debugFeature).toBeInTheDocument();
});
