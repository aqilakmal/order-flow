import { Store, createStoreSchema, type Store as StoreType, type CreateStore } from "../types";
import { useApi } from "./_api";

export function useStoresService() {
  const api = useApi();

  const getStores = async (): Promise<StoreType[]> => {
    const data = await api.get<unknown[]>("/stores");
    try {
      return data.map((store) => Store.parse(store));
    } catch (error) {
      console.error("Store validation failed:", error);
      throw error;
    }
  };

  const createStore = async (data: CreateStore) => {
    const validatedData = createStoreSchema.parse(data);
    const responseData = await api.post<unknown>("/stores", validatedData);
    return Store.parse(responseData);
  };

  const updateStore = async (id: string, data: Partial<CreateStore>) => {
    const responseData = await api.patch<unknown>(`/stores/${id}`, data);
    return Store.parse(responseData);
  };

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
