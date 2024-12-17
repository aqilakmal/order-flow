import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { createStore, deleteStore, getStores, updateStore } from "../services/stores";
import type { CreateStore, Store } from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStoreSchema } from "../types";

export default function StoresPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<CreateStore>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      storeId: "",
    },
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
  });

  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({
        title: "Berhasil",
        description: "Toko berhasil dibuat",
      });
      setIsModalOpen(false);
      form.reset();
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStore> }) => updateStore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({
        title: "Berhasil",
        description: "Toko berhasil diperbarui",
      });
      setIsModalOpen(false);
      setSelectedStore(null);
      form.reset();
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({
        title: "Berhasil",
        description: "Toko berhasil dihapus",
      });
    },
  });

  const onSubmit = (data: CreateStore) => {
    if (selectedStore) {
      updateStoreMutation.mutate({ id: selectedStore.id, data });
    } else {
      createStoreMutation.mutate(data);
    }
  };

  const handleEdit = (store: Store) => {
    setSelectedStore(store);
    form.reset({
      name: store.name,
      storeId: store.storeId,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedStore(null);
    form.reset();
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-[100svh] flex-col bg-[#FFDFB5]">
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto w-full max-w-5xl p-3 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-brand-900 sm:text-2xl">Daftar Toko</h1>
            <Button
              onClick={handleAdd}
              className="gap-2 bg-brand-500 px-4 text-white hover:bg-brand-600"
            >
              <PlusIcon className="h-4 w-4" />
              Tambah Toko
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <div
                key={store.id}
                className="rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-brand-900">{store.name}</h3>
                    <p className="text-sm text-brand-600">@{store.storeId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(store)}
                      className="h-8 w-8 p-0"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteStoreMutation.mutate(store.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/admin/${store.storeId}`)}
                  className="w-full bg-brand-500 text-white hover:bg-brand-600"
                >
                  Kelola Pesanan
                </Button>
              </div>
            ))}
          </div>

          {stores.length === 0 && (
            <div className="rounded-lg bg-white p-8 text-center">
              <p className="text-neutral-500">Belum ada toko</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStore ? "Edit Toko" : "Tambah Toko"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Toko</label>
              <Input {...form.register("name")} placeholder="Masukkan nama toko" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ID Toko (opsional)</label>
              <Input
                {...form.register("storeId")}
                placeholder="ID toko (huruf kecil, angka, strip)"
              />
              {form.formState.errors.storeId && (
                <p className="text-sm text-red-500">{form.formState.errors.storeId.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-500 text-white hover:bg-brand-600"
              disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
            >
              {createStoreMutation.isPending || updateStoreMutation.isPending
                ? "Menyimpan..."
                : selectedStore
                  ? "Simpan Perubahan"
                  : "Buat Toko"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
