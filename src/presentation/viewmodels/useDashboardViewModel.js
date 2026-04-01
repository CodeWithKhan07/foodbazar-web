import { useState } from "react";

export function useDashboardViewModel(allOrders) {
  const [confirmId, setConfirmId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const todayTotal = allOrders.reduce((s, o) => s + o.total, 0);
  const todayOrders = allOrders.length;
  const avgBill = todayOrders > 0 ? Math.round(todayTotal / todayOrders) : 0;

  return {
    confirmId, setConfirmId,
    expandedId, setExpandedId,
    todayTotal, todayOrders, avgBill
  };
}
