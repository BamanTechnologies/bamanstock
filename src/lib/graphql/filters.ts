export function nonDeletedFilter() {
  return { is_deleted: { _eq: false as const } };
}

export function customersWithActiveOrdersFilter() {
  return { orders: nonDeletedFilter() };
}

export function merchantsWithActiveOrdersFilter() {
  return { orders: nonDeletedFilter() };
}

export function paymentsWithActiveOrdersFilter() {
  return { order: nonDeletedFilter() };
}