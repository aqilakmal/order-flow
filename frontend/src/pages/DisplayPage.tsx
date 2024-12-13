import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../services/api";
import { OrderStatus } from "../types/order";
import { formatTimestamp } from "../lib/utils";

export default function DisplayPage() {
  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const preparingOrders = orders.filter((order) => order.status === OrderStatus.PREPARING);
  const completedOrders = orders.filter((order) => order.status === OrderStatus.COMPLETED);
  
  const timeSinceLastUpdate = Math.floor((Date.now() - dataUpdatedAt) / 1000);
  const isStale = timeSinceLastUpdate > 30; // Consider data stale after 30 seconds

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Order Status Board</h1>
          <div className={`flex items-center gap-2 ${isStale ? 'text-red-500' : 'text-green-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isStale ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-sm font-medium">
              {formatTimestamp(new Date(), dataUpdatedAt)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Preparing Orders */}
          <div className="rounded-xl border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-card-foreground">Preparing</h2>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
                {preparingOrders.length} Orders
              </span>
            </div>
            <div className="space-y-4">
              {preparingOrders.map((order) => (
                <div key={order.id} 
                     className="rounded-lg border bg-background p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">#{order.order_id}</span>
                      <p className="text-sm text-muted-foreground mt-1">{order.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(order.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                      Preparing
                    </div>
                  </div>
                </div>
              ))}
              {preparingOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No orders in preparation</p>
              )}
            </div>
          </div>

          {/* Completed Orders */}
          <div className="rounded-xl border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-card-foreground">Completed</h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                {completedOrders.length} Orders
              </span>
            </div>
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <div key={order.id} 
                     className="rounded-lg border bg-background p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">#{order.order_id}</span>
                      <p className="text-sm text-muted-foreground mt-1">{order.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(order.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      Completed
                    </div>
                  </div>
                </div>
              ))}
              {completedOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No completed orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
