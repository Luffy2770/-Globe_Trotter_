import { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage';
import { Navbar } from './components/Navbar';
import { ExploreCitiesPage } from './pages/ExploreCitiesPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { ProfilePreferencesPage } from './pages/ProfilePreferencesPage';
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage';
import { BudgetAnalyticsPage } from './pages/BudgetAnalyticsPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { CalendarPlannerPage } from './pages/CalendarPlannerPage';
import { CreateTripModal } from './pages/CreateTripModal';
import { tripsApi } from './services/api';

export function App() {
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('explore');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [defaultTripId, setDefaultTripId] = useState<number | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalCityId, setModalCityId] = useState<number | null>(null);
  const [tripRefreshCounter, setTripRefreshCounter] = useState<number>(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      tripsApi.getTripsListing({}).then((res) => {
        const all = [...(res.data.ongoing || []), ...(res.data.upcoming || []), ...(res.data.completed || [])];
        if (all.length > 0) {
          setDefaultTripId(all[0].id);
        }
      });
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  }, [user, tripRefreshCounter]);

  const handleLoginSuccess = (userData: any, token: string) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
    setActiveTab('explore');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUpdateUser = (updatedUserData: any) => {
    setUser(updatedUserData);
  };

  const handleSelectTripForItinerary = (tripId: number) => {
    setSelectedTripId(tripId);
    setActiveTab('itinerary');
  };

  const handleSelectTripForBudget = (tripId: number) => {
    setSelectedTripId(tripId);
    setActiveTab('budget');
  };

  const handleOpenCreateModalWithCity = (cityId?: number) => {
    setModalCityId(cityId || null);
    setIsCreateModalOpen(true);
  };

  const handleTripCreatedSuccess = () => {
    setTripRefreshCounter((prev) => prev + 1);
    setActiveTab('trips');
  };

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const activeItineraryTripId = selectedTripId || defaultTripId || 1;

  return (
    <div className="min-h-screen bg-[#f6f7f5] text-slate-900 font-sans">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenCreateModal={() => handleOpenCreateModalWithCity()}
      />

      <main className="pb-16">
        {activeTab === 'explore' && (
          <ExploreCitiesPage onOpenCreateModalWithCity={handleOpenCreateModalWithCity} />
        )}

        {activeTab === 'trips' && (
          <MyTripsPage
            onOpenCreateModal={() => handleOpenCreateModalWithCity()}
            onSelectTripForItinerary={handleSelectTripForItinerary}
            onSelectTripForBudget={handleSelectTripForBudget}
            refreshTrigger={tripRefreshCounter}
          />
        )}

        {activeTab === 'calendar' && <CalendarPlannerPage />}

        {activeTab === 'analytics' && (
          <AnalyticsDashboardPage onSelectTripForBudget={handleSelectTripForBudget} />
        )}

        {activeTab === 'profile' && (
          <ProfilePreferencesPage
            user={user}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryBuilderPage tripId={activeItineraryTripId} />
        )}

        {activeTab === 'budget' && selectedTripId && (
          <BudgetAnalyticsPage tripId={selectedTripId} />
        )}
      </main>

      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setModalCityId(null);
        }}
        onTripCreated={handleTripCreatedSuccess}
        initialCityId={modalCityId}
      />
    </div>
  );
}

export default App;
