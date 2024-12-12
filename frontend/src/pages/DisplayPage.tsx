import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../services/api";
import { OrderStatus } from "../types/order";

export default function DisplayPage() {
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const preparingOrders = orders.filter((order) => order.status === OrderStatus.PREPARING);
  const completedOrders = orders.filter((order) => order.status === OrderStatus.COMPLETED);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-center text-3xl font-bold">Order Status</h1>
        <div className="grid grid-cols-2 gap-8">
          {/* Preparing Orders */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-2xl font-semibold text-card-foreground">Preparing</h2>
            <div className="space-y-4">
              {preparingOrders.map((order) => (
                <div key={order.id} className="rounded-lg border bg-background p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-medium">Order #{order.number}</span>
                      <p className="text-sm text-muted-foreground">{order.name}</p>
                    </div>
                    <div className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Preparing
                    </div>
                  </div>
                </div>
              ))}
              {preparingOrders.length === 0 && (
                <p className="text-center text-muted-foreground">No orders in preparation</p>
              )}
            </div>
          </div>

          {/* Completed Orders */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-2xl font-semibold text-card-foreground">Completed</h2>
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <div key={order.id} className="rounded-lg border bg-background p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-medium">Order #{order.number}</span>
                      <p className="text-sm text-muted-foreground">{order.name}</p>
                    </div>
                    <div className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Completed
                    </div>
                  </div>
                </div>
              ))}
              {completedOrders.length === 0 && (
                <p className="text-center text-muted-foreground">No completed orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
