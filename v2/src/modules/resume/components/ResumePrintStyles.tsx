import React from 'react';

export const ResumePrintStyles: React.FC = () => (
    <style>
        {`
            @media print {
                body {
                    background: white !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                .no-print {
                    display: none !important;
                }
                .print-only {
                    display: block !important;
                }
                .print-container {
                    display: block !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                #resume-preview {
                    display: block !important;
                    visibility: visible !important;
                    position: static !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .page-layout-root {
                    display: none !important;
                }
            }
        `}
    </style>
);

export default ResumePrintStyles;

