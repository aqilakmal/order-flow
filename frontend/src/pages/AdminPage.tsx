import { PlusIcon, TrashIcon, ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { createOrder, getOrders, updateOrderStatus, deleteOrder } from "../services/api";
import { OrderStatus, type Order } from "../types/order";
import { formatTimestamp } from "../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { NumPad } from "../components/NumPad";
import { useAuth } from "../hooks/use-auth";

type UpdateOrderStatusParams = {
  id: string;
  status: Order["status"];
};

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputStep, setInputStep] = useState<"orderId" | "name">("orderId");
  const [newOrder, setNewOrder] = useState<{ order_id: string; name: string }>({
    order_id: "",
    name: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuth();

  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 5000,
    select: (data) => {
      // Sort orders by createdAt date, most recent first
      return [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: { order_id: string; name: string }) =>
      createOrder({
        ...data,
        status: OrderStatus.PREPARING,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Berhasil",
        description: "Pesanan berhasil dibuat",
      });
      setNewOrder({ order_id: "", name: "" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (params: UpdateOrderStatusParams) => updateOrderStatus(params.id, params.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Berhasil",
        description: "Status pesanan berhasil diperbarui",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Berhasil",
        description: "Pesanan berhasil dihapus",
      });
    },
  });

  const handleAddOrderClick = () => {
    setIsModalOpen(true);
    setInputStep("orderId");
    setNewOrder({ order_id: "", name: "" });
  };

  const handleOrderIdComplete = () => {
    if (newOrder.order_id) {
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
    <div className="relative h-screen overflow-hidden bg-[#FFDFB5]">
      <div className="h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="container mx-auto space-y-8 py-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-neutral-800">Manajemen Pesanan</h1>
            <div className="flex gap-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 rounded-xl border-neutral-300 p-6 text-lg text-neutral-800 hover:bg-red-500 hover:text-white"
              >
                <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />
                Keluar
              </Button>
              <Button
                onClick={handleAddOrderClick}
                className="gap-2 rounded-xl bg-neutral-800 p-6 text-lg text-white hover:bg-green-500"
              >
                <PlusIcon className="h-6 w-6" />
                Tambah Pesanan
              </Button>
            </div>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="rounded-xl sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">
                  {inputStep === "orderId" ? "Masukkan ID Pesanan" : "Masukkan Nama Pelanggan"}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center gap-6 py-4">
                <div className="w-full px-4">
                  <input
                    type="text"
                    className="w-full rounded-xl bg-gray-100 p-4 text-center text-4xl leading-relaxed focus:outline-none"
                    value={inputStep === "orderId" ? `F-xxxx${newOrder.order_id}` : newOrder.name}
                    readOnly
                    placeholder={inputStep === "orderId" ? "F-xxxx___" : "Nama Pelanggan"}
                  />
                </div>

                {inputStep === "orderId" ? (
                  <NumPad
                    value={newOrder.order_id}
                    onChange={(value) => setNewOrder({ ...newOrder, order_id: value })}
                    onEnter={handleOrderIdComplete}
                  />
                ) : (
                  <div className="w-full px-4">
                    <input
                      type="text"
                      className="w-full rounded-xl border p-4 text-4xl leading-relaxed focus:outline-none"
                      value={newOrder.name}
                      onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleNameComplete()}
                      autoFocus
                      placeholder="Ketik nama pelanggan..."
                    />
                    <Button
                      className="mt-4 h-16 w-full rounded-xl p-6 text-xl"
                      onClick={handleNameComplete}
                    >
                      Tampilkan Pesanan
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <div className="overflow-hidden rounded-xl border bg-white">
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="py-4 pl-6 text-lg text-neutral-600">Pesanan</TableHead>
                  <TableHead className="text-lg text-neutral-600">Status</TableHead>
                  <TableHead className="text-lg text-neutral-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-white">
                    <TableCell className="py-6 pl-6">
                      <div className="space-y-2">
                        <div className="flex items-baseline text-4xl font-bold tracking-tight text-neutral-800">
                          <span>F-</span>
                          <span className="font-normal text-neutral-400">xxxx</span>
                          <span>{order.order_id}</span>
                        </div>
                        <div className="text-lg text-neutral-600">{order.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-3">
                        <span
                          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
                            order.status === OrderStatus.PREPARING
                              ? "bg-brand-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {order.status === OrderStatus.PREPARING ? "Sedang di Masak" : "Selesai"}
                        </span>
                        <div className="text-sm text-neutral-500">
                          <div className="flex items-center gap-1">
                            <span>Diperbarui:</span>
                            {formatTimestamp(order.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-6">
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          className={`rounded-xl px-6 py-6 text-base font-medium ${
                            order.status === OrderStatus.PREPARING
                              ? "bg-neutral-800 text-white hover:bg-green-500 hover:text-white"
                              : "bg-neutral-100 text-neutral-800 hover:bg-brand-500 hover:text-white"
                          }`}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: order.id,
                              status:
                                order.status === OrderStatus.PREPARING
                                  ? OrderStatus.COMPLETED
                                  : OrderStatus.PREPARING,
                            })
                          }
                        >
                          {order.status === OrderStatus.PREPARING ? "Selesai" : "Masak Ulang"}
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-xl border-neutral-200 bg-white py-6 text-neutral-800 hover:bg-red-500 hover:text-white"
                          onClick={() => deleteOrderMutation.mutate(order.id)}
                        >
                          <TrashIcon className="mr-2 h-5 w-5" />
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 bg-neutral-800 px-4 py-2">
        <div className="mx-2 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-sm text-neutral-200">Order Flow</h1>
          </div>
          <div className={`flex items-center gap-2 ${isStale ? "text-red-500" : "text-green-500"}`}>
            <div
              className={`h-2 w-2 animate-pulse rounded-full ${isStale ? "bg-red-500" : "bg-green-500"}`}
            />
            <span className="text-sm">{formatTimestamp(new Date(), dataUpdatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
