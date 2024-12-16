import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../services/api";
import { Order, OrderStatus } from "../types/order";
import { formatTimestamp } from "../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function DisplayPage() {
  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 5000,
  });

  const preparingOrders = orders
    .filter((order) => order.status === OrderStatus.PREPARING)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const completedOrders = orders
    .filter((order) => order.status === OrderStatus.COMPLETED)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const timeSinceLastUpdate = Math.floor((Date.now() - dataUpdatedAt) / 1000);
  const isStale = timeSinceLastUpdate > 30;

  const OrderCard = ({ order, variant }: { order: Order; variant: "preparing" | "completed" }) => (
    <div 
      className={`rounded-xl p-4 shadow-sm sm:p-6 ${
        variant === "preparing" ? "bg-brand-500" : "bg-green-500"
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline text-2xl font-bold tracking-tight text-white sm:text-4xl">
            <span>F-</span>
            <span className="font-normal text-white/75">xxxx</span>
            <span>{order.order_id}</span>
          </div>
          <div 
            className={`rounded-full px-3 py-1 text-xs font-medium sm:px-4 sm:py-2 sm:text-base ${
              variant === "preparing" 
                ? "bg-brand-300 text-brand-950"
                : "bg-green-300 text-green-950"
            }`}
          >
            {variant === "preparing" ? "Sedang di Masak" : "Selesai"}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg text-white sm:text-xl">{order.name}</div>
          <div className="text-xs text-white/90 sm:text-sm">
            <span className="hidden sm:inline">Diperbarui: </span>
            {formatTimestamp(order.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[100svh] flex-col bg-[#FFDFB5]">
      {/* Mobile View (Tabs) */}
      <div className="flex-1 sm:hidden">
        <Tabs defaultValue="preparing" className="h-full">
          <TabsList className="sticky top-0 z-10 flex w-full rounded-none bg-white/80 backdrop-blur">
            <TabsTrigger value="preparing" className="flex-1 data-[state=active]:bg-brand-500 data-[state=active]:text-white">
              Dimasak ({preparingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Selesai ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preparing" className="h-[calc(100%-48px)] space-y-3 overflow-y-auto p-3">
            {preparingOrders.map((order) => (
              <OrderCard key={order.id} order={order} variant="preparing" />
            ))}
            {preparingOrders.length === 0 && (
              <div className="py-12 text-center text-sm text-neutral-500">
                Tidak ada pesanan yang sedang dimasak
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="h-[calc(100%-48px)] space-y-3 overflow-y-auto p-3">
            {completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} variant="completed" />
            ))}
            {completedOrders.length === 0 && (
              <div className="py-12 text-center text-sm text-neutral-500">
                Tidak ada pesanan yang selesai
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop/Tablet View (Split Screen) */}
      <div className="hidden flex-1 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:overflow-hidden">
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
              <OrderCard key={order.id} order={order} variant="preparing" />
            ))}
            {preparingOrders.length === 0 && (
              <div className="py-12 text-center text-lg text-neutral-500">
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
              <OrderCard key={order.id} order={order} variant="completed" />
            ))}
            {completedOrders.length === 0 && (
              <div className="py-12 text-center text-lg text-neutral-500">
                Tidak ada pesanan yang selesai
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-neutral-800 px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="mx-1 flex items-center justify-between sm:mx-2">
          <div className="flex-1">
            <h1 className="text-[10px] text-brand-100 sm:text-xs">Order Flow</h1>
          </div>
          <div className={`flex items-center gap-1 sm:gap-2 ${isStale ? "text-red-500" : "text-green-500"}`}>
            <div
              className={`h-1 w-1 animate-pulse rounded-full sm:h-1.5 sm:w-1.5 ${
                isStale ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span className="text-[10px] sm:text-xs">{formatTimestamp(new Date(), dataUpdatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
