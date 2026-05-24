import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dotenv = require('dotenv')
dotenv.config()

import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  const client = await pool.connect()

  try {
    // Create warehouses
    const w1 = await client.query(
      `INSERT INTO "Warehouse" (id, name, location, "createdAt") VALUES (gen_random_uuid()::text, $1, $2, NOW()) RETURNING id`,
      ['Mumbai Warehouse', 'Mumbai, India']
    )
    const w2 = await client.query(
      `INSERT INTO "Warehouse" (id, name, location, "createdAt") VALUES (gen_random_uuid()::text, $1, $2, NOW()) RETURNING id`,
      ['Delhi Warehouse', 'Delhi, India']
    )

    const warehouse1Id = w1.rows[0].id
    const warehouse2Id = w2.rows[0].id

    const products = [
      { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone', price: 134900 },
      { name: 'Samsung Galaxy S24', description: 'Latest Samsung flagship', price: 79999 },
      { name: 'Sony WH-1000XM5', description: 'Premium noise cancelling headphones', price: 29990 },
      { name: 'MacBook Air M3', description: 'Thin and powerful laptop', price: 114900 },
    ]

    for (const product of products) {
      const p = await client.query(
        `INSERT INTO "Product" (id, name, description, price, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING id`,
        [product.name, product.description, product.price]
      )
      const productId = p.rows[0].id

      await client.query(
        `INSERT INTO "Stock" (id, "productId", "warehouseId", total, reserved) VALUES (gen_random_uuid()::text, $1, $2, $3, $4)`,
        [productId, warehouse1Id, 10, 0]
      )
      await client.query(
        `INSERT INTO "Stock" (id, "productId", "warehouseId", total, reserved) VALUES (gen_random_uuid()::text, $1, $2, $3, $4)`,
        [productId, warehouse2Id, 5, 0]
      )
    }

    console.log('✅ Seed data created successfully!')
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(console.error)