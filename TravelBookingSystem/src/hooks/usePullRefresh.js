import React, { useState } from "react";
import { RefreshControl } from "react-native";

export default function usePullRefresh(fetcher) {
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await fetcher();
    } finally {
      setRefreshing(false);
    }
  }

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  );

  return { refreshing, onRefresh, refreshControl };
}
