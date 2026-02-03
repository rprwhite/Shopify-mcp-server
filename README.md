# Shopify MCP Server

A Model Context Protocol (MCP) server for integrating with Shopify Admin API. This server provides tools to access and manage products, customers, orders, inventory, and collections from your Shopify store.

## Features

- **Product Management**: Get, search, and filter products
- **Order Management**: Retrieve and filter orders by status
- **Customer Management**: Access and search customer information
- **Inventory Tracking**: Check inventory levels across locations
- **Collections**: Access custom and smart collections

## Prerequisites

- Node.js 18 or higher
- A Shopify store with Admin API access
- Shopify app client credentials (Client ID and Client Secret)

## Setup

### 1. Get Shopify API Credentials

As of January 1, 2026, Shopify requires using the **Client Credentials Grant** flow for server-to-server authentication. You need to create a custom app in your Shopify admin to get client credentials:

1. Go to your Shopify admin panel
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app** and give it a name
4. Go to **Configuration** tab
5. Under **Admin API access scopes**, select the scopes you need:
   - `read_products` - for product access
   - `read_orders` - for order access
   - `read_customers` - for customer access
   - `read_inventory` - for inventory levels
6. Click **Save** to save your configuration
7. Go to **API credentials** tab
8. Copy your **Client ID** and **Client Secret**

**Important:** The MCP server will automatically obtain and refresh access tokens using these credentials. Access tokens are valid for 24 hours and will be automatically refreshed before expiration.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your Shopify credentials:

```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_CLIENT_ID=your-client-id-here
SHOPIFY_CLIENT_SECRET=your-client-secret-here
SHOPIFY_API_VERSION=2024-01
```

### 4. Build the Server

```bash
npm run build
```

## Usage with Claude Desktop

Add this server to your Claude Desktop configuration file:

### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shopify": {
      "command": "node",
      "args": ["/Shopify-mcp-server/dist/index.js"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_CLIENT_ID": "your-client-id-here",
        "SHOPIFY_CLIENT_SECRET": "your-client-secret-here",
        "SHOPIFY_API_VERSION": "2024-01"
      }
    }
  }
}
```

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json` with similar configuration.

After adding the configuration, restart Claude Desktop.

## Available Tools

### Products

#### `get_products`
Retrieve products with optional filtering.

**Parameters:**
- `limit` (number, optional): Number of products to retrieve (max 250, default 50)
- `status` (string, optional): Filter by status ("active", "archived", "draft")
- `product_type` (string, optional): Filter by product type
- `vendor` (string, optional): Filter by vendor
- `collection_id` (string, optional): Filter by collection ID

#### `get_product`
Get detailed information about a specific product.

**Parameters:**
- `product_id` (string, required): The ID of the product

#### `search_products`
Search products by title.

**Parameters:**
- `query` (string, required): Search query string
- `limit` (number, optional): Number of results (max 250, default 50)

### Orders

#### `get_orders`
Retrieve orders with optional filtering.

**Parameters:**
- `limit` (number, optional): Number of orders (max 250, default 50)
- `status` (string, optional): Filter by status ("open", "closed", "cancelled", "any")
- `financial_status` (string, optional): Filter by financial status
- `fulfillment_status` (string, optional): Filter by fulfillment status

#### `get_order`
Get detailed information about a specific order.

**Parameters:**
- `order_id` (string, required): The ID of the order

### Customers

#### `get_customers`
Retrieve customers from the store.

**Parameters:**
- `limit` (number, optional): Number of customers (max 250, default 50)

#### `get_customer`
Get detailed information about a specific customer.

**Parameters:**
- `customer_id` (string, required): The ID of the customer

#### `search_customers`
Search customers by email, name, or phone.

**Parameters:**
- `query` (string, required): Search query (email, name, or phone)
- `limit` (number, optional): Number of results (max 250, default 50)

### Inventory

#### `get_inventory_levels`
Get inventory levels for products at specific locations.

**Parameters:**
- `inventory_item_ids` (array, optional): Array of inventory item IDs
- `location_ids` (array, optional): Array of location IDs
- `limit` (number, optional): Number of results (max 250, default 50)

### Collections

#### `get_collections`
Retrieve both custom and smart collections.

**Parameters:**
- `limit` (number, optional): Number of collections (max 250, default 50)

## Example Queries

Once connected to Claude Desktop, you can ask questions like:

- "Show me the last 10 orders"
- "Find all products with 'beer' in the title"
- "Get customer information for customer ID 123456"
- "What are my active product collections?"
- "Show me unfulfilled orders"
- "Search for customers with email containing 'example.com'"

## Development

### Watch Mode
For development with auto-rebuild:

```bash
npm run dev
```

### Testing
You can test the server directly using the MCP Inspector or by connecting it to Claude Desktop.

## Security Notes

- Never commit your `.env` file or expose your client credentials
- Store your Client ID and Client Secret securely
- Use appropriate API scopes - only request the permissions you need
- Rotate your client credentials if they are ever compromised
- Monitor your API usage in Shopify admin
- Access tokens are automatically managed and refreshed every 24 hours

## Troubleshooting

### "SHOPIFY_STORE_URL, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET must be set"
Make sure your `.env` file exists and contains valid credentials, or that environment variables are properly set in your Claude Desktop configuration.

### "Failed to fetch access token"
This error occurs when the client credentials are invalid or the app doesn't have permission to access the store. Verify that:
- Your Client ID and Client Secret are correct
- The app is installed on your Shopify store
- The app has the necessary API access scopes configured

### API Rate Limits
Shopify has rate limits on API requests. The server doesn't currently implement rate limiting, so be mindful of rapid successive requests.

### Invalid API Version
If you encounter API version errors, update the `SHOPIFY_API_VERSION` in your environment to a supported version (e.g., "2024-01").

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
