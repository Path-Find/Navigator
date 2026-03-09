import React from 'react';

// Context Providers
import { JobProvider } from './modules/job/context/JobContext';
import { ResumeProvider } from './modules/resume/context/ResumeContext';
import { CoachProvider } from './modules/career/context/CoachContext';
import { SkillProvider } from './modules/skills/context/SkillContext';
import { GlobalUIProvider } from './contexts/GlobalUIContext';
import { ModalProvider } from './contexts/ModalContext';

import { HelmetProvider } from 'react-helmet-async';
import { AppLayout } from './components/layout/AppLayout';
import { AppRoutes } from './components/layout/AppRoutes';
import { useTheme } from './hooks/useTheme';
import { ErrorBoundary } from './components/ErrorBoundary';

const App: React.FC = () => {
  // Theme Initialization
  useTheme();

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ModalProvider>
          <GlobalUIProvider>
            <SkillProvider>
              <ResumeProvider>
                <JobProvider>
                  <CoachProvider>
                    <AppLayout>
                      <AppRoutes />
                    </AppLayout>
                  </CoachProvider>
                </JobProvider>
              </ResumeProvider>
            </SkillProvider>
          </GlobalUIProvider>
        </ModalProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
