# Lakebase Setup Guide

This guide explains how to set up Databricks Lakebase for the personal finance app.

## Overview

[Lakebase](https://www.databricks.com/product/lakebase) is Databricks' managed PostgreSQL-compatible database for OLTP workloads. This app uses Lakebase to persist:
- Chat history and messages
- User profiles

## Prerequisites

- Access to a Databricks workspace
- Permission to create Lakebase instances (most users have this by default)
- For local development: a Databricks personal access token (PAT)

## Step 1: Create a Lakebase Instance

1. Open your Databricks workspace
2. Click **Compute** in the sidebar
3. Select the **Lakebase Provisioned** tab
4. Click **Create database instance**
5. Enter an instance name:
   - 1-63 characters
   - Must start with a letter
   - Letters and hyphens only (no underscores or spaces)
   - Example: `personal-finance-db`
6. Click **Create**

You'll automatically become the database owner with `databricks_superuser` role.

### Optional Configuration

Expand **Advanced Settings** during creation to configure:

| Setting | Default | Description |
|---------|---------|-------------|
| Instance size | 2 compute units | Adjust based on workload |
| Restore window | 7 days | Point-in-time recovery (2-35 days) |
| High availability | Disabled | Enable for production |

## Step 2: Configure for Databricks Apps

When deploying your app to Databricks Apps:

1. Go to **Workspace** > **Apps** > your app
2. Click **Configure** (or configure during initial deployment)
3. In the **App resources** section, click **+ Add resource**
4. Select **Database** as the resource type
5. Choose your Lakebase instance and database (usually `databricks_postgres`)
6. Set permission to **Can connect and create**
7. Deploy the app

### Environment Variables Set Automatically

When deployed, Databricks sets these environment variables for your app:

```
PGHOST=<your-instance-host>
PGPORT=5432
PGDATABASE=databricks_postgres
PGUSER=<service-principal-client-id>
PGSSLMODE=require
```

The app detects these automatically and connects without additional configuration.

## Step 3: Local Development Setup

For local development, add these to your `.env.local` file:

```bash
# Option A: Instance name (recommended)
LAKEBASE_INSTANCE_NAME=your-instance-name
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi...

# Option B: Direct connection URL (if you have one)
LAKEBASE_PG_URL=postgresql://user:password@host:5432/database?sslmode=require
```

Option A uses OAuth tokens generated via the Databricks SDK. Option B is a direct PostgreSQL connection string.

## How the App Connects

The app (`server/db/database.py`) supports three connection modes, checked in order:

1. **Direct URL**: If `LAKEBASE_PG_URL` is set, uses it directly
2. **Databricks Apps**: If `PGHOST` is set (auto-configured in Databricks Apps), builds connection from PG* env vars
3. **Instance Name**: If `LAKEBASE_INSTANCE_NAME` is set, looks up the instance via Databricks SDK and uses OAuth tokens

Authentication is handled by `server/db/lakebase_auth.py`, which:
- Generates OAuth tokens via the Databricks SDK
- Caches tokens for performance
- Auto-refreshes tokens before expiration (every 45 minutes)

## Troubleshooting

### "Permission denied" when creating instance
Contact your workspace admin to grant database instance creation permissions.

### Connection fails in local development
1. Verify `DATABRICKS_HOST` includes `https://`
2. Verify `DATABRICKS_TOKEN` is a valid PAT with workspace access
3. Verify `LAKEBASE_INSTANCE_NAME` matches exactly (case-sensitive)

### App falls back to in-memory storage
Check the app logs for database connection errors. The app gracefully falls back to in-memory storage if PostgreSQL is unavailable.

### Migrations fail on startup
Migrations run automatically via Alembic. Check:
- Database permissions (need `CREATE` privilege)
- Network connectivity to Lakebase instance
- SSL mode compatibility

## References

- [Create and manage a database instance | Databricks](https://docs.databricks.com/aws/oltp/create/)
- [Add a Lakebase resource to a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/lakebase)
- [Lakebase Product Page](https://www.databricks.com/product/lakebase)
