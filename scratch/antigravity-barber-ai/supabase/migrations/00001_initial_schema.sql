-- Phase 4: Database Schema (High-Level)
-- Antigravity Barber AI
-- Auto-generated initial schema for Supabase

-- 1. Merchants Table
-- Stores the shop's config, API keys or references, and timezone.
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_name TEXT NOT NULL,
    vapi_assistant_id TEXT,       -- Reference to the Vapi.ai assistant for this specific shop
    whatsapp_phone_id TEXT,       -- Reference to the WhatsApp Business Phone ID
    timezone TEXT DEFAULT 'UTC',  -- e.g., 'America/New_York'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Services Table
-- Defines the cuts/services offered by each merchant.
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,           -- e.g., "Men's Haircut", "Fade + Beard"
    price NUMERIC(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Appointments Table
-- Tracks the booking status of each call
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT NOT NULL, -- Used for WhatsApp reminders/recovery
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    google_calendar_event_id TEXT, -- To keep sync with the barber's calendar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers for updated_at (Supabase standard)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- RLS (Row Level Security) Policies
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Assuming there is an authenticated user flow later where merchants manage their own stuff:
-- CREATE POLICY "Merchants view their own profiles" ON merchants FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Merchants manage their services" ON services FOR ALL USING (auth.uid() = merchant_id);
-- CREATE POLICY "Merchants manage their appointments" ON appointments FOR ALL USING (auth.uid() = merchant_id);

