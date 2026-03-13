import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { FeatureDefinition } from '../featureRegistry';

export type ModalType = 'AUTH' | 'UPGRADE' | 'INTERVIEW' | null;

export interface ModalData {
    feature?: FeatureDefinition;
    initialView?: 'upgrade' | 'compare';
    authMode?: 'sign-in' | 'sign-up';
}

interface ModalContextType {
    activeModal: ModalType;
    modalData: ModalData | null;
    openModal: (type: ModalType, data?: ModalData | null) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [modalData, setModalData] = useState<ModalData | null>(null);

    const openModal = useCallback((type: ModalType, data: ModalData | null = null) => {
        setActiveModal(type);
        setModalData(data);
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setModalData(null);
    }, []);

    return (
        <ModalContext.Provider value={{ activeModal, modalData, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};
