-- Reminder System Diagnostic Queries
-- Run these to diagnose why reminders aren't being sent

-- 1. Check appointments in the next 24-hour window
SELECT 
  a.id,
  a.tenant_id,
  a.scheduled_at,
  a.status,
  p.email as patient_email,
  p.first_name || ' ' || p.last_name as patient_name,
  u.full_name as professional_name,
  EXTRACT(EPOCH FROM (a.scheduled_at - NOW())) / 3600 as hours_from_now
FROM appointments a
INNER JOIN patients p ON p.id = a.patient_id
LEFT JOIN users u ON u.tenant_id = a.tenant_id AND u.role = 'professional'
WHERE a.scheduled_at BETWEEN 
  NOW() + INTERVAL '23 hours' AND 
  NOW() + INTERVAL '25 hours'
  AND a.status IN ('pending', 'confirmed')
ORDER BY a.scheduled_at;

-- 2. Check reminder delivery history for today
SELECT 
  rd.appointment_id,
  rd.patient_email,
  rd.status,
  rd.error_message,
  rd.retry_count,
  rd.sent_at,
  a.scheduled_at
FROM reminder_deliveries rd
LEFT JOIN appointments a ON a.id = rd.appointment_id
WHERE DATE(rd.sent_at) = CURRENT_DATE
ORDER BY rd.sent_at DESC;

-- 3. Check reminder success rate (last 7 days)
SELECT 
  DATE(sent_at) as date,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'sent') / NULLIF(COUNT(*), 0), 2) as success_rate_pct
FROM reminder_deliveries
WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;

-- 4. Check patients without email addresses
SELECT 
  p.id,
  p.tenant_id,
  p.first_name,
  p.last_name,
  p.email,
  COUNT(a.id) as upcoming_appointments
FROM patients p
LEFT JOIN appointments a ON a.patient_id = p.id 
  AND a.scheduled_at > NOW()
  AND a.status IN ('pending', 'confirmed')
WHERE p.email IS NULL OR p.email = ''
GROUP BY p.id, p.tenant_id, p.first_name, p.last_name, p.email
HAVING COUNT(a.id) > 0;

-- 5. Check opted-out patients
SELECT 
  ro.patient_id,
  ro.tenant_id,
  p.first_name || ' ' || p.last_name as patient_name,
  p.email,
  ro.opted_out_at
FROM reminder_opt_outs ro
INNER JOIN patients p ON p.id = ro.patient_id
ORDER BY ro.opted_out_at DESC;

-- 6. Check recent failed reminders
SELECT 
  rd.appointment_id,
  rd.patient_email,
  rd.error_message,
  rd.retry_count,
  rd.sent_at,
  a.scheduled_at
FROM reminder_deliveries rd
LEFT JOIN appointments a ON a.id = rd.appointment_id
WHERE rd.status = 'failed'
  AND rd.sent_at >= NOW() - INTERVAL '7 days'
ORDER BY rd.sent_at DESC
LIMIT 20;

-- 7. Check server timezone vs appointment times
SELECT 
  NOW() as server_time,
  NOW() + INTERVAL '24 hours' as target_time,
  NOW() + INTERVAL '23 hours' as window_start,
  NOW() + INTERVAL '25 hours' as window_end,
  CURRENT_SETTING('TIMEZONE') as db_timezone;
