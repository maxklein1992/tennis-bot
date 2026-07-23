import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MarketingLayout } from './layouts/MarketingLayout';
import { HomePage } from './pages/HomePage';
import { ContactPage } from './pages/ContactPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/hoe-werkt-het" element={<HowItWorksPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
