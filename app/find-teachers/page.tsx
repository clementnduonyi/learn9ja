
import prisma from '@/lib/prisma';
import StudentSearchForm from '@/components/teacher/search/StudentSearchForm';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';


export const metadata = {
    title: 'Learn9ja - Find teachers for your academic need',
};


export default async function FindTeachersPage() {
    const supabase = await createClient();
    // Optional: Protect route - ensure user is logged in and is a STUDENT
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login?message=Please login to find teachers');
    }
    // Optional: Check role if necessary

    // Fetch subjects for the dropdown
    const subjects = await prisma.subject.findMany({
        orderBy: { name: 'asc' }
    });


    

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Find Homework Help, Teacher for any Subject or Skill of your Interest</h1>
            <StudentSearchForm subjects={subjects} />
            {/* Results will be displayed within or below the form component */}
        </div>
    );
}