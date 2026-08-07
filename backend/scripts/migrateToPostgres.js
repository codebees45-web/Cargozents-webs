/**
 * ONE-TIME MIGRATION: MongoDB → PostgreSQL
 * Copies every Product, Order, and Review document from MongoDB into the
 * new Postgres tables, preserving original Mongo _id values as the
 * Postgres primary keys so every existing reference (URLs, order.items,
 * review.order, etc.) keeps working unchanged after the cutover.
 *
 * Run with: node scripts/migrateToPostgres.js
 *
 * Safe to re-run: every insert uses ON CONFLICT (id) DO NOTHING, so running
 * this twice will not create duplicates or throw errors on already-migrated
 * rows. This means you can fix a bug, re-run, and it will only insert the
 * rows that failed last time.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Pool } = require('pg');

const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Review = require('../src/models/Review');

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

const log = {
  info: (msg) => console.log(`[MIGRATE] ${msg}`),
  error: (msg, err) => console.error(`[MIGRATE][ERROR] ${msg}`, err?.message || err),
};

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  log.info('Connected to MongoDB');
};

const migrateProducts = async () => {
  const products = await Product.find({}).lean();
  log.info(`Found ${products.length} products in MongoDB`);

  let inserted = 0;
  let failed = 0;

  for (const p of products) {
    try {
      await pgPool.query(
        `INSERT INTO products
          (id, shipper_id, name, description, category, price, unit, stock, images, weight_per_unit, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          p._id.toString(),
          p.shipper.toString(),
          p.name,
          p.description,
          p.category,
          p.price,
          p.unit,
          p.stock,
          p.images || [],
          p.weightPerUnit,
          p.isActive,
          p.createdAt,
          p.updatedAt,
        ]
      );
      inserted++;
    } catch (err) {
      failed++;
      log.error(`Failed to migrate product ${p._id}`, err);
    }
  }

  log.info(`Products migration complete: ${inserted} inserted, ${failed} failed`);
};

const migrateOrders = async () => {
  const orders = await Order.find({}).lean();
  log.info(`Found ${orders.length} orders in MongoDB`);

  let inserted = 0;
  let failed = 0;
  let itemsInserted = 0;
  let itemsFailed = 0;

  for (const o of orders) {
    try {
      await pgPool.query(
        `INSERT INTO orders
          (id, buyer_id, shipper_id, product_total,
           delivery_line1, delivery_city, delivery_state, delivery_pincode, delivery_lng, delivery_lat,
           product_payment_status, product_payment_method, status, shipment_id,
           created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO NOTHING`,
        [
          o._id.toString(),
          o.buyer.toString(),
          o.shipper.toString(),
          o.productTotal,
          o.deliveryAddress?.line1 || '',
          o.deliveryAddress?.city || '',
          o.deliveryAddress?.state || '',
          o.deliveryAddress?.pincode || '',
          o.deliveryAddress?.location?.coordinates?.[0] || 0,
          o.deliveryAddress?.location?.coordinates?.[1] || 0,
          o.productPaymentStatus,
          o.productPaymentMethod || null,
          o.status,
          o.shipment ? o.shipment.toString() : null,
          o.createdAt,
          o.updatedAt,
        ]
      );
      inserted++;

      // order_items has a FK to products(id) — only insert an item if that
      // product was actually migrated (or already exists). Skips orphaned
      // references instead of crashing the whole migration.
      for (const item of o.items || []) {
        try {
          const productExists = await pgPool.query('SELECT id FROM products WHERE id = $1', [
            item.product.toString(),
          ]);
          if (productExists.rows.length === 0) {
            log.error(
              `Skipping order_item for order ${o._id}: referenced product ${item.product} not found in Postgres (was it deleted in Mongo?)`
            );
            itemsFailed++;
            continue;
          }

          await pgPool.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
             VALUES ($1, $2, $3, $4)`,
            [o._id.toString(), item.product.toString(), item.quantity, item.priceAtPurchase]
          );
          itemsInserted++;
        } catch (err) {
          itemsFailed++;
          log.error(`Failed to migrate order_item for order ${o._id}`, err);
        }
      }
    } catch (err) {
      failed++;
      log.error(`Failed to migrate order ${o._id}`, err);
    }
  }

  log.info(`Orders migration complete: ${inserted} inserted, ${failed} failed`);
  log.info(`Order items migration complete: ${itemsInserted} inserted, ${itemsFailed} failed`);
};

const migrateReviews = async () => {
  const reviews = await Review.find({}).lean();
  log.info(`Found ${reviews.length} reviews in MongoDB`);

  let inserted = 0;
  let failed = 0;
  let skipped = 0;

  for (const r of reviews) {
    try {
      // The exactly_one_target CHECK constraint requires exactly one of
      // shipment_id/order_id to be non-null. If review.order references
      // an order that failed to migrate above, this insert would violate
      // the order_id foreign key — check first and skip cleanly if so.
      if (r.order) {
        const orderExists = await pgPool.query('SELECT id FROM orders WHERE id = $1', [r.order.toString()]);
        if (orderExists.rows.length === 0) {
          log.error(`Skipping review ${r._id}: referenced order ${r.order} not found in Postgres`);
          skipped++;
          continue;
        }
      }

      await pgPool.query(
        `INSERT INTO reviews
          (id, reviewer_id, reviewee_id, reviewee_role, shipment_id, order_id, rating, comment, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          r._id.toString(),
          r.reviewer.toString(),
          r.reviewee.toString(),
          r.revieweeRole,
          r.shipment ? r.shipment.toString() : null,
          r.order ? r.order.toString() : null,
          r.rating,
          r.comment || '',
          r.createdAt,
          r.updatedAt,
        ]
      );
      inserted++;
    } catch (err) {
      failed++;
      log.error(`Failed to migrate review ${r._id}`, err);
    }
  }

  log.info(`Reviews migration complete: ${inserted} inserted, ${failed} failed, ${skipped} skipped`);
};

const run = async () => {
  try {
    await connectMongo();

    log.info('--- Starting migration: products ---');
    await migrateProducts();

    log.info('--- Starting migration: orders + order_items ---');
    await migrateOrders();

    log.info('--- Starting migration: reviews ---');
    await migrateReviews();

    log.info('Migration complete.');
  } catch (err) {
    log.error('Migration failed', err);
  } finally {
    await mongoose.disconnect();
    await pgPool.end();
    process.exit(0);
  }
};

run();