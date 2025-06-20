'use client';

import { createClient } from '@/lib/supabase/client'; // Client component client
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redirect to home
    router.refresh(); // Refresh server components to reflect logout
  };

  return (
    <Button onClick={handleLogout} variant="outline" size="sm">
      Logout
    </Button>
  );
}