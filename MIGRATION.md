# Migration Guide: Client Credentials Grant

As of January 1, 2026, Shopify no longer allows generating explicit Admin API access tokens. This MCP server has been updated to use the **Client Credentials Grant** flow for authentication.

## What Changed

### Before (Old Authentication)
- Used a static Admin API access token (`SHOPIFY_ACCESS_TOKEN`)
- Token was long-lived and manually managed
- Required manual rotation

### After (New Authentication)
- Uses Client ID and Client Secret (`SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`)
- Automatically obtains short-lived access tokens (24-hour expiration)
- Automatically refreshes tokens before expiration
- More secure and compliant with Shopify's latest requirements

## How to Migrate

### Step 1: Get Your Client Credentials

1. Go to your Shopify admin panel
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Select your existing app (or create a new one if needed)
4. Go to the **API credentials** tab
5. Copy your **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

#### If using `.env` file:

**Old configuration:**
```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-01
```

**New configuration:**
```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_CLIENT_ID=your-client-id-here
SHOPIFY_CLIENT_SECRET=your-client-secret-here
SHOPIFY_API_VERSION=2024-01
```

#### If using Claude Desktop config:

**Old configuration:**
```json
{
  "mcpServers": {
    "shopify": {
      "command": "node",
      "args": ["/path/to/Shopify-mcp-server/dist/index.js"],
      "env": {
        "SHOPIFY_STORE_URL": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxxxxxxxxxx",
        "SHOPIFY_API_VERSION": "2024-01"
      }
    }
  }
}
```

**New configuration:**
```json
{
  "mcpServers": {
    "shopify": {
      "command": "node",
      "args": ["/path/to/Shopify-mcp-server/dist/index.js"],
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

### Step 3: Update the Server

```bash
cd /path/to/Shopify-mcp-server
git pull  # Get the latest changes
npm install  # Update dependencies if needed
npm run build  # Rebuild the server
```

### Step 4: Restart Claude Desktop

After updating the configuration, restart Claude Desktop for the changes to take effect.

## Benefits of the New Authentication

1. **Automatic Token Management**: The server handles token refresh automatically
2. **Enhanced Security**: Short-lived tokens reduce the risk of credential compromise
3. **Compliance**: Meets Shopify's latest security requirements
4. **No Manual Rotation**: Tokens refresh automatically every 24 hours

## Troubleshooting

### Error: "SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET must be set"

Make sure you've updated your environment variables with the new client credentials and removed the old `SHOPIFY_ACCESS_TOKEN` variable.

### Error: "Failed to fetch access token"

Verify that:
- Your Client ID and Client Secret are correct
- The app is installed on your Shopify store
- The app has the necessary API access scopes configured
- Your store URL is correct (format: `your-store.myshopify.com`)

### Token Refresh Issues

The server automatically refreshes tokens 5 minutes before they expire. If you see frequent token refresh messages in the logs, this is normal behavior. The server maintains a token cache to minimize API calls.

## Need Help?

If you encounter issues during migration, please check:
- [Shopify's Client Credentials Documentation](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant)
- The updated [README.md](./README.md) for setup instructions
- Open an issue on the GitHub repository

## Security Reminder

- Never commit your `.env` file or client credentials to version control
- Store credentials securely and rotate them if compromised
- Only grant the minimum necessary API scopes for your use case
