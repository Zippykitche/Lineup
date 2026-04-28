import { useState, useEffect, useCallback } from 'react';
import { api, QueryParams, AppError } from '../api';
import { Event } from '../app/types';

/**
 * Example Hook for managing events
 */
export function useEvents(initialParams?: QueryParams) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [params, setParams] = useState<QueryParams>(initialParams || { page: 1, limit: 10 });
  const [total, setTotal] = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getEvents(params);
      setEvents(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err as AppError);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = async (event: Partial<Event>) => {
    try {
      await api.createEvent(event);
      fetchEvents(); // Refresh list
    } catch (err) {
      setError(err as AppError);
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    total,
    params,
    setParams,
    refresh: fetchEvents,
    addEvent,
  };
}
