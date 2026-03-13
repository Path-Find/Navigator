import { useRef, useState } from 'react';
import { EventService } from '../../../services/eventService';
import { TRACKING_EVENTS } from '../../../constants';
import type { ToastContextValue } from '../../../contexts/ToastContext';

interface UseRoleModelUploadOptions {
    onAddRoleModel: (file: File) => Promise<void>;
    toast: Pick<ToastContextValue, 'showError'>;
}

export const useRoleModelUpload = ({ onAddRoleModel, toast }: UseRoleModelUploadOptions) => {
    const { showError } = toast;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    const handleFiles = async (files: File[]) => {
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                setUploadProgress({ current: i + 1, total: files.length });
                await onAddRoleModel(files[i]);
                EventService.trackUsage(TRACKING_EVENTS.COACH);
            }
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Failed to add role model.');
        } finally {
            setIsUploading(false);
            setUploadProgress({ current: 0, total: 0 });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    return {
        fileInputRef,
        isUploading,
        uploadProgress,
        handleFiles,
        handleFileChange,
        triggerUpload,
    };
};

