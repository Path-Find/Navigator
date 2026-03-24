import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface PrintHeaderProps {
    name: string;
    email: string;
    phone?: string;
    website?: string;
    location?: string;
    highlight?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ 
    name, email, phone, website, location, highlight 
}) => {
    return (
        <div className="flex flex-col mb-8 border-b-2 border-neutral-100 pb-6 print:m-0">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                        {name}
                    </h1>
                    {highlight && (
                        <p className="text-lg font-medium text-accent-primary-hex tracking-tight">
                            {highlight}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600 font-medium">
                {email && (
                    <div className="flex items-center gap-1.5 min-w-max">
                        <Mail className="w-3.5 h-3.5 opacity-40 shrink-0" />
                        <span className="whitespace-nowrap">{email}</span>
                    </div>
                )}
                {phone && (
                    <div className="flex items-center gap-1.5 min-w-max">
                        <Phone className="w-3.5 h-3.5 opacity-40 shrink-0" />
                        <span className="whitespace-nowrap">{phone}</span>
                    </div>
                )}
                {location && (
                    <div className="flex items-center gap-1.5 min-w-max">
                        <MapPin className="w-3.5 h-3.5 opacity-40 shrink-0" />
                        <span className="whitespace-nowrap">{location}</span>
                    </div>
                )}
                {website && (
                    <div className="flex items-center gap-1.5 min-w-max">
                        <Globe className="w-3.5 h-3.5 opacity-40 shrink-0" />
                        <span className="whitespace-nowrap lowercase">
                            {website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
