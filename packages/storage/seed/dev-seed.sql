-- Local dev data: `pnpm db:seed` replaces every row of the local D1 database.
-- Instants follow the clock of the run, so one event is always live.
-- The local wall-clock columns hold UTC times.

DELETE FROM auth_rate_limits;
DELETE FROM auth_verifications;
DELETE FROM auth_sessions;
DELETE FROM auth_credentials;
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
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c04', 'Mercati', 'market', unixepoch('now') * 1000);

INSERT INTO venues (id, name, address, latitude, longitude, created_by, created_at, updated_at) VALUES
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d01', 'Chiostro di San Domenico', 'Via Emilia 80, Imola', 44.3546, 11.7139, '0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d02', 'Rocca Sforzesca', 'Piazzale Giovanni dalle Bande Nere, Imola', 44.3521, 11.7096, '0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d03', 'Parco delle Acque Minerali', 'Viale Dante, Imola', 44.3466, 11.7178, '0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d04', 'Piazza Matteotti', 'Piazza Matteotti, Imola', 44.3536, 11.7149, '0d8f2a4e-6c1b-4e7a-9f3d-2b5c8e1a7d40', unixepoch('now') * 1000, unixepoch('now') * 1000);

INSERT INTO events (id, organizer_id, venue_id, title, description, starts_at_local, ends_at_local, recurrence, price, created_at, updated_at) VALUES
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01', '4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d01', 'Jazz al Chiostro', 'Trio acustico, standard e qualche sorpresa.',
        strftime('%Y-%m-%dT%H:%M', 'now', '-1 hour'), strftime('%Y-%m-%dT%H:%M', 'now', '+2 hours'), NULL, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e02', '4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d01', 'Stand-up in cortile', NULL,
        strftime('%Y-%m-%dT%H:%M', 'now', '+2 hours'), strftime('%Y-%m-%dT%H:%M', 'now', '+4 hours'), NULL, '10 €', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e03', '8c1d3e5f-7a9b-4c2d-9e4f-1a3b5c7d9e60', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d02', 'Mostra in Rocca', NULL,
        strftime('%Y-%m-%dT%H:%M', 'now', '-5 hours'), strftime('%Y-%m-%dT%H:%M', 'now', '-3 hours'), NULL, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e04', '8c1d3e5f-7a9b-4c2d-9e4f-1a3b5c7d9e60', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d03', 'Notte al parco', NULL,
        date('now', '+1 day') || 'T21:00', date('now', '+2 days') || 'T00:30', NULL, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e05', '8c1d3e5f-7a9b-4c2d-9e4f-1a3b5c7d9e60', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d04', 'Mercato del sabato', NULL,
        date('now', 'weekday 6') || 'T08:00', date('now', 'weekday 6') || 'T13:00',
        json_object('rule', json_object('frequency', 'weekly', 'weekdays', json_array('saturday'), 'until', date('now', 'weekday 6', '+21 days')), 'addedDates', json_array(), 'removedDates', json_array()),
        NULL, unixepoch('now') * 1000, unixepoch('now') * 1000);

INSERT INTO event_categories (event_id, category_id, is_primary) VALUES
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c01', 1),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c03', 0),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e02', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c02', 1),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e03', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c03', 1),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e04', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c01', 1),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e05', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c04', 1);

INSERT INTO event_occurrences (event_id, local_date, starts_at, ends_at) VALUES
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01', date('now', '-1 hour'), unixepoch('now', '-1 hour') * 1000, unixepoch('now', '+2 hours') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e02', date('now', '+2 hours'), unixepoch('now', '+2 hours') * 1000, unixepoch('now', '+4 hours') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e03', date('now', '-5 hours'), unixepoch('now', '-5 hours') * 1000, unixepoch('now', '-3 hours') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e04', date('now', '+1 day'), unixepoch(date('now', '+1 day') || ' 21:00') * 1000, unixepoch(date('now', '+2 days') || ' 00:30') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e05', date('now', 'weekday 6'), unixepoch(date('now', 'weekday 6') || ' 08:00') * 1000, unixepoch(date('now', 'weekday 6') || ' 13:00') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e05', date('now', 'weekday 6', '+7 days'), unixepoch(date('now', 'weekday 6', '+7 days') || ' 08:00') * 1000, unixepoch(date('now', 'weekday 6', '+7 days') || ' 13:00') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e05', date('now', 'weekday 6', '+14 days'), unixepoch(date('now', 'weekday 6', '+14 days') || ' 08:00') * 1000, unixepoch(date('now', 'weekday 6', '+14 days') || ' 13:00') * 1000),
    ('c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e05', date('now', 'weekday 6', '+21 days'), unixepoch(date('now', 'weekday 6', '+21 days') || ' 08:00') * 1000, unixepoch(date('now', 'weekday 6', '+21 days') || ' 13:00') * 1000);
