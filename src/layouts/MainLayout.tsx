import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-primary-950">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-purple/5 pointer-events-none"></div>
      
      <div className="z-50">
        <Header />
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 pt-20">
          <div className="h-full flex">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white/50 to-slate-50/80 backdrop-blur-sm">
              <div className="h-full w-full px-8 py-8">
                <div className="relative">
                  {/* Content background */}
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl shadow-glass border border-white/20"></div>
                  <div className="relative p-8 rounded-3xl">
                    <Outlet />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;