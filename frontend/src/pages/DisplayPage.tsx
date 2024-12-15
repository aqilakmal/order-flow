import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../services/api";
import { OrderStatus } from "../types/order";
import { formatTimestamp } from "../lib/utils";

export default function DisplayPage() {
  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 5000, // Refetch every 10 seconds
  });

  const preparingOrders = orders
    .filter((order) => order.status === OrderStatus.PREPARING)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const completedOrders = orders
    .filter((order) => order.status === OrderStatus.COMPLETED)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const timeSinceLastUpdate = Math.floor((Date.now() - dataUpdatedAt) / 1000);
  const isStale = timeSinceLastUpdate > 30; // Consider data stale after 30 seconds

  return (
    <div className="relative h-screen overflow-hidden bg-[#FFDFB5]">
      <div className="grid h-[calc(100vh-2rem)] grid-cols-2 gap-x-6">
        {/* Preparing Orders Column */}
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-none p-6 pb-4 pr-0">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-brand-500">Sedang di Masak</h2>
              <span className="rounded-full bg-brand-500 px-4 py-1 text-lg text-white">
                {preparingOrders.length} Pesanan
              </span>
            </div>
          </div>

          <div className="space-y-6 overflow-y-auto pb-6 pl-6">
            {preparingOrders.map((order) => (
              <div key={order.id} className="rounded-xl bg-brand-500 p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline text-4xl font-bold tracking-tight text-white">
                      <span>F-</span>
                      <span className="font-normal text-white/75">xxxx</span>
                      <span>{order.order_id}</span>
                    </div>
                    <div className="text-brand-950 animate-pulse rounded-full bg-brand-300 px-4 py-2 text-base font-medium">
                      Sedang di Masak
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl text-white">{order.name}</div>
                    <div className="text-sm text-white/90">{formatTimestamp(order.updatedAt)}</div>
                  </div>
                </div>
              </div>
            ))}
            {preparingOrders.length === 0 && (
              <div className="py-12 text-center text-lg text-muted-foreground">
                Tidak ada pesanan yang sedang dimasak
              </div>
            )}
          </div>
        </div>

        {/* Completed Orders Column */}
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-none p-6 pb-4 pl-0">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-green-600">Selesai</h2>
              <span className="rounded-full bg-green-500 px-4 py-1 text-lg text-white">
                {completedOrders.length} Pesanan
              </span>
            </div>
          </div>

          <div className="space-y-6 overflow-y-auto pb-6 pr-6">
            {completedOrders.map((order) => (
              <div key={order.id} className="rounded-xl bg-green-500 p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline text-4xl font-bold tracking-tight text-white">
                      <span>F-</span>
                      <span className="font-normal text-white/75">xxxx</span>
                      <span>{order.order_id}</span>
                    </div>
                    <div className="rounded-full bg-green-300 px-4 py-2 text-base font-medium text-green-950">
                      Selesai
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl text-white">{order.name}</div>
                    <div className="text-sm text-white/90">{formatTimestamp(order.updatedAt)}</div>
                  </div>
                </div>
              </div>
            ))}
            {completedOrders.length === 0 && (
              <div className="py-12 text-center text-lg text-muted-foreground">
                Tidak ada pesanan yang selesai
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Moved from top to bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t-2 border-gray-800 bg-neutral-800 px-4 py-2">
        <div className="mx-2 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-sm text-gray-200">Order Flow</h1>
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
