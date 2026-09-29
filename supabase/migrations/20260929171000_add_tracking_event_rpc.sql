CREATE OR REPLACE FUNCTION public.add_tracking_event(
  p_shipment_id UUID,
  p_status TEXT,
  p_timestamp TIMESTAMPTZ,
  p_location_id UUID DEFAULT NULL,
  p_station TEXT DEFAULT NULL,
  p_comment TEXT DEFAULT NULL,
  p_reason_code TEXT DEFAULT NULL,
  p_reason_note TEXT DEFAULT NULL,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_signature_url TEXT DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_event_id UUID;
  v_current_status TEXT;
  v_valid_transition BOOLEAN;
BEGIN
  -- Get user info
  v_user_id := auth.uid();
  v_role := public.get_user_role();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  IF v_role NOT IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR') THEN
    RAISE EXCEPTION 'Unauthorized role';
  END IF;

  -- Lock shipment for update to prevent concurrent race conditions
  SELECT current_status INTO v_current_status 
  FROM public.shipments 
  WHERE id = p_shipment_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shipment not found';
  END IF;

  -- Validate transition
  -- Valid flows: DE -> ST -> AR -> OD -> OK or OD -> RT
  v_valid_transition := false;
  IF v_current_status = 'DE' AND p_status = 'ST' THEN v_valid_transition := true; END IF;
  IF v_current_status = 'ST' AND p_status = 'AR' THEN v_valid_transition := true; END IF;
  IF v_current_status = 'AR' AND p_status = 'OD' THEN v_valid_transition := true; END IF;
  IF v_current_status = 'OD' AND p_status = 'OK' THEN v_valid_transition := true; END IF;
  IF v_current_status = 'OD' AND p_status = 'RT' THEN v_valid_transition := true; END IF;
  
  IF NOT v_valid_transition AND v_role NOT IN ('SUPER_ADMIN', 'ADMIN') THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_status;
  END IF;
  
  -- Insert tracking event
  INSERT INTO public.tracking_events (
    shipment_id, status, timestamp, location_id, station, 
    comment, reason_code, reason_note, latitude, longitude, 
    photo_url, signature_url, created_by
  ) VALUES (
    p_shipment_id, p_status, p_timestamp, p_location_id, p_station,
    p_comment, p_reason_code, p_reason_note, p_latitude, p_longitude,
    p_photo_url, p_signature_url, v_user_id
  ) RETURNING id INTO v_event_id;

  -- Update shipment status
  UPDATE public.shipments
  SET current_status = p_status
  WHERE id = p_shipment_id;

  RETURN jsonb_build_object('success', true, 'event_id', v_event_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
