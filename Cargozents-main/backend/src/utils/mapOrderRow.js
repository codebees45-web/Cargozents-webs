const mapOrderRow = (row, itemRows = [], buyerInfo = null, shipperInfo = null) => {
  if (!row) return null;

  return {
    _id: row.id,
    buyer: buyerInfo || row.buyer_id,
    shipper: shipperInfo || row.shipper_id,
    items: itemRows.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      priceAtPurchase: Number(item.price_at_purchase),
    })),
    productTotal: Number(row.product_total),
    deliveryAddress: {
      line1: row.delivery_line1,
      city: row.delivery_city,
      state: row.delivery_state,
      pincode: row.delivery_pincode,
      location: {
        type: 'Point',
        coordinates: [Number(row.delivery_lng), Number(row.delivery_lat)],
      },
    },
    productPaymentStatus: row.product_payment_status,
    productPaymentMethod: row.product_payment_method,
    status: row.status,
    shipment: row.shipment_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

module.exports = mapOrderRow;