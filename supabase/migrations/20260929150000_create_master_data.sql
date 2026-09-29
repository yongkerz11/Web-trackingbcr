-- Enums
CREATE TYPE record_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE vendor_service_type AS ENUM ('LAST_MILE', 'AIR_CARGO', 'SEA_CARGO', 'LOCAL_DELIVERY', 'OTHER');
CREATE TYPE location_type AS ENUM ('WAREHOUSE', 'AIRPORT', 'PORT', 'VENDOR_LOCATION', 'OTHER');

-- Companies
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  company_code TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  status record_status NOT NULL DEFAULT 'ACTIVE'::record_status,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_companies_code ON public.companies(company_code);
CREATE INDEX idx_companies_name ON public.companies(company_name);

-- Vendors
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  vendor_code TEXT NOT NULL UNIQUE,
  vendor_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  service_type vendor_service_type,
  status record_status NOT NULL DEFAULT 'ACTIVE'::record_status,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT vendors_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_vendors_code ON public.vendors(vendor_code);
CREATE INDEX idx_vendors_name ON public.vendors(vendor_name);

-- Locations
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type location_type,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Indonesia',
  latitude NUMERIC,
  longitude NUMERIC,
  radius NUMERIC,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  status record_status NOT NULL DEFAULT 'ACTIVE'::record_status,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_locations_name ON public.locations(name);

-- Recipients
CREATE TABLE public.recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Indonesia',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT recipients_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_recipients_name ON public.recipients(name);
CREATE INDEX idx_recipients_phone ON public.recipients(phone);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_vendors_modtime BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_locations_modtime BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_recipients_modtime BEFORE UPDATE ON public.recipients FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS Policies
-- Companies
CREATE POLICY "Companies viewable by all authenticated users"
  ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Companies creatable by ADMIN and SUPER_ADMIN"
  ON public.companies FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
CREATE POLICY "Companies updatable by ADMIN and SUPER_ADMIN"
  ON public.companies FOR UPDATE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
CREATE POLICY "Companies deletable by ADMIN and SUPER_ADMIN"
  ON public.companies FOR DELETE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Vendors
CREATE POLICY "Vendors viewable by all authenticated users"
  ON public.vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vendors creatable by ADMIN and SUPER_ADMIN"
  ON public.vendors FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
CREATE POLICY "Vendors updatable by ADMIN and SUPER_ADMIN"
  ON public.vendors FOR UPDATE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
CREATE POLICY "Vendors deletable by ADMIN and SUPER_ADMIN"
  ON public.vendors FOR DELETE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Locations
CREATE POLICY "Locations viewable by all authenticated users"
  ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Locations creatable by ADMIN and SUPER_ADMIN"
  ON public.locations FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
CREATE POLICY "Locations updatable by ADMIN and SUPER_ADMIN"
  ON public.locations FOR UPDATE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
CREATE POLICY "Locations deletable by ADMIN and SUPER_ADMIN"
  ON public.locations FOR DELETE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Recipients
CREATE POLICY "Recipients viewable by all authenticated users"
  ON public.recipients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Recipients creatable by ADMIN and SUPER_ADMIN"
  ON public.recipients FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
CREATE POLICY "Recipients updatable by ADMIN and SUPER_ADMIN"
  ON public.recipients FOR UPDATE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
CREATE POLICY "Recipients deletable by ADMIN and SUPER_ADMIN"
  ON public.recipients FOR DELETE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Seed Data (For Development)
INSERT INTO public.companies (company_code, company_name, contact_person, status) VALUES
  ('CMP-001', 'Example Logistics Customer', 'John Doe', 'ACTIVE'),
  ('CMP-002', 'Example Corporate Customer', 'Jane Smith', 'ACTIVE')
ON CONFLICT (company_code) DO NOTHING;

INSERT INTO public.vendors (vendor_code, vendor_name, service_type, status) VALUES
  ('VND-001', 'Example Last Mile Partner', 'LAST_MILE', 'ACTIVE'),
  ('VND-002', 'Example Delivery Partner', 'LOCAL_DELIVERY', 'ACTIVE')
ON CONFLICT (vendor_code) DO NOTHING;

INSERT INTO public.locations (name, type, is_internal, city, status) VALUES
  ('Main Warehouse', 'WAREHOUSE', true, 'Jakarta', 'ACTIVE'),
  ('Soekarno-Hatta International Airport', 'AIRPORT', false, 'Tangerang', 'ACTIVE');

INSERT INTO public.recipients (name, phone, city) VALUES
  ('Example Recipient 1', '081234567890', 'Jakarta'),
  ('Example Recipient 2', '081234567891', 'Bandung');
