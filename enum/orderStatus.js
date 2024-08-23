const orderStatus = Object.freeze({
  // PENDING: "PENDING",
  PREPARING: "PREPARING",
  PACKED: "PACKED",
  DISPATCHED: "DISPATCHED",
  DELIVERED: "DELIVERED",
  CANCELLED:"CANCELLED"
});

module.exports = { orderStatus };
