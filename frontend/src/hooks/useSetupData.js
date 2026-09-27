import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSetupData, selectSetupData } from "../state/setupFrontOfficeSlice";

/**
 * Custom hook to fetch and use setup data (Purpose, Complaint Type, Source, Reference)
 * @param {string} type - Type of setup data: "purpose" | "complaintType" | "source" | "reference"
 * @returns {Object} - { data: Array, loading: boolean, error: string|null }
 */
export function useSetupData(type) {
  const dispatch = useDispatch();
  const setupData = useSelector(selectSetupData(type));
  const loading = useSelector((state) => state.setupFrontOffice.loading);
  const error = useSelector((state) => state.setupFrontOffice.error);

  useEffect(() => {
    // Fetch data if not already loaded
    if (!setupData?.data || setupData.data.length === 0) {
      dispatch(fetchSetupData({ type, params: { page: 1, limit: 100 } }));
    }
  }, [dispatch, type, setupData?.data]);

  return {
    data: setupData?.data || [],
    loading,
    error,
  };
}

/**
 * Get options array for select/dropdown (just names)
 * @param {string} type - Type of setup data
 * @returns {Array<string>} - Array of names
 */
export function useSetupOptions(type) {
  const { data, loading, error } = useSetupData(type);
  const options = data.map((item) => item.name);
  return { options, loading, error };
}
