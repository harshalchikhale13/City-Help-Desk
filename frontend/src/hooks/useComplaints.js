/**
 * useComplaints Hook
 * Manages complaint data fetching, filtering, and state management
 */

import { useState, useEffect, useCallback } from 'react';

export const useComplaints = (token) => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sortBy: 'date', // date, priority, status
  });

  const API_URL = 'http://localhost:5000/api';

  /**
   * Fetch all complaints
   */
  const fetchComplaints = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const complaintsList = data.data.complaints || [];
        setComplaints(complaintsList);
        applyFilters(complaintsList, filters);
      } else {
        setError('Failed to fetch complaints');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Get single complaint by ID
   */
  const getComplaintById = useCallback(
    async (id) => {
      if (!token) return null;
      
      try {
        const response = await fetch(`${API_URL}/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          return data.data.complaint;
        }
      } catch (err) {
        console.error('Error fetching complaint:', err);
      }
      return null;
    },
    [token]
  );

  /**
   * Apply filters and sorting
   */
  const applyFilters = useCallback((complaintsList, filterObj) => {
    let filtered = complaintsList;

    // Search filter
    if (filterObj.search) {
      const searchLower = filterObj.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.id.toString().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower) ||
          (c.category && c.category.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filterObj.status) {
      filtered = filtered.filter((c) => c.status === filterObj.status);
    }

    // Priority filter
    if (filterObj.priority) {
      filtered = filtered.filter((c) => c.priority === filterObj.priority);
    }

    // Sorting
    switch (filterObj.sortBy) {
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'status':
        const statusOrder = { submitted: 0, in_progress: 1, resolved: 2, closed: 3 };
        filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredComplaints(filtered);
  }, []);

  /**
   * Update filter and reapply
   */
  const updateFilter = useCallback(
    (filterKey, value) => {
      const newFilters = { ...filters, [filterKey]: value };
      setFilters(newFilters);
      applyFilters(complaints, newFilters);
    },
    [filters, complaints, applyFilters]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      search: '',
      status: '',
      priority: '',
      sortBy: 'date',
    };
    setFilters(clearedFilters);
    applyFilters(complaints, clearedFilters);
  }, [complaints, applyFilters]);

  /**
   * Get complaint statistics
   */
  const getStatistics = useCallback(() => {
    return {
      total: complaints.length,
      submitted: complaints.filter((c) => c.status === 'submitted').length,
      inProgress: complaints.filter((c) => c.status === 'in_progress').length,
      resolved: complaints.filter((c) => c.status === 'resolved').length,
      closed: complaints.filter((c) => c.status === 'closed').length,
      highPriority: complaints.filter((c) => c.priority === 'high').length,
    };
  }, [complaints]);

  /**
   * Get recent complaints
   */
  const getRecentComplaints = useCallback((count = 5) => {
    return complaints
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, count);
  }, [complaints]);

  /**
   * Get complaints by status
   */
  const getByStatus = useCallback((status) => {
    return complaints.filter((c) => c.status === status);
  }, [complaints]);

  /**
   * Get complaints by priority
   */
  const getByPriority = useCallback((priority) => {
    return complaints.filter((c) => c.priority === priority);
  }, [complaints]);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return {
    // Data
    complaints,
    filteredComplaints,
    loading,
    error,
    filters,

    // Functions
    fetchComplaints,
    getComplaintById,
    updateFilter,
    clearFilters,
    getStatistics,
    getRecentComplaints,
    getByStatus,
    getByPriority,
  };
};

export default useComplaints;
