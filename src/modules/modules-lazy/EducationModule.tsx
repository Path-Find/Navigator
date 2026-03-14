import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { EducationDashboard } from '../grad/EducationDashboard';
import { AcademicHQ } from '../grad/AcademicHQ';
import { GPACalculatorPage } from '../grad/GPACalculatorPage';
import { ProgramExplorerPage } from '../grad/ProgramExplorerPage';

const EducationModule: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<EducationDashboard />} />
            <Route path="/transcript" element={<AcademicHQ />} />
            <Route path="/gpa" element={<GPACalculatorPage />} />
            <Route path="/programs" element={<ProgramExplorerPage />} />
        </Routes>
    );
};

export default EducationModule;
