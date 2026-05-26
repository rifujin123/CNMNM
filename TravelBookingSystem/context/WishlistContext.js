import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { addWishlist, fetchWishlist, removeWishlist, fetchWishListItems } from '../src/api/services';

const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = 'wishlist_ids';

export function WishlistProvider({ children }) {
  const { token, role } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist on mount and when token changes
  useEffect(() => {
    if (token) {
      loadWishlist();
    } else {
      setWishlistIds([]);
      setSavedItems([]);
      AsyncStorage.removeItem(WISHLIST_STORAGE_KEY);
    }
  }, [token]);

  const loadWishlist = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const [ids, items] = await Promise.all([
        fetchWishlist({ token }),
        fetchWishListItems({ token }),
      ]);
      setWishlistIds(ids);
      setSavedItems(items);
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      console.error('Load wishlist error:', err);
      setError(err.message);
      // Fallback to cached data
      try {
        const cached = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
        if (cached) {
          setWishlistIds(JSON.parse(cached));
        }
      } catch (e) {
        console.error('Fallback cache error:', e);
      }
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  const addToWishlist = async (itemOrId) => {
    const tourId = typeof itemOrId === 'object' ? itemOrId?.id : itemOrId;
    if (!token || !tourId) return;
    try {
      setError(null);
      await addWishlist({ token, tourId });
      const newIds = [...wishlistIds, String(tourId)];
      setWishlistIds(newIds);

      if (itemOrId && typeof itemOrId === 'object') {
        setSavedItems((current) => {
          const exists = current.some((item) => String(item?.id) === String(tourId));
          if (exists) return current;
          return [itemOrId, ...current];
        });
      }

      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newIds));
    } catch (err) {
      console.error('Add wishlist error:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeFromWishlist = async (tourId) => {
    if (!token || !tourId) return;
    try {
      setError(null);
      await removeWishlist({ token, tourId });
      const newIds = wishlistIds.filter((id) => String(id) !== String(tourId));
      setWishlistIds(newIds);
      setSavedItems((current) =>
        current.filter((item) => String(item?.id) !== String(tourId))
      );
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newIds));
    } catch (err) {
      console.error('Remove wishlist error:', err);
      setError(err.message);
      throw err;
    }
  };

  const isWishlisted = (tourId) => {
    return wishlistIds.some((id) => String(id) === String(tourId));
  };

  const toggleWishlist = async (item) => {
    const tourId = item?.id;
    if (!tourId || !token) return;

    try {
      if (isWishlisted(tourId)) {
        await removeFromWishlist(tourId);
      } else {
        await addToWishlist(tourId);
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err);
    }
  };

  const value = {
    wishlistIds,
    savedItems,
    isLoading,
    isRefetching,
    error,
    isWishlisted,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    refetch: () => loadWishlist(true),
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside <WishlistProvider>');
  }
  return context;
}
