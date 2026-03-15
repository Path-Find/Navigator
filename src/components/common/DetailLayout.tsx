import React from 'react';

interface DetailLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    maxWidth?: string;
}

export const DetailLayout: React.FC<DetailLayoutProps> = ({
    children,
    sidebar,
    maxWidth = 'max-w-6xl'
}) => {
    return (
        <div className="flex-1 p-4">
            <div className={`${maxWidth} mx-auto`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-8 self-start space-y-8">
                        {children}
                    </div>
                    {sidebar && (
                        <div className="lg:col-span-4">
                            <div className="sticky top-[136px] space-y-6">
                                {sidebar}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
