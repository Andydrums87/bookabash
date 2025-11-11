# Party Tracking Analytics Queries

This document contains useful SQL queries for analyzing customer behavior using the `party_tracking` table.

## Timeline Structure

Each session has an `action_timeline` column that contains an array of actions:

```json
[
  {
    "action": "party_planning_started",
    "timestamp": "2025-01-11T12:00:00.000Z",
    "data": {
      "theme": "princess",
      "guestCount": 15,
      "hasOwnVenue": false
    }
  },
  {
    "action": "supplier_added",
    "timestamp": "2025-01-11T12:05:00.000Z",
    "data": {
      "supplier": {
        "id": "123",
        "name": "Magic Moments Entertainment",
        "category": "entertainment"
      },
      "current_suppliers": [...],
      "total_cost": 150
    }
  },
  {
    "action": "supplier_removed",
    "timestamp": "2025-01-11T12:10:00.000Z",
    "data": {
      "supplier_type": "venue",
      "current_suppliers": [...],
      "total_cost": 150
    }
  }
]
```

## Useful Queries

### 1. View all actions for a specific session

```sql
SELECT
  session_id,
  email,
  status,
  jsonb_pretty(action_timeline) as timeline
FROM party_tracking
WHERE session_id = 'YOUR_SESSION_ID';
```

### 2. Count supplier additions and removals per session

```sql
SELECT
  session_id,
  email,
  status,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(action_timeline) as action
    WHERE action->>'action' = 'supplier_added'
  ) as suppliers_added,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(action_timeline) as action
    WHERE action->>'action' = 'supplier_removed'
  ) as suppliers_removed,
  started_at,
  last_activity
FROM party_tracking
WHERE status != 'paid'
ORDER BY last_activity DESC;
```

### 3. Find sessions with lots of supplier changes (indecisive customers)

```sql
SELECT
  session_id,
  email,
  status,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(action_timeline) as action
    WHERE action->>'action' IN ('supplier_added', 'supplier_removed')
  ) as total_changes,
  last_activity
FROM party_tracking
WHERE status IN ('browsing', 'checkout')
ORDER BY total_changes DESC
LIMIT 20;
```

### 4. View timeline of specific actions (supplier changes only)

```sql
SELECT
  session_id,
  email,
  action->>'action' as action_type,
  action->>'timestamp' as action_time,
  action->'data'->>'supplier_type' as supplier_type,
  action->'data'->'supplier'->>'name' as supplier_name,
  action->'data'->'supplier'->>'category' as supplier_category
FROM party_tracking,
  jsonb_array_elements(action_timeline) as action
WHERE action->>'action' IN ('supplier_added', 'supplier_removed')
  AND status != 'paid'
ORDER BY action->>'timestamp' DESC
LIMIT 50;
```

### 5. Abandoned carts with recent activity

```sql
SELECT
  session_id,
  email,
  current_step,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(action_timeline) as action
    WHERE action->>'action' = 'supplier_added'
  ) as suppliers_in_plan,
  last_activity,
  AGE(NOW(), last_activity) as time_since_last_activity
FROM party_tracking
WHERE status IN ('browsing', 'checkout')
  AND last_activity > NOW() - INTERVAL '24 hours'
ORDER BY last_activity DESC;
```

### 6. Most popular supplier combinations

```sql
WITH supplier_combos AS (
  SELECT
    session_id,
    array_agg(
      DISTINCT action->'data'->'supplier'->>'category'
    ) as categories
  FROM party_tracking,
    jsonb_array_elements(action_timeline) as action
  WHERE action->>'action' = 'supplier_added'
    AND action->'data'->'supplier'->>'category' IS NOT NULL
  GROUP BY session_id
)
SELECT
  categories,
  COUNT(*) as combo_count
FROM supplier_combos
GROUP BY categories
ORDER BY combo_count DESC
LIMIT 20;
```

### 7. Average time between actions

```sql
WITH action_times AS (
  SELECT
    session_id,
    (action->>'timestamp')::timestamp as action_time,
    action->>'action' as action_type
  FROM party_tracking,
    jsonb_array_elements(action_timeline) as action
  WHERE status = 'paid'
)
SELECT
  action_type,
  AVG(
    EXTRACT(EPOCH FROM (
      LEAD(action_time) OVER (PARTITION BY session_id ORDER BY action_time) - action_time
    )) / 60
  ) as avg_minutes_to_next_action
FROM action_times
GROUP BY action_type
ORDER BY avg_minutes_to_next_action DESC;
```

### 8. Conversion funnel analysis

```sql
SELECT
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT session_id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(action_timeline) as action
      WHERE action->>'action' = 'party_planning_started'
    )
  ) as started_planning,
  COUNT(DISTINCT session_id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(action_timeline) as action
      WHERE action->>'action' = 'supplier_added'
    )
  ) as added_suppliers,
  COUNT(DISTINCT session_id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(action_timeline) as action
      WHERE action->>'action' = 'checkout_started'
    )
  ) as reached_checkout,
  COUNT(DISTINCT session_id) FILTER (WHERE status = 'paid') as completed_payment
FROM party_tracking
WHERE started_at > NOW() - INTERVAL '30 days';
```

### 9. Most removed suppliers (what customers don't want)

```sql
SELECT
  action->'data'->>'supplier_type' as supplier_type,
  COUNT(*) as removal_count
FROM party_tracking,
  jsonb_array_elements(action_timeline) as action
WHERE action->>'action' = 'supplier_removed'
GROUP BY supplier_type
ORDER BY removal_count DESC;
```

### 10. Sessions with email but not paid (prime targets for recovery)

```sql
SELECT
  session_id,
  email,
  current_step,
  (
    SELECT jsonb_agg(DISTINCT action->'data'->'supplier'->>'category')
    FROM jsonb_array_elements(action_timeline) as action
    WHERE action->>'action' = 'supplier_added'
  ) as supplier_categories,
  party_data->>'theme' as theme,
  party_data->>'guestCount' as guest_count,
  last_activity,
  AGE(NOW(), last_activity) as time_since_activity
FROM party_tracking
WHERE email IS NOT NULL
  AND status IN ('checkout', 'browsing')
  AND last_activity > NOW() - INTERVAL '7 days'
ORDER BY last_activity DESC;
```

## Dashboard Metrics

### Key Performance Indicators

```sql
SELECT
  -- Overall conversion rate
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'paid') / NULLIF(COUNT(*), 0),
    2
  ) as conversion_rate_pct,

  -- Average suppliers per completed party
  ROUND(
    AVG(
      (SELECT COUNT(*)
       FROM jsonb_array_elements(action_timeline) as action
       WHERE action->>'action' = 'supplier_added')
    ) FILTER (WHERE status = 'paid'),
    2
  ) as avg_suppliers_per_party,

  -- Abandoned cart rate
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'abandoned') / NULLIF(COUNT(*), 0),
    2
  ) as abandoned_rate_pct,

  -- Average session duration (minutes)
  ROUND(
    AVG(EXTRACT(EPOCH FROM (last_activity - started_at)) / 60),
    2
  ) as avg_session_duration_minutes

FROM party_tracking
WHERE started_at > NOW() - INTERVAL '30 days';
```
