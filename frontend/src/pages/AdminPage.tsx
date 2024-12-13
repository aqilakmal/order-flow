import { PlusIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { NumPad } from "../components/NumPad";

type UpdateOrderStatusParams = {
  id: string;
  status: Order["status"];
};

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputStep, setInputStep] = useState<'orderId' | 'name'>('orderId');
  const [newOrder, setNewOrder] = useState<{ order_id: string; name: string }>({
    order_id: "",
    name: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 10000,
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: Omit<Order, "id" | "createdAt">) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      setNewOrder({ order_id: "", name: "" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (params: UpdateOrderStatusParams) => updateOrderStatus(params.id, params.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    },
  });

  const handleAddOrderClick = () => {
    setIsModalOpen(true);
    setInputStep('orderId');
    setNewOrder({ order_id: "", name: "" });
  };

  const handleOrderIdComplete = () => {
    if (newOrder.order_id) {
      setInputStep('name');
    }
  };

  const handleNameComplete = () => {
    if (newOrder.name) {
      setIsModalOpen(false);
      createOrderMutation.mutate({
        ...newOrder,
        status: OrderStatus.PREPARING,
      });
    }
  };

  const timeSinceLastUpdate = Math.floor((Date.now() - dataUpdatedAt) / 1000);
  const isStale = timeSinceLastUpdate > 30;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Order Management</h1>
          <Button onClick={handleAddOrderClick} className="text-xl p-6 gap-2">
            <PlusIcon className="h-6 w-6" />
            Add New Order
          </Button>
        </div>
        <div className={`flex items-center gap-2 ${isStale ? 'text-red-500' : 'text-green-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isStale ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className="text-lg font-medium">
            {formatTimestamp(new Date(), dataUpdatedAt)}
          </span>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              {inputStep === 'orderId' ? 'Enter Order ID' : 'Enter Customer Name'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="w-full px-4">
              <input
                type="text"
                className="w-full text-4xl p-4 text-center rounded-lg border"
                value={inputStep === 'orderId' ? newOrder.order_id : newOrder.name}
                readOnly
                placeholder={inputStep === 'orderId' ? "Order ID" : "Customer Name"}
              />
            </div>

            {inputStep === 'orderId' ? (
              <NumPad
                value={newOrder.order_id}
                onChange={(value) => setNewOrder({ ...newOrder, order_id: value })}
                onEnter={handleOrderIdComplete}
              />
            ) : (
              <div className="w-full px-4">
                <input
                  type="text"
                  className="w-full text-4xl p-4 rounded-lg border"
                  value={newOrder.name}
                  onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameComplete()}
                  autoFocus
                  placeholder="Type customer name..."
                />
                <Button 
                  className="w-full mt-4 p-6 text-xl"
                  onClick={handleNameComplete}
                >
                  Submit Order
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xl">Order ID</TableHead>
              <TableHead className="text-xl">Customer Name</TableHead>
              <TableHead className="text-xl">Status</TableHead>
              <TableHead className="text-xl">Created At</TableHead>
              <TableHead className="text-xl">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50">
                <TableCell className="font-medium text-lg">{order.order_id}</TableCell>
                <TableCell className="text-lg">{order.name}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-lg font-medium ${
                    order.status === OrderStatus.PREPARING
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-lg">{formatTimestamp(order.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {order.status === OrderStatus.PREPARING && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: order.id,
                            status: OrderStatus.COMPLETED,
                          })
                        }
                      >
                        <CheckIcon className="h-6 w-6" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 text-red-600 hover:text-red-700"
                      onClick={() => deleteOrderMutation.mutate(order.id)}
                    >
                      <TrashIcon className="h-6 w-6" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
