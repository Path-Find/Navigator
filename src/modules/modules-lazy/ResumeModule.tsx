import React from 'react';
import { ResumeProvider } from '../resume/context/ResumeContext';
import { ResumeEditor } from '../resume/ResumeEditor';

const ResumeModule: React.FC = () => {
    return (
        <ResumeProvider>
            <ResumeEditor />
        </ResumeProvider>
    );
};

export default ResumeModule;
