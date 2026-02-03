# Quick Start Guide

## 1. Get Your Shopify Credentials

### Step 1: Access Shopify Admin
1. Log into your Shopify store admin
2. Go to **Settings** (bottom left)

### Step 2: Create Custom App
1. Click **Apps and sales channels**
2. Click **Develop apps** button
3. Click **Create an app**
4. Enter app name (e.g., "Claude MCP Integration")
5. Click **Create app**

### Step 3: Configure API Scopes
1. Click **Configure Admin API scopes**
2. Select the following scopes:
   - `read_products` - Read products, variants, and collections
   - `read_orders` - Read orders and transactions
   - `read_customers` - Read customer details
   - `read_inventory` - Read inventory levels and locations
   - `read_price_rules` - Read discounts (optional)
3. Click **Save**

### Step 4: Install and Get Token
1. Click **Install app** button
2. Click **Install** to confirm
3. Go to **API credentials** tab
4. Click **Reveal token once** under **Admin API access token**
5. **IMPORTANT**: Copy this token immediately - you won't be able to see it again!

## 2. Configure the MCP Server

### Create .env file
```bash
cp .env.example .env
```

### Edit .env with your credentials
```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-01
```

**Notes:**
- Replace `your-store` with your actual Shopify store name
- The access token starts with `shpat_`
- Keep this file secure and never commit it to version control

## 3. Build the Server

```bash
npm install
npm run build
```

## 4. Configure Claude Desktop

### Find your config file location:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Add the server configuration:

```json
{
  "mcpServers": {
    "shopify": {
      "command": "node",
      "args": ["/absolute/path/to/Shopify-mcp-server/dist/index.js"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx",
        "SHOPIFY_API_VERSION": "2024-01"
      }
    }
  }
}
```

**Important:**
- Replace `/absolute/path/to/` with the actual full path to this project
- Use forward slashes (/) even on Windows
- Replace the environment variables with your actual Shopify credentials

## 5. Restart Claude Desktop

Close and reopen Claude Desktop for the changes to take effect.

## 6. Test the Connection

In Claude Desktop, try asking:
- "Show me my last 10 orders"
- "List all active products"
- "Search for customers with email containing 'example.com'"
- "What are my product collections?"

## Troubleshooting

### "SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN must be set"
- Check that your environment variables are correctly set in the config file
- Make sure there are no typos in your credentials

### "API rate limit exceeded"
- Shopify limits the number of API requests
- Wait a few minutes and try again
- Consider reducing the `limit` parameter in your queries

### "Invalid API version"
- Update `SHOPIFY_API_VERSION` to a supported version (e.g., "2024-01")
- Check Shopify's API documentation for current versions

### Server not showing up in Claude
- Verify the absolute path to `dist/index.js` is correct
- Check the JSON syntax in `claude_desktop_config.json`
- Make sure you restarted Claude Desktop after configuration changes
- Check Claude Desktop logs for error messages

## Example Usage

### Get recent orders
"Show me the 5 most recent orders"

### Search products
"Find all products that contain 'organic' in the title"

### Customer lookup
"Get details for customer ID 123456789"

### Inventory check
"What are my inventory levels?"

### Collections
"List all my product collections"

## Next Steps

- Explore all available tools in the README.md
- Set up appropriate API scopes for your needs
- Consider creating multiple apps for different environments (dev/production)
- Monitor your API usage in Shopify admin
