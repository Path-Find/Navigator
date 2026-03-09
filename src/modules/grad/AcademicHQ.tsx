import React from 'react';
import { GraduationCap, Zap } from 'lucide-react';

import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { CourseEditModal } from '../../components/edu/CourseEditModal';
import { useAcademicLogic } from './hooks/useAcademicLogic';

// Refactored Components
import { AcademicHero } from './components/AcademicHero';
import { AcademicProfileSummary } from './components/AcademicProfileSummary';
import { CourseRegistry } from './components/CourseRegistry';
import { GlobalDragOverlay } from '../../components/common/GlobalDragOverlay';

export const AcademicHQ: React.FC = () => {
    const {
        transcript,
        setTranscript,
        targetCredits,
        setTargetCredits,
        tempTranscript,
        showVerification,
        setShowVerification,
        editingCourse,
        setEditingCourse,
        handleFileUpload,
        isParsing,
        parseError,
        handleVerificationSave,
        handleCourseUpdate,
        handleCourseDelete,
        totalCredits,
        progressPercentage,
        calculatedGpa,
        addSemester,
        deleteSemester,
        addCourse
    } = useAcademicLogic();

    return (
        <SharedPageLayout maxWidth="full" className="relative">
            <GlobalDragOverlay onDrop={handleFileUpload} />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {!transcript ? (
                    <AcademicHero
                        handleFileUpload={handleFileUpload}
                        isParsing={isParsing}
                        parseError={parseError}
                        tempTranscript={tempTranscript}
                        showVerification={showVerification}
                        setShowVerification={setShowVerification}
                        handleVerificationSave={handleVerificationSave}
                        title="Import Transcript"
                        description="Start your academic profile by uploading your official records"
                        cards={{
                            foundation: {
                                title: "Verified Records",
                                description: "Every course is parsed with extreme care. We ensure your official history is perfectly represented.",
                                icon: GraduationCap,
                                benefits: ['Academic Accuracy', 'Course Mapping', 'Secure Storage']
                            },
                            intelligence: {
                                title: "Progress Audit",
                                description: "Instantly see how many credits you've completed and what's remaining for your degree.",
                                icon: Zap,
                                benefits: ['Credit Tally', 'Requirement Check', 'Degree Path']
                            }
                        }}
                    />
                ) : (
                    <div className="space-y-12">
                        <AcademicProfileSummary
                            transcript={transcript}
                            targetCredits={targetCredits}
                            setTargetCredits={setTargetCredits}
                            totalCredits={totalCredits}
                            progressPercentage={progressPercentage}
                            gpa={calculatedGpa}
                        />

                        <div className="space-y-8">
                            <CourseRegistry
                                transcript={transcript}
                                setTranscript={setTranscript}
                                setEditingCourse={setEditingCourse}
                                addSemester={addSemester}
                                deleteSemester={deleteSemester}
                                addCourse={addCourse}
                            />
                        </div>
                    </div>
                )}

                {editingCourse && (
                    <CourseEditModal
                        isOpen={!!editingCourse}
                        onClose={() => setEditingCourse(null)}
                        course={editingCourse.course}
                        currentSemIndex={editingCourse.semIndex}
                        availableSemesters={transcript?.semesters || []}
                        onSave={handleCourseUpdate}
                        onDelete={handleCourseDelete}
                    />
                )}
            </div>
        </SharedPageLayout>
    );
};
