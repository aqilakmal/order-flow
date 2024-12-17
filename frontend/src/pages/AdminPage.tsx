import {
  PlusIcon,
  TrashIcon,
  ArrowLeftStartOnRectangleIcon,
  CheckIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { createOrder, getOrders, updateOrderStatus, deleteOrder } from "../services/orders";
import { OrderStatus, type Order } from "../types";
import { formatTimestamp } from "../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { NumPad } from "../components/NumPad";
import { useAuth } from "../hooks/use-auth";

type UpdateOrderStatusParams = {
  storeId: string;
  id: string;
  status: Order["status"];
};

type DeleteOrderParams = {
  storeId: string;
  id: string;
};

export default function AdminPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputStep, setInputStep] = useState<"orderId" | "name">("orderId");
  const [newOrder, setNewOrder] = useState<{ orderId: string; name: string }>({
    orderId: "",
    name: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuth();
  const navigate = useNavigate();

  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["orders", storeId],
    queryFn: () => (storeId ? getOrders(storeId) : Promise.resolve([])),
    enabled: !!storeId,
    refetchInterval: 5000,
    select: (data) => {
      return [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: { orderId: string; name: string }) =>
      storeId
        ? createOrder(storeId, { ...data, status: OrderStatus.PREPARING })
        : Promise.reject("No store ID"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      toast({
        title: "Berhasil",
        description: "Pesanan berhasil dibuat",
      });
      setNewOrder({ orderId: "", name: "" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ storeId, id, status }: UpdateOrderStatusParams) =>
      updateOrderStatus(storeId, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      toast({
        title: "Berhasil",
        description: "Status pesanan berhasil diperbarui",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: ({ storeId, id }: DeleteOrderParams) => deleteOrder(storeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      toast({
        title: "Berhasil",
        description: "Pesanan berhasil dihapus",
      });
    },
  });

  const handleAddOrderClick = () => {
    setIsModalOpen(true);
    setInputStep("orderId");
    setNewOrder({ orderId: "", name: "" });
  };

  const handleOrderIdComplete = () => {
    if (newOrder.orderId) {
      setInputStep("name");
    }
  };

  const handleNameComplete = () => {
    if (newOrder.name) {
      setIsModalOpen(false);
      createOrderMutation.mutate(newOrder);
    }
  };

  const timeSinceLastUpdate = Math.floor((Date.now() - dataUpdatedAt) / 1000);
  const isStale = timeSinceLastUpdate > 30;

  const handleLogout = () => {
    clearAuth();
    // The ProtectedRoute component will automatically redirect to /auth
  };

  return (
    <div className="flex h-[100svh] flex-col bg-[#FFDFB5]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-5xl p-3 pb-0 sm:p-6 sm:pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="border-none bg-transparent px-3"
              >
                <ArrowLeftIcon className="h-4 w-4 stroke-[3]" />
              </Button>
              <h1 className="text-lg font-semibold text-brand-900 sm:text-xl">Pesanan</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 px-2 text-sm hover:bg-red-500 hover:text-white sm:px-4"
                disabled={createOrderMutation.isPending}
              >
                <ArrowLeftStartOnRectangleIcon className="h-4 w-4 stroke-[2]" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
              <Button
                onClick={handleAddOrderClick}
                className="gap-2 bg-brand-500 px-4 text-sm text-white hover:bg-brand-600"
                disabled={createOrderMutation.isPending}
              >
                <PlusIcon className="h-4 w-4 stroke-[2]" />
                {createOrderMutation.isPending ? (
                  "..."
                ) : (
                  <span className="hidden sm:inline">Tambah</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-3 w-full max-w-5xl flex-1 overflow-y-auto p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="space-y-3 sm:space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center">
                <p className="text-sm text-neutral-500 sm:text-base">Tidak ada pesanan</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md sm:p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                        <div className="flex items-baseline text-lg font-bold tracking-tight text-brand-800 sm:text-xl">
                          <span>F-</span>
                          <span className="font-normal text-brand-300">xxxx</span>
                          <span>{order.orderId}</span>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium sm:hidden ${
                            order.status === OrderStatus.PREPARING
                              ? "bg-brand-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {order.status === OrderStatus.PREPARING ? "Sedang Dimasak" : "Selesai"}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-brand-800 sm:text-sm">
                        {order.name}
                      </div>
                      <div className="text-[10px] text-brand-800 sm:text-xs">
                        <span className="hidden sm:inline">Updated At:</span>{" "}
                        {formatTimestamp(order.updatedAt)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                      <span
                        className={`hidden items-center rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex sm:px-3 sm:py-1 sm:text-sm ${
                          order.status === OrderStatus.PREPARING
                            ? "bg-brand-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {order.status === OrderStatus.PREPARING ? "Sedang Dimasak" : "Selesai"}
                      </span>

                      <div className="flex w-full gap-2 sm:hidden">
                        <Button
                          variant="outline"
                          className="flex-1 px-2 text-xs hover:bg-red-500 hover:text-white"
                          onClick={() =>
                            deleteOrderMutation.mutate({ storeId: storeId!, id: order.id })
                          }
                          disabled={updateStatusMutation.isPending || deleteOrderMutation.isPending}
                        >
                          <TrashIcon className="h-3 w-3 stroke-[2]" />
                        </Button>
                        <Button
                          variant="outline"
                          className={`flex-1 gap-1 px-2 text-xs ${
                            order.status === OrderStatus.PREPARING
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-brand-100 text-brand-700 hover:bg-brand-200"
                          }`}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              storeId: storeId!,
                              id: order.id,
                              status:
                                order.status === OrderStatus.PREPARING
                                  ? OrderStatus.COMPLETED
                                  : OrderStatus.PREPARING,
                            })
                          }
                          disabled={updateStatusMutation.isPending || deleteOrderMutation.isPending}
                        >
                          {updateStatusMutation.isPending &&
                          updateStatusMutation.variables?.id === order.id ? (
                            "..."
                          ) : order.status === OrderStatus.PREPARING ? (
                            <>
                              <CheckIcon className="h-3 w-3 stroke-[2]" />
                              <span>Selesai</span>
                            </>
                          ) : (
                            <>
                              <ArrowPathIcon className="h-3 w-3 stroke-[2]" />
                              <span>Ulang</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="hidden w-full gap-2 sm:flex sm:w-auto">
                        <Button
                          variant="outline"
                          className={`flex-1 gap-2 px-2 text-xs sm:px-4 sm:text-sm ${
                            order.status === OrderStatus.PREPARING
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-brand-100 text-brand-700 hover:bg-brand-200"
                          }`}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              storeId: storeId!,
                              id: order.id,
                              status:
                                order.status === OrderStatus.PREPARING
                                  ? OrderStatus.COMPLETED
                                  : OrderStatus.PREPARING,
                            })
                          }
                          disabled={updateStatusMutation.isPending || deleteOrderMutation.isPending}
                        >
                          {updateStatusMutation.isPending &&
                          updateStatusMutation.variables?.id === order.id ? (
                            "..."
                          ) : order.status === OrderStatus.PREPARING ? (
                            <>
                              <CheckIcon className="h-4 w-4 stroke-[2]" />
                              <span>Selesai</span>
                            </>
                          ) : (
                            <>
                              <ArrowPathIcon className="h-4 w-4 stroke-[2]" />
                              <span>Ulang</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 px-2 text-xs hover:bg-red-500 hover:text-white sm:px-4 sm:text-sm"
                          onClick={() =>
                            deleteOrderMutation.mutate({ storeId: storeId!, id: order.id })
                          }
                          disabled={updateStatusMutation.isPending || deleteOrderMutation.isPending}
                        >
                          <TrashIcon className="h-4 w-4 stroke-[2]" />
                          <span>Hapus</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[90%] rounded-lg p-3 sm:mx-auto sm:max-w-[400px] sm:rounded-xl sm:p-4">
          <DialogHeader>
            <DialogTitle className="text-center text-base font-semibold text-brand-900 sm:text-lg">
              {inputStep === "orderId" ? "Masukkan ID Pesanan" : "Masukkan Nama"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 py-2 sm:gap-4 sm:py-3">
            <div className="w-full px-2">
              <input
                type="text"
                className="w-full rounded-lg bg-gray-50 p-2 text-center text-xl leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500 sm:p-3"
                value={inputStep === "orderId" ? `F-xxxx${newOrder.orderId}` : newOrder.name}
                readOnly
                placeholder={inputStep === "orderId" ? "F-xxxx___" : "Nama Pelanggan"}
              />
            </div>

            {inputStep === "orderId" ? (
              <NumPad
                value={newOrder.orderId}
                onChange={(value) => setNewOrder({ ...newOrder, orderId: value })}
                onEnter={handleOrderIdComplete}
              />
            ) : (
              <div className="w-full px-2">
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 p-2 text-lg leading-relaxed focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:p-3 sm:text-xl"
                  value={newOrder.name}
                  onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleNameComplete()}
                  autoFocus
                  placeholder="Ketik nama..."
                />
                <Button
                  className="mt-2 h-10 w-full rounded-lg bg-brand-500 text-sm text-white hover:bg-brand-600 active:bg-brand-700 sm:h-12 sm:text-base"
                  onClick={handleNameComplete}
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "..." : "Tampilkan"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-neutral-800 px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="mx-1 flex items-center justify-between sm:mx-2">
          <div className="flex-1">
            <h1 className="text-[10px] text-brand-100 sm:text-xs">Order Flow</h1>
          </div>
          <div
            className={`flex items-center gap-1 sm:gap-2 ${isStale ? "text-red-500" : "text-green-500"}`}
          >
            <div
              className={`h-1 w-1 animate-pulse rounded-full sm:h-1.5 sm:w-1.5 ${
                isStale ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span className="text-[10px] sm:text-xs">
              {formatTimestamp(new Date(), dataUpdatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
