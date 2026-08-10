import React from 'react';
import { PrintHeader } from '../../../../components/common/PrintHeader';
import { finalizeCoverLetterOutput } from '../../../../services/ai/jobAiService';

interface CoverLetterPreviewProps {
    id: string;
    content: string;
    date: string;
    roleTitle: string;
    recipientName?: string;
    recipientTitle?: string;
    companyName?: string;
    userProfile: {
        name: string;
        email: string;
        phone?: string;
        location?: string;
    };
}

export const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({
    id,
    content,
    date,
    roleTitle,
    recipientName,
    recipientTitle,
    companyName,
    userProfile
}) => {
    const finalizedContent = finalizeCoverLetterOutput(content, userProfile.name);

    return (
        <div 
            id={id} 
            className="bg-white p-12 shadow-sm border border-neutral-100 min-h-[11in] text-neutral-900 leading-relaxed"
        >
            <PrintHeader 
                name={userProfile.name}
                email={userProfile.email}
                phone={userProfile.phone}
                location={userProfile.location}
                highlight={roleTitle}
            />

            <div className="space-y-6 max-w-2xl mx-auto pt-4">
                <div className="text-sm font-sans font-medium text-neutral-900 mb-8 border-l-2 border-neutral-100 pl-4 py-1">
                    {date}
                </div>

                <div className="text-sm font-sans space-y-1 mb-8">
                    {recipientName && <p className="font-bold text-neutral-900">{recipientName}</p>}
                    {recipientTitle && <p className="text-neutral-600">{recipientTitle}</p>}
                    {companyName && <p className="text-neutral-700">{companyName}</p>}
                </div>

                <div className="text-base text-neutral-800 leading-[1.65] space-y-5 whitespace-pre-wrap">
                    {finalizedContent}
                </div>
            </div>
        </div>
    );
};
