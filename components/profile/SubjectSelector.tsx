// src/components/profile/SubjectSelector.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
// Removed Level enum import
import type { Subject } from '@prisma/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Use Input for levels
import { Checkbox } from '@/components/ui/checkbox'; // Keep Checkbox for selecting SUBJECTS

// --- Types ---
// New structure to represent selected subjects and their specific levels
export interface SubjectLevelsSelection {
  [subjectId: string]: string[]; // Map subjectId to array of level strings
}

interface SubjectSelectorProps {
  allSubjects: Subject[];
  // Initial selection should now match the new structure
  initialSelection: SubjectLevelsSelection;
  onChange: (newSelection: SubjectLevelsSelection) => void; // Callback with new structure
}

// --- Component ---
export default function SubjectSelector({
  allSubjects,
  initialSelection,
  onChange,
}: SubjectSelectorProps) {
  // State holds the map of subjectId -> levels array
  const [selectedSubjectLevels, setSelectedSubjectLevels] = useState<SubjectLevelsSelection>(initialSelection);

  // Notify parent component when selection changes
  useEffect(() => {
    onChange(selectedSubjectLevels);
  }, [selectedSubjectLevels, onChange]);

  // --- Handler for when the levels input changes for a subject ---
  const handleLevelsChange = useCallback((subjectId: string, levelsString: string) => {
    // Split comma-separated string, trim whitespace, filter empty strings
    const levelsArray = levelsString.split(',')
                                    .map(level => level.trim())
                                    .filter(level => level.length > 0);

    setSelectedSubjectLevels(prev => ({
      ...prev,
      [subjectId]: levelsArray, // Update the levels array for this subjectId
    }));
  }, []);

  // --- Handler for selecting/deselecting a subject entirely ---
  const handleSubjectToggle = useCallback((subjectId: string, isChecked: boolean) => {
      setSelectedSubjectLevels(prev => {
          const newState = { ...prev };
          if (isChecked) {
              // Add subject with empty levels array if it wasn't selected before
              if (!newState[subjectId]) {
                  newState[subjectId] = [];
              }
          } else {
              // Remove subject entirely if unchecked
              delete newState[subjectId];
          }
          return newState;
      });
  }, []);


  // --- Render ---
  return (
    <div>
      <Label className="text-lg font-semibold">Subjects and Levels You Teach</Label>
      <p className="text-sm text-gray-500 mb-3">Select the subjects you teach. For each selected subject, enter the specific levels you cover (e.g., JSS1, SS2, Primary 6, JAMB Prep), separated by commas.</p>
      <div className="mt-3 space-y-4">
        {allSubjects.map((subject) => {
          // Check if this subject is currently selected (exists as a key in state)
          const isSubjectSelected = selectedSubjectLevels.hasOwnProperty(subject.id);
          // Get the current levels string for the input field
          const currentLevelsString = (selectedSubjectLevels[subject.id] ?? []).join(', ');

          return (
            <div key={subject.id} className="p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex items-center mb-3">
                 {/* Checkbox to enable/disable teaching this subject */}
                 <Checkbox
                    id={`subject-toggle-${subject.id}`}
                    checked={isSubjectSelected}
                    onCheckedChange={(checked) => handleSubjectToggle(subject.id, !!checked)}
                    aria-labelledby={`subject-label-${subject.id}`}
                 />
                 <Label
                    id={`subject-label-${subject.id}`}
                    htmlFor={`subject-toggle-${subject.id}`}
                    className="ml-3 font-semibold text-gray-800 text-base cursor-pointer"
                 >
                    {subject.name}
                 </Label>
              </div>

              {/* Only show level input if the subject is selected */}
              {isSubjectSelected && (
                <div className="pl-7"> {/* Indent level input */}
                  <Label htmlFor={`levels-${subject.id}`} className="text-sm font-medium text-gray-600">
                    Specific Levels Taught (comma-separated):
                  </Label>
                  <Input
                    id={`levels-${subject.id}`}
                    type="text"
                    value={currentLevelsString}
                    onChange={(e) => handleLevelsChange(subject.id, e.target.value)}
                    placeholder="e.g., JSS1, JSS2, SS1, WAEC Prep"
                    className="mt-1 text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

