import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="flex-1 flex pt-20">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white/80 to-slate-50/60 backdrop-blur-sm">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;