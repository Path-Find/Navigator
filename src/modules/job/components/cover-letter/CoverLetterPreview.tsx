import React from 'react';
import { PrintHeader } from '../../../../components/common/PrintHeader';

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
    return (
        <div 
            id={id} 
            className="bg-white p-12 shadow-sm border border-neutral-100 min-h-[11in] text-neutral-900 font-serif leading-relaxed"
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

                <div className="text-base text-neutral-800 leading-[1.65] font-serif space-y-5 whitespace-pre-wrap">
                    {content}
                </div>

                <div className="pt-12 space-y-1">
                    <p className="font-sans font-medium text-neutral-500 text-sm">Sincerely,</p>
                    <p className="font-sans font-bold text-neutral-900 text-lg tracking-tight">
                        {userProfile.name}
                    </p>
                </div>
            </div>
        </div>
    );
};
