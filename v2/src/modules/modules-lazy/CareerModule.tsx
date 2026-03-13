import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CoachProvider } from '../career/context/CoachContext';
import { CoachDashboard } from '../career/CoachDashboard';
import { SkillsView } from '../../components/skills/SkillsView';
import { SkillInterviewPage } from '../skills/SkillInterviewPage';

const CareerModule: React.FC = () => {
    return (
        <CoachProvider>
            <Routes>
                <Route path="/career/*" element={<CoachDashboard />} />
                <Route path="/skills" element={<SkillsView />} />
                <Route path="/skills/interview" element={<SkillInterviewPage />} />
            </Routes>
        </CoachProvider>
    );
};

export default CareerModule;
