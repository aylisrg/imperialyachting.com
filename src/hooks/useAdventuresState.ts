"use client";

import { useReducer, useMemo, useCallback } from "react";
import type { Destination, TimeOfDay, DestinationCategory } from "@/types/common";
import { filterByTimeOfDay, filterByCategory } from "@/lib/adventures";

export type DrawerTab = "overview" | "route" | "expect" | "price";

interface AdventuresState {
  view: "map" | "catalog";
  selectedSlug: string | null;
  hoveredSlug: string | null;
  activeTimeFilter: TimeOfDay | null;
  activeCategoryFilter: DestinationCategory | null;
  drawerOpen: boolean;
  drawerTab: DrawerTab;
}

type AdventuresAction =
  | { type: "SET_VIEW"; view: "map" | "catalog" }
  | { type: "SELECT_ITEM"; slug: string }
  | { type: "DESELECT_ITEM" }
  | { type: "HOVER_ITEM"; slug: string | null }
  | { type: "SET_TIME_FILTER"; time: TimeOfDay | null }
  | { type: "SET_CATEGORY_FILTER"; category: DestinationCategory | null }
  | { type: "OPEN_DRAWER"; slug: string; tab?: DrawerTab }
  | { type: "CLOSE_DRAWER" }
  | { type: "SET_DRAWER_TAB"; tab: DrawerTab };

const initialState: AdventuresState = {
  view: "map",
  selectedSlug: null,
  hoveredSlug: null,
  activeTimeFilter: null,
  activeCategoryFilter: null,
  drawerOpen: false,
  drawerTab: "overview",
};

function adventuresReducer(
  state: AdventuresState,
  action: AdventuresAction
): AdventuresState {
  switch (action.type) {
    case "SET_VIEW":
      return {
        ...state,
        view: action.view,
        drawerOpen: false,
        selectedSlug: null,
        hoveredSlug: null,
      };

    case "SELECT_ITEM":
      return {
        ...state,
        selectedSlug: action.slug,
        drawerOpen: true,
        drawerTab: "overview",
      };

    case "DESELECT_ITEM":
      return {
        ...state,
        selectedSlug: null,
        drawerOpen: false,
      };

    case "HOVER_ITEM":
      return {
        ...state,
        hoveredSlug: action.slug,
      };

    case "SET_TIME_FILTER":
      return {
        ...state,
        activeTimeFilter: action.time,
      };

    case "SET_CATEGORY_FILTER":
      return {
        ...state,
        activeCategoryFilter: action.category,
      };

    case "OPEN_DRAWER":
      return {
        ...state,
        selectedSlug: action.slug,
        drawerOpen: true,
        drawerTab: action.tab ?? "overview",
      };

    case "CLOSE_DRAWER":
      return {
        ...state,
        drawerOpen: false,
      };

    case "SET_DRAWER_TAB":
      return {
        ...state,
        drawerTab: action.tab,
      };

    default:
      return state;
  }
}

export function useAdventuresState(allItems: Destination[]) {
  const [state, dispatch] = useReducer(adventuresReducer, initialState);

  // Items filtered by category
  const categoryFiltered = useMemo(() => {
    if (!state.activeCategoryFilter) return allItems;
    return filterByCategory(allItems, state.activeCategoryFilter);
  }, [allItems, state.activeCategoryFilter]);

  // Items filtered by time of day
  const filteredItems = useMemo(() => {
    if (!state.activeTimeFilter) return categoryFiltered;
    return filterByTimeOfDay(categoryFiltered, state.activeTimeFilter);
  }, [categoryFiltered, state.activeTimeFilter]);

  // Highlighted slugs — items matching the current time filter
  const highlightedSlugs = useMemo(() => {
    if (!state.activeTimeFilter) return allItems.map((i) => i.slug);
    return filterByTimeOfDay(allItems, state.activeTimeFilter).map((i) => i.slug);
  }, [allItems, state.activeTimeFilter]);

  // Selected item
  const selectedItem = useMemo(
    () => allItems.find((i) => i.slug === state.selectedSlug) ?? null,
    [allItems, state.selectedSlug]
  );

  const hasActiveFilter = state.activeTimeFilter !== null;

  // Convenience dispatchers
  const setView = useCallback(
    (view: "map" | "catalog") => dispatch({ type: "SET_VIEW", view }),
    []
  );
  const selectItem = useCallback(
    (slug: string) => dispatch({ type: "SELECT_ITEM", slug }),
    []
  );
  const deselectItem = useCallback(
    () => dispatch({ type: "DESELECT_ITEM" }),
    []
  );
  const hoverItem = useCallback(
    (slug: string | null) => dispatch({ type: "HOVER_ITEM", slug }),
    []
  );
  const setTimeFilter = useCallback(
    (time: TimeOfDay | null) => dispatch({ type: "SET_TIME_FILTER", time }),
    []
  );
  const setCategoryFilter = useCallback(
    (category: DestinationCategory | null) =>
      dispatch({ type: "SET_CATEGORY_FILTER", category }),
    []
  );
  const openDrawer = useCallback(
    (slug: string, tab?: DrawerTab) =>
      dispatch({ type: "OPEN_DRAWER", slug, tab }),
    []
  );
  const closeDrawer = useCallback(
    () => dispatch({ type: "CLOSE_DRAWER" }),
    []
  );
  const setDrawerTab = useCallback(
    (tab: DrawerTab) => dispatch({ type: "SET_DRAWER_TAB", tab }),
    []
  );

  return {
    state,
    filteredItems,
    highlightedSlugs,
    selectedItem,
    hasActiveFilter,
    allItems,
    setView,
    selectItem,
    deselectItem,
    hoverItem,
    setTimeFilter,
    setCategoryFilter,
    openDrawer,
    closeDrawer,
    setDrawerTab,
  };
}
