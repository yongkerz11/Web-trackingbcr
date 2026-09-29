-- Add tracking_identifier_type to companies if it doesn't exist
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS tracking_identifier_type TEXT DEFAULT 'AWB' 
CHECK (tracking_identifier_type IN ('AWB', 'NO_DLV'));

-- Create shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    awb TEXT NOT NULL UNIQUE,
    no_dlv TEXT,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    recipient_id UUID NOT NULL REFERENCES public.recipients(id) ON DELETE RESTRICT,
    origin_location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
    destination_location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE RESTRICT,
    description TEXT,
    package_count INTEGER NOT NULL DEFAULT 1 CHECK (package_count >= 1),
    weight DECIMAL(10, 2) CHECK (weight IS NULL OR weight > 0),
    weight_unit TEXT DEFAULT 'KG',
    current_status TEXT NOT NULL DEFAULT 'DE',
    shipment_date DATE NOT NULL,
    expected_delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_shipments_awb ON public.shipments(awb);
CREATE INDEX idx_shipments_no_dlv ON public.shipments(no_dlv);
CREATE INDEX idx_shipments_company_id ON public.shipments(company_id);
CREATE INDEX idx_shipments_recipient_id ON public.shipments(recipient_id);
CREATE INDEX idx_shipments_current_status ON public.shipments(current_status);
CREATE INDEX idx_shipments_shipment_date ON public.shipments(shipment_date);

-- Add trigger for updated_at
CREATE TRIGGER update_shipments_modtime
    BEFORE UPDATE ON public.shipments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Policies for shipments
CREATE POLICY "Shipments readable by everyone"
    ON public.shipments FOR SELECT
    USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'VIEWER'));

CREATE POLICY "Shipments creatable by OPERATOR, ADMIN, SUPER_ADMIN"
    ON public.shipments FOR INSERT
    WITH CHECK (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR'));

CREATE POLICY "Shipments updatable by OPERATOR, ADMIN, SUPER_ADMIN"
    ON public.shipments FOR UPDATE
    USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR'))
    WITH CHECK (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR'));

CREATE POLICY "Shipments deletable by ADMIN and SUPER_ADMIN"
    ON public.shipments FOR DELETE
    USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Seed data for testing BOTH identifiers (AWB + No DLV vs AWB only)
DO $$
DECLARE
    company_1_id UUID;
    company_2_id UUID;
    recipient_1_id UUID;
    loc_main_id UUID;
    loc_dest_id UUID;
BEGIN
    -- Only run seed if we have matching master data
    SELECT id INTO company_1_id FROM public.companies WHERE company_code = 'COMP-001' LIMIT 1;
    SELECT id INTO company_2_id FROM public.companies WHERE company_code = 'COMP-002' LIMIT 1;
    SELECT id INTO recipient_1_id FROM public.recipients WHERE name = 'Pozana Azima' LIMIT 1;
    SELECT id INTO loc_main_id FROM public.locations WHERE name = 'Main Warehouse' LIMIT 1;
    SELECT id INTO loc_dest_id FROM public.locations WHERE name = 'Soekarno-Hatta International Airport' LIMIT 1;

    IF company_1_id IS NOT NULL AND loc_main_id IS NOT NULL AND loc_dest_id IS NOT NULL THEN
        -- Configure Company 1 to use NO_DLV preference
        UPDATE public.companies SET tracking_identifier_type = 'NO_DLV' WHERE id = company_1_id;

        -- Shipment 1: Collaborator using No DLV
        INSERT INTO public.shipments (
            awb, no_dlv, company_id, recipient_id, origin_location_id, destination_location_id, 
            description, package_count, weight, current_status, shipment_date, expected_delivery_date
        ) VALUES (
            '3110190278971', '0685/PR.DLV/08/2025', company_1_id, recipient_1_id, loc_main_id, loc_dest_id,
            'Electronics', 2, 4.5, 'DE', '2026-09-29', '2026-10-02'
        ) ON CONFLICT (awb) DO NOTHING;
        
        -- Shipment 2: Standard AWB lookup
        INSERT INTO public.shipments (
            awb, no_dlv, company_id, recipient_id, origin_location_id, destination_location_id, 
            description, package_count, weight, current_status, shipment_date, expected_delivery_date
        ) VALUES (
            'AWB-20260929-0002', NULL, company_2_id, recipient_1_id, loc_main_id, loc_dest_id,
            'Documents', 1, 0.5, 'DE', '2026-09-29', '2026-10-01'
        ) ON CONFLICT (awb) DO NOTHING;
    END IF;
END $$;
