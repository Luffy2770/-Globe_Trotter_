import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateTripModal } from './pages/CreateTripModal';
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage';
import { CatalogSearchPage } from './pages/CatalogSearchPage';
import { BudgetAnalyticsPage } from './pages/BudgetAnalyticsPage';
import { authApi, tripsApi } from './services/api';

export function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      
      const tripsRes = await tripsApi.getTripsListing({});
      const trips = tripsRes.data.trips || tripsRes.data.upcoming || [];
      if (trips.length > 0) {
        setSelectedTripId(trips[0].id);
      }
    } catch (err) {
      console.error('Session expired or invalid token');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    checkAuth();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-xs font-semibold animate-pulse">
        Loading GlobeTrotter Application...
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen text-slate-900 font-sans antialiased pb-12">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <main>
        {activeTab === 'dashboard' && (
          <DashboardPage
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onSelectTripForItinerary={(tripId) => {
              setSelectedTripId(tripId);
              setActiveTab('itinerary');
            }}
            onSelectTripForBudget={(tripId) => {
              setSelectedTripId(tripId);
              setActiveTab('budget');
            }}
          />
        )}

        {activeTab === 'catalog' && <CatalogSearchPage />}

        {activeTab === 'itinerary' && selectedTripId && (
          <ItineraryBuilderPage tripId={selectedTripId} />
        )}

        {activeTab === 'budget' && selectedTripId && (
          <BudgetAnalyticsPage tripId={selectedTripId} />
        )}
      </main>

      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTripCreated={() => {
          checkAuth();
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}

export default App;
