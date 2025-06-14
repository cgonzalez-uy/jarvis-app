import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <div className="z-50">
        <Header />
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 pt-16">
          <div className="h-full flex">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="h-full w-full px-8 py-6">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 