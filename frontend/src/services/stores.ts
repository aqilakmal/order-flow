import { Store, createStoreSchema, type Store as StoreType, type CreateStore } from "../types";
import { useApi } from "../lib/api";

/**
 * @description Hook to access store-related functionality
 * @returns {Object} Object containing store methods (getStores, createStore, updateStore, deleteStore)
 */
export function useStoresService() {
  const api = useApi();

  /**
   * @description Get all stores for the authenticated user
   * @returns {Promise<StoreType[]>} List of stores
   * @throws {Error} If fetching stores fails or validation fails
   */
  const getStores = async (): Promise<StoreType[]> => {
    const data = await api.get<unknown[]>("/stores");
    try {
      return data.map((store) => Store.parse(store));
    } catch (error) {
      console.error("Store validation failed:", error);
      throw error;
    }
  };

  /**
   * @description Create a new store
   * @param {CreateStore} data - Store data
   * @returns {Promise<StoreType>} Created store
   * @throws {Error} If store creation or validation fails
   */
  const createStore = async (data: CreateStore) => {
    const validatedData = createStoreSchema.parse(data);
    const responseData = await api.post<unknown>("/stores", validatedData);
    return Store.parse(responseData);
  };

  /**
   * @description Update store details
   * @param {string} id - Store ID to update
   * @param {Partial<CreateStore>} data - Updated store data
   * @returns {Promise<StoreType>} Updated store
   * @throws {Error} If store update or validation fails
   */
  const updateStore = async (id: string, data: Partial<CreateStore>) => {
    const responseData = await api.patch<unknown>(`/stores/${id}`, data);
    return Store.parse(responseData);
  };

  /**
   * @description Delete a store
   * @param {string} id - Store ID to delete
   * @returns {Promise<boolean>} True if deletion was successful
   * @throws {Error} If deletion fails
   */
  const deleteStore = async (id: string) => {
    return api.delete(`/stores/${id}`);
  };

  return {
    getStores,
    createStore,
    updateStore,
    deleteStore,
  };
}
