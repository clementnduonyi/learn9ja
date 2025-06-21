"use client"

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Role } from "@prisma/client";
import React, { useState } from 'react';



const RoleSelection = () => {
  const [role, setRole] = useState<Role | ''>('');
  return (
    <div className="space-y-4">
      <h3 className="text-center font-medium text-lg">I want to join as:</h3>
      
      <RadioGroup value={role} onValueChange={(value) => setRole(value as Role)} className="grid grid-cols-2 gap-4">
        <div
          className="p-4 border border-gray-200 rounded-lg text-center hover:border-learn9ja-green hover:bg-learn9ja-green/5 transition-all focus:outline-none focus:ring-2 focus:ring-learn9ja-green"
        >
          <div className="text-xl font-medium">👨‍🎓</div>
          <div className="mt-2 font-medium">Student</div>
          <RadioGroupItem value="STUDENT" id="role-student" />
          <p className="mt-1 text-xs text-gray-500">Find teachers and take classes</p>
        </div>
        
        <div
          className="p-4 border border-gray-200 rounded-lg text-center hover:border-learn9ja-green hover:bg-learn9ja-green/5 transition-all focus:outline-none focus:ring-2 focus:ring-learn9ja-green"
        >
          <div className="text-xl font-medium">👩‍🏫</div>
          <div className="mt-2 font-medium">Teacher</div>
          <RadioGroupItem value="TEACHER" id="role-teacher" />
          <p className="mt-1 text-xs text-gray-500">Offer your expertise and earn</p>
        </div>
      </RadioGroup>
    </div>
  );
};

export default RoleSelection;

