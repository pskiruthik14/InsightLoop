import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { LandingPage } from './views/LandingPage';
import { OnboardingWizard } from './views/OnboardingWizard';
import { OverviewView } from './views/OverviewView';
import { InboxView } from './views/InboxView';
import { SentimentView } from './views/SentimentView';
import { TopicsView } from './views/TopicsView';
import { CustomerVoiceView } from './views/CustomerVoiceView';
import { RecommendationsView } from './views/RecommendationsView';
import { AlertsView } from './views/AlertsView';
import { SourcesView } from './views/SourcesView';
import { AnalyticsView } from './views/AnalyticsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

// Global Modals
import { ManualFeedbackModal } from './components/modals/ManualFeedbackModal';
import { CsvImportModal } from './components/modals/CsvImportModal';
import { AskDataDrawer } from './components/modals/AskDataDrawer';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { user, business, isLoading, refreshUser } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeAlertCount, setActiveAlertCount] = useState(3);

  // Modals state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [askDrawerOpen, setAskDrawerOpen] = useState(false);

  // Filter pass-through state (e.g. from TopicsView to InboxView)
  const [topicFilter, setTopicFilter] = useState('');

  // Fetch active alerts count for badge
  useEffect(() => {
    if (user) {
      api.getAlerts()
        .then((res) => setActiveAlertCount(res.active_count))
        .catch(() => {});
    }
  }, [user, currentTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center text-[#2D3A31] text-sm font-serif">
        {/* Paper Grain Overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#8C9A84] border-t-transparent animate-spin" />
          <div>
            <h2 className="font-serif font-semibold text-lg text-[#2D3A31]">InsightLoop</h2>
            <p className="font-sans text-xs text-[#8C9A84] tracking-wide mt-1">Cultivating customer intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Landing Page
  if (!user) {
    return <LandingPage onEnterApp={() => setCurrentTab('overview')} />;
  }

  // Logged in but onboarding not completed -> 5-Step Wizard
  if (business && !business.onboarding_completed) {
    return <OnboardingWizard onComplete={() => refreshUser()} />;
  }

  const handleFilterTopicAndNavigate = (topicName: string) => {
    setTopicFilter(topicName);
    setGlobalSearch(topicName);
    setCurrentTab('inbox');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#2D3A31] flex flex-col font-sans relative selection:bg-[#DCCFC2] selection:text-[#2D3A31]">
      {/* Paper Grain Texture (Botanical Essence) */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Persistent Sidebar */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(t) => {
              setCurrentTab(t);
              setGlobalSearch('');
            }}
            activeAlertCount={activeAlertCount}
          />
        </div>

        {/* Mobile Slide-Over Navigation */}
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          currentTab={currentTab}
          onSelectTab={(t) => {
            setCurrentTab(t);
            setGlobalSearch('');
          }}
          activeAlertCount={activeAlertCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <Header
            searchQuery={globalSearch}
            onSearchChange={(q) => {
              setGlobalSearch(q);
              if (q.trim() && currentTab !== 'inbox') {
                setCurrentTab('inbox');
              }
            }}
            onOpenAddModal={() => setManualModalOpen(true)}
            onOpenImportModal={() => setCsvModalOpen(true)}
            onOpenAskDrawer={() => setAskDrawerOpen(true)}
            onOpenAlerts={() => setCurrentTab('alerts')}
            onToggleMobileNav={() => setMobileNavOpen(true)}
            activeAlertCount={activeAlertCount}
          />

          {/* View Container */}
          <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1">
            {currentTab === 'overview' && (
              <OverviewView
                onNavigateTab={(t) => setCurrentTab(t)}
                onOpenAskDrawer={() => setAskDrawerOpen(true)}
              />
            )}
            {currentTab === 'inbox' && (
              <InboxView
                searchQuery={globalSearch}
                onOpenAddModal={() => setManualModalOpen(true)}
              />
            )}
            {currentTab === 'sentiment' && <SentimentView />}
            {currentTab === 'topics' && (
              <TopicsView
                onFilterByTopic={handleFilterTopicAndNavigate}
                onNavigateTab={(t) => setCurrentTab(t)}
              />
            )}
            {currentTab === 'voice' && <CustomerVoiceView />}
            {currentTab === 'recommendations' && <RecommendationsView />}
            {currentTab === 'alerts' && <AlertsView />}
            {currentTab === 'sources' && (
              <SourcesView
                onOpenImportModal={() => setCsvModalOpen(true)}
                onOpenAddModal={() => setManualModalOpen(true)}
              />
            )}
            {currentTab === 'analytics' && <AnalyticsView />}
            {currentTab === 'reports' && <ReportsView />}
            {currentTab === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <ManualFeedbackModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onSuccess={() => {
          if (currentTab === 'inbox' || currentTab === 'overview') {
            window.location.reload();
          }
        }}
      />

      <CsvImportModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onSuccess={() => {
          if (currentTab === 'inbox' || currentTab === 'overview') {
            window.location.reload();
          }
        }}
      />

      <AskDataDrawer
        isOpen={askDrawerOpen}
        onClose={() => setAskDrawerOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
