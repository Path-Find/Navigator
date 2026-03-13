import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ResumeProfile } from '../../../types';
import { Storage } from '../../../services/storageService';
import { parseResumeFile } from '../../../services/geminiService';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';

interface ResumeContextType {
    resumes: ResumeProfile[];
    isParsingResume: boolean;
    importError: string | null;
    isLoading: boolean;

    // Actions
    handleImportResume: (file: File) => Promise<void>;
    handleUpdateResume: (updatedResume: ResumeProfile) => Promise<void>;
    handleUpdateResumes: (resumes: ResumeProfile[]) => Promise<void>;
    handleDeleteResume: (id: string) => Promise<void>;
    setImportError: (error: string | null) => void;
    clearImportError: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResumeContext = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResumeContext must be used within a ResumeProvider');
    }
    return context;
};

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showSuccess, showError } = useToast();
    const { user } = useUser();
    const [resumes, setResumes] = useState<ResumeProfile[]>([]);
    const [isParsingResume, setIsParsingResume] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        Storage.getResumes().then(loadedResumes => {
            if (mounted) {
                setResumes(loadedResumes);
                setIsLoading(false);
            }
        }).catch(err => {
            console.error("Failed to load resumes:", err);
            if (mounted) {
                setIsLoading(false);
                showError("Failed to load resumes. Please refresh.");
            }
        });
        return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleImportResume = useCallback(async (file: File) => {
        setIsParsingResume(true);
        setImportError(null);
        try {
            // Wrap FileReader in promise — readAsDataURL is called INSIDE the promise
            // so that onload/onerror handlers are guaranteed to be set first
            await new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const result = reader.result as string;
                        if (!result || !result.includes(',')) {
                            throw new Error('Failed to read file: unexpected format');
                        }
                        const base64 = result.split(',')[1];
                        const blocks = await parseResumeFile(base64, file.type);

                        const newResume: ResumeProfile = {
                            id: crypto.randomUUID(),
                            name: file.name.replace(/\.[^/.]+$/, ""),
                            blocks
                        };

                        const updatedResumes = await Storage.addResume(newResume);
                        setResumes(updatedResumes);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsDataURL(file);
            });

        } catch (err) {
            console.error("Import Failed:", err);
            const message = (err as Error).message || "Failed to parse resume";
            setImportError(message);
            showError(message);
        } finally {
            setIsParsingResume(false);
        }
    }, [showError]);

    const handleUpdateResume = useCallback(async (updatedResume: ResumeProfile) => {
        try {
            const newResumes = resumes.map(r => r.id === updatedResume.id ? updatedResume : r);
            setResumes(newResumes);
            await Storage.saveResumes(newResumes);
        } catch (err) {
            console.error("Failed to update resume:", err);
            showError("Failed to save resume changes");
        }
    }, [resumes, showError]);

    const handleUpdateResumes = useCallback(async (newResumes: ResumeProfile[]) => {
        try {
            setResumes(newResumes);
            await Storage.saveResumes(newResumes);
        } catch (err) {
            console.error("Failed to save resumes:", err);
            showError("Failed to save changes");
        }
    }, [showError]);

    const handleDeleteResume = useCallback(async (id: string) => {
        try {
            const newResumes = resumes.filter(r => r.id !== id);
            setResumes(newResumes);
            await Storage.saveResumes(newResumes);
            showSuccess("Resume deleted");
        } catch (err) {
            console.error("Failed to delete resume:", err);
            showError("Failed to delete resume");
        }
    }, [resumes, showSuccess, showError]);

    const clearImportError = useCallback(() => {
        setImportError(null);
    }, []);

    return (
        <ResumeContext.Provider value={{
            resumes,
            isParsingResume,
            importError,
            isLoading,
            handleImportResume,
            handleUpdateResume,
            handleUpdateResumes,
            handleDeleteResume,
            setImportError,
            clearImportError
        }}>
            {children}
        </ResumeContext.Provider>
    );
};
