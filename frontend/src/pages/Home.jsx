import { useSelector } from 'react-redux';
import LandingHome from './LandingHome.jsx';
import DashboardHome from './DashboardHome.jsx';

export default function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <LandingHome />;
  }

  return <DashboardHome />;
}
