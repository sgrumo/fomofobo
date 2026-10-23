-- Local dev data: `pnpm db:seed` replaces every row of the local database.
-- Times follow the clock of the run, so one event is always live.
-- The wall-clock columns hold the local time of the machine, which must run in Europe/Rome.
-- The cover of Cinema Centrale needs its object in the local store, once:
-- AWS_ACCESS_KEY_ID=admin AWS_SECRET_ACCESS_KEY=admin aws --endpoint-url http://localhost:9000 s3 cp apps/fullstack-fomofobo/public/fallbacks/cinema.png s3://fomofobo/seed/cinema-centrale-cover.png

DELETE FROM rate_limits;
DELETE FROM auth_rate_limits;
DELETE FROM auth_verifications;
DELETE FROM auth_sessions;
DELETE FROM auth_credentials;
DELETE FROM occurrence_saves;
DELETE FROM event_occurrences;
DELETE FROM event_photos;
DELETE FROM event_categories;
DELETE FROM events;
DELETE FROM venues;
DELETE FROM categories;
DELETE FROM accounts;

INSERT INTO accounts (id, name, email, role, created_at, updated_at) VALUES
    ('0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', 'Admin', 'admin@fomofobo.local', 'admin', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50', 'Chiostro Live', 'chiostro@fomofobo.local', 'organizer', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('8c1d3e5f-7a9b-4c2d-9e4f-1a3b5c7d9e60', 'Rocca Eventi', 'rocca@fomofobo.local', 'organizer', unixepoch('now') * 1000, unixepoch('now') * 1000);

INSERT INTO categories (id, name, icon, created_at) VALUES
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c01', 'Musica', 'music', unixepoch('now') * 1000),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c02', 'Comedy', 'comedy', unixepoch('now') * 1000),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c03', 'Arte', 'art', unixepoch('now') * 1000),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c04', 'Mercati', 'market', unixepoch('now') * 1000),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c05', 'Cinema', 'cinema', unixepoch('now') * 1000);

INSERT INTO venues (id, name, address, latitude, longitude, created_by, created_at, updated_at) VALUES
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d01', 'Piazza Matteotti', 'Piazza Matteotti, Imola', 44.3533, 11.7147, '0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d02', 'Chiostro di San Domenico', 'Via Emilia 80, Imola', 44.3546, 11.7139, '0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d03', 'Rocca Sforzesca', 'Piazzale Giovanni dalle Bande Nere, Imola', 44.3521, 11.7096, '0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', unixepoch('now') * 1000, unixepoch('now') * 1000);

INSERT INTO venues (id, name, address, latitude, longitude, kind, programme_url, category_id, cover_object_key, created_by, created_at, updated_at) VALUES
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d04', 'Cinema Centrale', 'Via Appia 12, Imola', 44.3557, 11.7178, 'cinema', 'https://example.com/cinema-centrale/programmazione', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c05', 'seed/cinema-centrale-cover.png', '0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d05', 'Musei di San Domenico', 'Via Sacchi 4, Imola', 44.3547, 11.7140, 'museum', 'https://example.com/musei-san-domenico/mostre', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c03', NULL, '0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', unixepoch('now') * 1000, unixepoch('now') * 1000);

INSERT INTO events (id, organizer_id, venue_id, title, description, starts_at_local, ends_at_local, recurrence, is_free, full_price_cents, created_at, updated_at) VALUES
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01', '4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d02', 'Jazz al Chiostro', 'Trio acustico, standard e qualche sorpresa.',
        strftime('%Y-%m-%dT%H:%M', 'now', 'localtime', '-1 hour'), strftime('%Y-%m-%dT%H:%M', 'now', 'localtime', '+2 hours'), NULL, 0, 1000, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e02', '8c1d3e5f-7a9b-4c2d-9e4f-1a3b5c7d9e60', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d03', 'Mostra in Rocca', NULL,
        strftime('%Y-%m-%dT%H:%M', 'now', 'localtime', '-5 hours'), strftime('%Y-%m-%dT%H:%M', 'now', 'localtime', '-3 hours'), NULL, 1, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e03', '4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d01', 'Notte in piazza', 'Stand-up e musica fino a tardi.',
        date('now', 'localtime', '+1 day') || 'T21:00', date('now', 'localtime', '+2 days') || 'T00:30', NULL, 1, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e04', '8c1d3e5f-7a9b-4c2d-9e4f-1a3b5c7d9e60', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d01', 'Mercato del sabato', NULL,
        date('now', 'localtime', 'weekday 6') || 'T08:00', date('now', 'localtime', 'weekday 6') || 'T13:00',
        json_object('rule', json_object('frequency', 'weekly', 'weekdays', json_array('saturday'), 'until', date('now', 'localtime', 'weekday 6', '+14 days')), 'addedDates', json_array(), 'removedDates', json_array()),
        1, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e05', '4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d04', 'Rassegna d''autore', 'Un classico restaurato, in lingua originale.',
        strftime('%Y-%m-%dT%H:%M', 'now', 'localtime', '+3 hours'), strftime('%Y-%m-%dT%H:%M', 'now', 'localtime', '+5 hours'), NULL, 0, 800, unixepoch('now') * 1000, unixepoch('now') * 1000);

INSERT INTO event_categories (event_id, category_id, is_primary) VALUES
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c01', 1),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e02', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c03', 1),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e03', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c02', 1),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e03', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c01', 0),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e04', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c04', 1),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e05', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c05', 1);

-- `unixepoch(<local wall clock>, 'utc')` reads the text as the local time of the machine
INSERT INTO event_occurrences (event_id, local_date, starts_at, ends_at)
SELECT event_id, substr(starts_at_local, 1, 10), unixepoch(starts_at_local, 'utc') * 1000, unixepoch(ends_at_local, 'utc') * 1000
FROM (
    SELECT id AS event_id, starts_at_local, ends_at_local FROM events WHERE recurrence IS NULL
    UNION ALL
    SELECT 'c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e04', date('now', 'localtime', 'weekday 6', '+' || weeks.n || ' days') || 'T08:00', date('now', 'localtime', 'weekday 6', '+' || weeks.n || ' days') || 'T13:00'
    FROM (SELECT 0 AS n UNION ALL SELECT 7 UNION ALL SELECT 14) AS weeks
);

-- 21 saves put the live occurrence above the default participant threshold of 20
WITH RECURSIVE devices(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM devices WHERE n < 21)
INSERT INTO occurrence_saves (event_id, local_date, device_id, created_at)
SELECT event_id, local_date, 'seed-device-' || n, unixepoch('now') * 1000
FROM event_occurrences, devices
WHERE event_id = 'c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01';
