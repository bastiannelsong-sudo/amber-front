import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import salesService from '../services/sales.service';
import { salesKeys } from './useDailySales';
import type { DateRange, FaztTierInfo } from '../types/sales.types';

export type SyncPhase = 'idle' | 'syncing' | 'status_changes' | 'complete' | 'error';

export interface SyncProgress {
  isSync: boolean;
  currentDay: number;
  totalDays: number;
  currentDate: string;
  percentage: number;
  syncedOrders: number;
  statusChanges: number;
  error: string | null;
  phase: SyncPhase;
  faztTier: FaztTierInfo | null;
}

const initialProgress: SyncProgress = {
  isSync: false,
  currentDay: 0,
  totalDays: 0,
  currentDate: '',
  percentage: 0,
  syncedOrders: 0,
  statusChanges: 0,
  error: null,
  phase: 'idle',
  faztTier: null,
};

// Generate array of date strings (YYYY-MM-DD) between from and to (inclusive)
const generateDateArray = (from: string, to: string): string[] => {
  const dates: string[] = [];
  const current = new Date(from + 'T12:00:00');
  const end = new Date(to + 'T12:00:00');

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// Concurrency: number of days synced in parallel
const CONCURRENCY = 3;

export const useSyncDateRange = () => {
  const [progress, setProgress] = useState<SyncProgress>(initialProgress);
  const cancelledRef = useRef(false);
  const queryClient = useQueryClient();

  /**
   * Sync date range day-by-day with real progress tracking
   * Processes CONCURRENCY days in parallel for speed
   * Shows real percentage based on completed days
   */
  const syncDateRange = useCallback(
    async (dateRange: DateRange, sellerId: number): Promise<boolean> => {
      cancelledRef.current = false;

      const dates = generateDateArray(dateRange.from, dateRange.to);
      const totalDays = dates.length;

      if (totalDays === 0) {
        return false;
      }

      // Start progress
      setProgress({
        isSync: true,
        currentDay: 0,
        totalDays,
        currentDate: `${dateRange.from} → ${dateRange.to}`,
        percentage: 0,
        syncedOrders: 0,
        statusChanges: 0,
        error: null,
        phase: 'syncing',
        faztTier: null,
      });

      try {
        let completedDays = 0;
        let totalSynced = 0;
        let latestFaztTier: FaztTierInfo | null = null;

        // Process days in parallel batches of CONCURRENCY
        for (let i = 0; i < dates.length; i += CONCURRENCY) {
          // Check cancellation before each batch
          if (cancelledRef.current) {
            setProgress((prev) => ({
              ...prev,
              isSync: false,
              error: 'Sincronización cancelada',
              phase: 'error',
            }));
            return false;
          }

          const batch = dates.slice(i, i + CONCURRENCY);
          const results = await Promise.allSettled(
            batch.map((date) => salesService.syncFromMercadoLibre(date, sellerId))
          );

          for (const result of results) {
            completedDays++;
            if (result.status === 'fulfilled') {
              totalSynced += result.value.synced;
              // Capturar el último fazt_tier (el más reciente tiene el conteo final)
              if (result.value.fazt_tier) {
                latestFaztTier = result.value.fazt_tier;
              }
            }
          }

          // Update progress with real values (0-95% for day sync, 5% reserved for status changes)
          const dayPercentage = Math.round((completedDays / totalDays) * 95);
          setProgress((prev) => ({
            ...prev,
            currentDay: completedDays,
            percentage: dayPercentage,
            syncedOrders: totalSynced,
            faztTier: latestFaztTier,
            currentDate: completedDays < totalDays
              ? (dates[Math.min(completedDays, dates.length - 1)] ?? '')
              : `${dateRange.from} → ${dateRange.to}`,
          }));
        }

        // Check cancellation before status changes
        if (cancelledRef.current) {
          setProgress((prev) => ({
            ...prev,
            isSync: false,
            error: 'Sincronización cancelada',
            phase: 'error',
          }));
          return false;
        }

        // Phase 2: Check for status changes (last 5%)
        setProgress((prev) => ({
          ...prev,
          phase: 'status_changes',
          percentage: 95,
          currentDate: `${dateRange.from} → ${dateRange.to}`,
        }));

        let statusChangesCount = 0;
        try {
          const statusResult = await salesService.syncStatusChanges(dateRange, sellerId);
          statusChangesCount = statusResult.updated || 0;
        } catch (statusError) {
          // Status change check is non-critical, log but don't fail
          console.warn('Status changes check failed:', statusError);
        }

        // Invalidate query cache to refetch with new data
        await queryClient.invalidateQueries({
          queryKey: salesKeys.dateRange(dateRange.from, dateRange.to, sellerId),
        });

        // Complete!
        setProgress({
          isSync: false,
          currentDay: totalDays,
          totalDays,
          currentDate: `${dateRange.from} → ${dateRange.to}`,
          percentage: 100,
          syncedOrders: totalSynced,
          statusChanges: statusChangesCount,
          error: null,
          phase: 'complete',
          faztTier: latestFaztTier,
        });

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setProgress((prev) => ({
          ...prev,
          isSync: false,
          error: errorMessage,
          phase: 'error',
        }));
        return false;
      }
    },
    [queryClient]
  );

  const cancelSync = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
  }, []);

  return {
    progress,
    syncDateRange,
    cancelSync,
    resetProgress,
  };
};

export default useSyncDateRange;
