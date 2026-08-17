/**
 * Converts a raw Postgres `products` row (snake_case columns, `id` as
 * primary key) into the exact same JSON shape Mongoose used to return
 * (camelCase fields, `_id` instead of `id`) — so the frontend needs zero
 * changes after this migration.
 */
const mapProductRow = (row, shipperInfo = null) => {
  if (!row) return null;
  return {
    _id: row.id,
    shipper: shipperInfo || row.shipper_id,
    name: row.name,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    unit: row.unit,
    stock: row.stock,
    images: row.images || [],
    weightPerUnit: Number(row.weight_per_unit),
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

module.exports = mapProductRow;