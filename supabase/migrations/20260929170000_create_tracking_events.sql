CREATE TABLE IF NOT EXISTS public.tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('DE', 'ST', 'AR', 'OD', 'OK', 'RT')),
    timestamp TIMESTAMPTZ NOT NULL,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    station TEXT,
    comment TEXT,
    reason_code TEXT,
    reason_note TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    photo_url TEXT,
    signature_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying tracking events by shipment
CREATE INDEX idx_tracking_events_shipment_id ON public.tracking_events(shipment_id);
CREATE INDEX idx_tracking_events_timestamp ON public.tracking_events(timestamp);

-- Enable RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Policies for tracking_events
CREATE POLICY "Tracking events readable by everyone"
    ON public.tracking_events FOR SELECT
    USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'VIEWER'));

CREATE POLICY "Tracking events creatable by OPERATOR, ADMIN, SUPER_ADMIN"
    ON public.tracking_events FOR INSERT
    WITH CHECK (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR'));

CREATE POLICY "Tracking events updatable by OPERATOR, ADMIN, SUPER_ADMIN"
    ON public.tracking_events FOR UPDATE
    USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR'))
    WITH CHECK (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR'));

CREATE POLICY "Tracking events deletable by ADMIN and SUPER_ADMIN"
    ON public.tracking_events FOR DELETE
    USING (public.get_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- Seed data for testing tracking events (DE, ST, AR, OD, OK)
DO $$
DECLARE
    shipment_1_id UUID;
    loc_main_id UUID;
    loc_dest_id UUID;
BEGIN
    SELECT id INTO shipment_1_id FROM public.shipments WHERE awb = '3110190278971' LIMIT 1;
    SELECT id INTO loc_main_id FROM public.locations WHERE name = 'Main Warehouse' LIMIT 1;
    SELECT id INTO loc_dest_id FROM public.locations WHERE name = 'Soekarno-Hatta International Airport' LIMIT 1;
    
    IF shipment_1_id IS NOT NULL THEN
        -- Add initial Data Entry event if it doesn't exist (prevent duplicates in seed)
        IF NOT EXISTS (SELECT 1 FROM public.tracking_events WHERE shipment_id = shipment_1_id AND status = 'DE') THEN
            INSERT INTO public.tracking_events (shipment_id, status, timestamp, station)
            VALUES (shipment_1_id, 'DE', '2026-09-29 09:30:00+07', 'System');
            
            INSERT INTO public.tracking_events (shipment_id, status, timestamp, location_id, station)
            VALUES (shipment_1_id, 'ST', '2026-09-29 10:15:00+07', loc_main_id, 'Main Warehouse');

            INSERT INTO public.tracking_events (shipment_id, status, timestamp, location_id, station)
            VALUES (shipment_1_id, 'AR', '2026-09-29 15:20:00+07', loc_dest_id, 'Soekarno-Hatta International Airport');

            INSERT INTO public.tracking_events (shipment_id, status, timestamp, station, comment)
            VALUES (shipment_1_id, 'OD', '2026-09-30 09:15:00+07', 'Mataram Ncs', 'On Delivery');

            INSERT INTO public.tracking_events (shipment_id, status, timestamp, station, comment, latitude, longitude)
            VALUES (shipment_1_id, 'OK', '2026-09-30 09:43:17+07', 'Mataram Ncs', 'Success Delivered', -8.6167812, 116.1169707);

            -- Update shipment current_status
            UPDATE public.shipments SET current_status = 'OK' WHERE id = shipment_1_id;
        END IF;
    END IF;
END $$;
