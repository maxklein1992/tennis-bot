import { Outlet } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

export function MarketingLayout() {
  return (
    <div className="marketing-page">
      <NavBar />
      <main className="marketing-main">
        <Outlet />
      </main>
    </div>
  );
}
