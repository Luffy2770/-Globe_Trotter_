import { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage';
import { Navbar } from './components/Navbar';
import { ExploreCitiesPage } from './pages/ExploreCitiesPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { ProfilePreferencesPage } from './pages/ProfilePreferencesPage';
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage';
import { BudgetAnalyticsPage } from './pages/BudgetAnalyticsPage';
import { CreateTripModal } from './pages/CreateTripModal';

export function App() {
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('explore');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalCityId, setModalCityId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  }, [user]);

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

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

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
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePreferencesPage
            user={user}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'itinerary' && selectedTripId && (
          <ItineraryBuilderPage tripId={selectedTripId} />
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
        onTripCreated={() => setActiveTab('trips')}
        initialCityId={modalCityId}
      />
    </div>
  );
}

export default App;
