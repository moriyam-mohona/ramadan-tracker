import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type PendingAction = {
    id: string; // Unique ID for deduplication
    day: number;
    activity: string;
    status: boolean;
    timestamp: number;
};

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // Initial check
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
             setIsOnline(true);
             syncPendingActions();
        };

        const handleOffline = () => {
             setIsOnline(false);
             toast.info("You are offline. Changes will be saved locally.", { id: 'offline-mode' });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const saveActionOffline = (day: number, activity: string, status: boolean) => {
        const action: PendingAction = {
            id: `${day}-${activity}-${Date.now()}`,
            day,
            activity,
            status,
            timestamp: Date.now(),
        };

        const existing = JSON.parse(localStorage.getItem('pendingActions') || '[]');
        
        // Remove any previous pending action for the exact same day/activity to avoid conflicts
        // We only care about the *latest* state for a specific toggle
        const filtered = existing.filter((a: PendingAction) => !(a.day === day && a.activity === activity));
        
        localStorage.setItem('pendingActions', JSON.stringify([...filtered, action]));
        
        // toast.success("Saved to device (Offline)", { icon: '💾' }); // Optional: could be noisy
    };

    const syncPendingActions = async () => {
        const pending = JSON.parse(localStorage.getItem('pendingActions') || '[]');
        if (pending.length === 0) return;

        setIsSyncing(true);
        const toastId = toast.loading('Syncing offline changes...', { id: 'sync-toast' });

        try {
            // We need to import the server action dynamically or pass it in. 
            // Better to pass the "sync" function as a callback to the hook or import it here if possible. 
            // BUT server actions imported in client components (hooks) work fine.
            // However, to avoid circular deps or complex imports, let's just use the server action directly.
            // Dynamic import of server action
            const { toggleActivity } = await import('@/actions'); 

            let successCount = 0;

            // Process sequentially to ensure order (though filtering above helps)
            for (const action of pending) {
                try {
                    await toggleActivity(action.day, action.activity, action.status); // We need a version that doesn't revalidate path endlessly? 
                    // The standard action revalidates path, which is fine.
                    successCount++;
                } catch (error) {
                    console.error("Failed to sync action:", action, error);
                    // Decide: keep in queue or discard? For now, discard to avoid stuck queue.
                }
            }

            localStorage.removeItem('pendingActions');
            toast.success(`Synced ${successCount} updates!`, { id: toastId });

        } catch (error) {
            console.error("Sync failed", error);
            toast.error("Sync failed. Will retry later.", { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    };

    return { isOnline, isSyncing, saveActionOffline };
}
