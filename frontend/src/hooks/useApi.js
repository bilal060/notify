import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ERROR_MESSAGES } from '../constants';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showLoading = true, 
      showError = true, 
      showSuccess = false,
      successMessage = 'Operation completed successfully',
      errorMessage = null,
      onSuccess = null,
      onError = null,
    } = options;

    try {
      setError(null);
      if (showLoading) setLoading(true);

      const result = await apiCall();

      if (showSuccess && successMessage) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result };
    } catch (err) {
      const message = errorMessage || err.message || ERROR_MESSAGES.SERVER_ERROR;
      setError(message);

      if (showError) {
        toast.error(message);
      }

      if (onError) {
        onError(err);
      }

      return { success: false, error: message };
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    resetError,
  };
};

// Specific hooks for common operations
export const useDataFetching = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const { loading, error, execute, resetError } = useApi();

  const fetchData = useCallback(async () => {
    const result = await execute(apiCall, { showError: true });
    if (result.success) {
      setData(result.data);
    }
  }, [execute, apiCall]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    refresh,
    resetError,
  };
};

export const useMutation = (apiCall, options = {}) => {
  const { loading, error, execute, resetError } = useApi();

  const mutate = useCallback(async (params) => {
    const result = await execute(() => apiCall(params), {
      showLoading: true,
      showError: true,
      showSuccess: true,
      ...options,
    });
    return result;
  }, [execute, apiCall, options]);

  return {
    loading,
    error,
    mutate,
    resetError,
  };
};

// Hook for paginated data
export const usePaginatedApi = (apiCall, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [filters, setFilters] = useState(initialParams);

  const loadData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall({ ...filters, ...params });
      
      if (result.success) {
        const responseData = result.data;
        
        // Handle different response formats
        if (Array.isArray(responseData)) {
          setData(responseData);
          setPagination(prev => ({ ...prev, totalItems: responseData.length }));
        } else if (responseData.data && Array.isArray(responseData.data)) {
          setData(responseData.data);
          setPagination({
            currentPage: responseData.pagination?.currentPage || 1,
            totalPages: responseData.pagination?.totalPages || 1,
            totalItems: responseData.pagination?.totalItems || responseData.data.length,
            itemsPerPage: responseData.pagination?.itemsPerPage || 20,
          });
        } else {
          setData([]);
          setPagination(prev => ({ ...prev, totalItems: 0 }));
        }
        
        setError(null);
        return responseData;
      } else {
        setError(result.error);
        toast.error(result.error.message || 'Failed to load data');
        return null;
      }
    } catch (err) {
      const errorObj = {
        type: 'UNKNOWN_ERROR',
        message: err.message || 'An unexpected error occurred',
        original: err,
      };
      setError(errorObj);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiCall, filters]);

  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    loadData({ page });
  }, [loadData]);

  const changeFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadData({ ...newFilters, page: 1 });
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData({ page: pagination.currentPage });
  }, [loadData, pagination.currentPage]);

  // Initial load
  useEffect(() => {
    loadData({ page: 1 });
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    loadData,
    changePage,
    changeFilters,
    refresh,
  };
};

// Hook for search functionality
export const useSearch = (data, searchFields = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    setFilteredData(filtered);
  }, [data, searchTerm, searchFields]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
}; 