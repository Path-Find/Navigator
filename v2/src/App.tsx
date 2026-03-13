import React from 'react';

// Context Providers
import { GlobalUIProvider } from './contexts/GlobalUIContext';
import { ModalProvider } from './contexts/ModalContext';

import { HelmetProvider } from 'react-helmet-async';
import { AppLayout } from './components/layout/AppLayout';
import { AppRoutes } from './components/layout/AppRoutes';
import { useTheme } from './hooks/useTheme';
import { ErrorBoundary } from './components/ErrorBoundary';

// Data Providers
import { JobProvider } from './modules/job/context/JobContext';
import { SkillProvider } from './modules/skills/context/SkillContext';
import { ResumeProvider } from './modules/resume/context/ResumeContext';

const App: React.FC = () => {
  // Theme Initialization
  useTheme();

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <JobProvider>
          <SkillProvider>
            <ResumeProvider>
              <ModalProvider>
                <GlobalUIProvider>
                  <AppLayout>
                    <AppRoutes />
                  </AppLayout>
                </GlobalUIProvider>
              </ModalProvider>
            </ResumeProvider>
          </SkillProvider>
        </JobProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
