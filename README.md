# SmartShop Lite

A small, complete e-commerce demo app:

- **Frontend:** plain HTML, CSS, and vanilla JavaScript (no framework)
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB (via Mongoose)

Features: product listing with search, category filters, price range and
sorting; product detail pages; a persistent shopping cart with quantity
controls; and a lightweight admin page to add, edit, and delete products.

```
smartshop-lite/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Route handler logic
│   ├── middleware/              # Admin-key auth + error handling
│   ├── models/Product.js       # Mongoose schema
│   ├── routes/products.js      # /api/products routes
│   ├── utils/seed.js           # Sample data seeder
│   ├── server.js               # App entry point
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── css/style.css
│   ├── js/
│   │   ├── config.js            # API base URL (edit for deployment)
│   │   ├── api.js                # fetch() wrapper for the backend
│   │   ├── cart.js               # localStorage cart + cart drawer UI
│   │   ├── main.js               # Storefront (search/filter/sort/paginate)
│   │   ├── product.js            # Product detail page
│   │   └── admin.js              # Admin CRUD page
│   ├── index.html                # Storefront
│   ├── product.html              # Product detail
│   ├── admin.html                # Admin panel
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 1. Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A MongoDB instance — either:
  - installed locally (`mongod` running on `localhost:27017`), or
  - a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), or
  - run via Docker (see below)

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env if needed (MongoDB URI, port, admin key)
npm install
npm run seed     # optional: populate the database with sample products
npm run dev       # starts the API with nodemon on http://localhost:5000
```

Verify it's running: open `http://localhost:5000/api/health` — you should see
`{"status":"ok", ...}`.

### Environment variables (`backend/.env`)

| Variable         | Description                                             | Example                                      |
|-------------------|----------------------------------------------------------|-----------------------------------------------|
| `PORT`            | Port the API listens on                                  | `5000`                                        |
| `MONGODB_URI`     | MongoDB connection string                                 | `mongodb://127.0.0.1:27017/smartshop_lite`   |
| `CLIENT_ORIGIN`   | Comma-separated list of allowed frontend origins (CORS)   | `http://localhost:5500,http://127.0.0.1:5500`|
| `ADMIN_KEY`       | Secret required in the `x-admin-key` header for writes    | `changeme123`                                 |

## 3. Frontend setup

The frontend is fully static — no build step required.

1. Open `frontend/js/config.js` and confirm `SMARTSHOP_API_BASE_URL` points
   at your backend (defaults to `http://localhost:5000/api`).
2. Serve the `frontend/` folder with any static server, for example:

   ```bash
   cd frontend
   npx serve .
   # or: python3 -m http.server 5500
   ```

3. Open the printed URL (e.g. `http://localhost:5500`) in your browser.

> If you open `index.html` directly via `file://`, the browser's CORS rules
> may block API calls — always serve the frontend over `http://`.

## 4. Using the app

- **Shop:** search, filter by category, filter by price, sort, and paginate
  through products. Click a product to view its detail page, adjust
  quantity, and add it to the cart. The cart icon in the header opens a
  slide-out drawer where you can change quantities or remove items; the cart
  is saved in `localStorage` so it survives page reloads.
- **Admin:** go to the "Admin" link in the header. Enter the `ADMIN_KEY`
  value from your backend `.env` into the "Admin key" box (it's remembered
  locally), then add, edit, or delete products. The key is sent as the
  `x-admin-key` header on every write request.

## 5. REST API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                     | Auth       | Description                                   |
|--------|-------------------------------|------------|------------------------------------------------|
| GET    | `/products`                   | Public     | List products. Query params: `search`, `category`, `minPrice`, `maxPrice`, `sort` (`newest`\|`price_asc`\|`price_desc`\|`name_asc`), `page`, `limit` |
| GET    | `/products/categories`        | Public     | List distinct category names                   |
| GET    | `/products/:id`               | Public     | Get a single product                            |
| POST   | `/products`                   | Admin key  | Create a product                                |
| PUT    | `/products/:id`               | Admin key  | Update a product                                |
| DELETE | `/products/:id`               | Admin key  | Delete a product                                |
| GET    | `/health`                     | Public     | Health check                                    |

Admin-only routes require the header `x-admin-key: <your ADMIN_KEY>`.

Example product payload for `POST`/`PUT`:

```json
{
  "name": "Aria Wireless Headphones",
  "description": "Over-ear wireless headphones with ANC.",
  "price": 129.99,
  "category": "Electronics",
  "imageUrl": "https://example.com/headphones.jpg",
  "stock": 42,
  "featured": true
}
```

## 6. Running with Docker

A `Dockerfile` is included for both `backend/` and `frontend/`, plus a
root `docker-compose.yml` that wires up MongoDB, the API, and the static
frontend (served via nginx) together.

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017 (persisted in a named volume)

To seed sample data into the Dockerized database:

```bash
docker compose exec backend npm run seed
```

Adjust `ADMIN_KEY`, `CLIENT_ORIGIN`, and ports in `docker-compose.yml` for
your environment before deploying anywhere public.

## 7. Notes & next steps

This is a "lite" reference implementation meant to be easy to read and
extend. Things you'd likely want before shipping to production:

- Replace the shared `ADMIN_KEY` header with real authentication (JWT +
  hashed passwords, or a proper session/login flow).
- Add image upload instead of raw image URLs.
- Add order/checkout persistence — the current "Checkout" button is a demo
  placeholder.
- Add automated tests for the API routes.
