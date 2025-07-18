import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import { STORAGE_KEYS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import api from '../services/apiService';

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  UPDATE_USER: 'UPDATE_USER',
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: action.payload.user.isAdmin || action.payload.user.role === 'admin',
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: action.payload.user.isAdmin || action.payload.user.role === 'admin',
        loading: false,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadStoredUser = () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
        
        if (token && user) {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: { user, token },
          });
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
        logout();
      }
    };

    loadStoredUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const data = await api.login(credentials);
      
      if (data.success) {
        const { user, token } = data.data;
        
        // Check if user is admin
        if (!user.isAdmin && user.role !== 'admin') {
          throw new Error('Access denied. Admin privileges required.');
        }

        // Store in localStorage
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
        return { success: true };
      } else {
        throw new Error(data.message || ERROR_MESSAGES.UNAUTHORIZED);
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
  };

  // Update user function
  const updateUser = (updates) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: updates,
    });
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.isAdmin;
  };

  // Get user info
  const getUser = () => {
    return state.user;
  };

  // Get token
  const getToken = () => {
    return state.token;
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    isAdmin,
    getUser,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 