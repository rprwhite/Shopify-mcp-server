#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { shopifyApi, LATEST_API_VERSION, ApiVersion } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = (process.env.SHOPIFY_API_VERSION || LATEST_API_VERSION) as ApiVersion;

if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
  console.error("Error: SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN must be set in environment variables");
  process.exit(1);
}

// Initialize Shopify API
const shopify = shopifyApi({
  apiSecretKey: "not-needed-for-admin-api",
  apiVersion: SHOPIFY_API_VERSION,
  isCustomStoreApp: true,
  adminApiAccessToken: SHOPIFY_ACCESS_TOKEN,
  isEmbeddedApp: false,
  hostName: SHOPIFY_STORE_URL.replace(/^https?:\/\//, ""),
});

const session = shopify.session.customAppSession(SHOPIFY_STORE_URL);

// Create MCP server
const server = new Server(
  {
    name: "shopify-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: "get_products",
    description: "Retrieve products from Shopify store. Supports pagination and filtering by status, product type, vendor, or collection.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of products to retrieve (max 250)",
          default: 50,
        },
        status: {
          type: "string",
          enum: ["active", "archived", "draft"],
          description: "Filter products by status",
        },
        product_type: {
          type: "string",
          description: "Filter by product type",
        },
        vendor: {
          type: "string",
          description: "Filter by vendor",
        },
        collection_id: {
          type: "string",
          description: "Filter by collection ID",
        },
      },
    },
  },
  {
    name: "get_product",
    description: "Get detailed information about a specific product by ID",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "The ID of the product",
        },
      },
      required: ["product_id"],
    },
  },
  {
    name: "search_products",
    description: "Search products by title or description",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query string",
        },
        limit: {
          type: "number",
          description: "Number of results to return (max 250)",
          default: 50,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_orders",
    description: "Retrieve orders from Shopify store with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of orders to retrieve (max 250)",
          default: 50,
        },
        status: {
          type: "string",
          enum: ["open", "closed", "cancelled", "any"],
          description: "Filter orders by status",
          default: "any",
        },
        financial_status: {
          type: "string",
          enum: ["authorized", "pending", "paid", "partially_paid", "refunded", "voided", "partially_refunded", "any"],
          description: "Filter by financial status",
        },
        fulfillment_status: {
          type: "string",
          enum: ["shipped", "partial", "unshipped", "any", "unfulfilled"],
          description: "Filter by fulfillment status",
        },
      },
    },
  },
  {
    name: "get_order",
    description: "Get detailed information about a specific order by ID",
    inputSchema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "The ID of the order",
        },
      },
      required: ["order_id"],
    },
  },
  {
    name: "get_customers",
    description: "Retrieve customers from Shopify store",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of customers to retrieve (max 250)",
          default: 50,
        },
      },
    },
  },
  {
    name: "get_customer",
    description: "Get detailed information about a specific customer by ID",
    inputSchema: {
      type: "object",
      properties: {
        customer_id: {
          type: "string",
          description: "The ID of the customer",
        },
      },
      required: ["customer_id"],
    },
  },
  {
    name: "search_customers",
    description: "Search customers by email, name, or phone",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (email, name, or phone)",
        },
        limit: {
          type: "number",
          description: "Number of results to return (max 250)",
          default: 50,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_inventory_levels",
    description: "Get inventory levels for products at specific locations",
    inputSchema: {
      type: "object",
      properties: {
        inventory_item_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of inventory item IDs",
        },
        location_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of location IDs",
        },
        limit: {
          type: "number",
          description: "Number of results (max 250)",
          default: 50,
        },
      },
    },
  },
  {
    name: "get_collections",
    description: "Retrieve product collections (custom and smart collections)",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of collections to retrieve (max 250)",
          default: 50,
        },
      },
    },
  },
];

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const client = new shopify.clients.Rest({ session });

    switch (name) {
      case "get_products": {
        const params: any = {
          limit: (args?.limit as number) || 50,
        };
        if (args?.status) params.status = args.status;
        if (args?.product_type) params.product_type = args.product_type;
        if (args?.vendor) params.vendor = args.vendor;
        if (args?.collection_id) params.collection_id = args.collection_id;

        const response = await client.get({ path: "products", query: params });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.body, null, 2),
            },
          ],
        };
      }

      case "get_product": {
        const response = await client.get({
          path: `products/${args?.product_id}`,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.body, null, 2),
            },
          ],
        };
      }

      case "search_products": {
        const response = await client.get({
          path: "products",
          query: {
            limit: (args?.limit as number) || 50,
            title: args?.query,
          } as any,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.body, null, 2),
            },
          ],
        };
      }

      case "get_orders": {
        const params: any = {
          limit: (args?.limit as number) || 50,
          status: args?.status || "any",
        };
        if (args?.financial_status) params.financial_status = args.financial_status;
        if (args?.fulfillment_status) params.fulfillment_status = args.fulfillment_status;

        const response = await client.get({ path: "orders", query: params });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.body, null, 2),
            },
          ],
        };
      }

      case "get_order": {
        const response = await client.get({
          path: `orders/${args?.order_id}`,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.body, null, 2),
            },
          ],
        };
      }

      case "get_customers": {
        const response = await client.get({
          path: "customers",
          query: { limit: (args?.limit as number) || 50 } as any,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.body, null, 2),
            },
          ],
        };
      }

      case "get_customer": {
        const response = await client.get({
          path: `customers/${args?.customer_id}`,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.body, null, 2),
            },
          ],
        };
      }

      case "search_customers": {
        const response = await client.get({
          path: "customers/search",
          query: {
            query: args?.query,
            limit: (args?.limit as number) || 50,
          } as any,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.body, null, 2),
            },
          ],
        };
      }

      case "get_inventory_levels": {
        const params: any = { limit: (args?.limit as number) || 50 };
        if (args?.inventory_item_ids && Array.isArray(args.inventory_item_ids)) {
          params.inventory_item_ids = args.inventory_item_ids.join(",");
        }
        if (args?.location_ids && Array.isArray(args.location_ids)) {
          params.location_ids = args.location_ids.join(",");
        }

        const response = await client.get({
          path: "inventory_levels",
          query: params,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.body, null, 2),
            },
          ],
        };
      }

      case "get_collections": {
        const limit = (args?.limit as number) || 50;
        const [customResponse, smartResponse] = await Promise.all([
          client.get({
            path: "custom_collections",
            query: { limit: Math.floor(limit / 2) } as any,
          }),
          client.get({
            path: "smart_collections",
            query: { limit: Math.floor(limit / 2) } as any,
          }),
        ]);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  custom_collections: customResponse.body,
                  smart_collections: smartResponse.body,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}\n${error.response?.body ? JSON.stringify(error.response.body, null, 2) : ""}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shopify MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
