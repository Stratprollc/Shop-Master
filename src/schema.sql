-- Shop Master - Multi-Merchant Messaging Gateway Database Schema Migration
-- Designed for PostgreSQL / Cloud SQL relational backends linked to existing merchant records.

-- 1. Create Enums for Gateway States and Routes
CREATE TYPE whatsapp_connection_status AS ENUM ('connected', 'disconnected');
CREATE TYPE sms_gateway_status AS ENUM ('active', 'disabled');
CREATE TYPE message_dispatch_route AS ENUM ('whatsapp', 'sms', 'manual_redirect');
CREATE TYPE message_delivery_status AS ENUM ('delivered', 'failed', 'pending');

-- 2. Create the merchant_gateways table
CREATE TABLE IF NOT EXISTS merchant_gateways (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR(128) NOT NULL UNIQUE, -- Foreign key reference corresponding to auth/shop identifier
    zender_whatsapp_device_id VARCHAR(255) DEFAULT NULL, -- Unique WhatsApp Web session identifier on Sellerscampus Zender SaaS
    zender_sms_device_id VARCHAR(255) DEFAULT NULL, -- Unique hardware Android gateway SIM token
    whatsapp_status whatsapp_connection_status DEFAULT 'disconnected'::whatsapp_connection_status,
    sms_status sms_gateway_status DEFAULT 'disabled'::sms_gateway_status,
    default_route message_dispatch_route DEFAULT 'manual_redirect'::message_dispatch_route,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the delivery_failures or delivery_logs table for campaign auditing
CREATE TABLE IF NOT EXISTS messaging_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id VARCHAR(128) NOT NULL,
    recipient_name VARCHAR(255) DEFAULT 'Customer',
    recipient_phone VARCHAR(64) NOT NULL,
    gateway_route message_dispatch_route NOT NULL,
    message_body TEXT NOT NULL,
    status message_delivery_status DEFAULT 'pending'::message_delivery_status,
    raw_response TEXT DEFAULT NULL, -- Full JSON response from Zender API endpoints for parsing exceptions
    error_message TEXT DEFAULT NULL, -- Captured delivery exception string if failure occurs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Set up relational indexes to optimize querying and lookups during live checkout triggers
CREATE INDEX IF NOT EXISTS idx_merchant_gateways_merchant_id ON merchant_gateways(merchant_id);
CREATE INDEX IF NOT EXISTS idx_messaging_logs_merchant_status ON messaging_delivery_logs(merchant_id, status);

-- 5. Trigger procedure to automatically update updated_at flag on modifications
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_merchant_gateways_modtime
BEFORE UPDATE ON merchant_gateways
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

COMMENT ON TABLE merchant_gateways IS 'Stores the white-label device tokens, connection states, and fallback routing for SaaS-based automated WhatsApp and Android SMS.';
COMMENT ON COLUMN merchant_gateways.zender_whatsapp_device_id IS 'References the session token registered via app.sellerscampus.com API node client.';
