import { Outlet } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

export function MarketingLayout() {
  return (
    <div className="marketing-page">
      <NavBar />
      <main className="marketing-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
