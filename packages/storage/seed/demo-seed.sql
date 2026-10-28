-- Demo data for a deployed environment, around the default city of Imola. It covers the map
-- cases: every status, a venue with two and three results, clusters, a spot that never splits,
-- permanent venues with and without events, a weekly event, every price shape, and a blocked
-- event.
--
-- Run it on the database of the environment, with its URL and a database token:
-- DATABASE_URL=<libsql url> DATABASE_AUTH_TOKEN=<token> pnpm -C packages/storage db:run-sql seed/demo-seed.sql
--
-- It touches only its own rows, whose ids start with `de300000-0000-4000-8000-`, and replaces
-- them on each run. It adds a missing category by name and leaves an existing one alone.
-- Times follow the clock of the run. The database clock runs in UTC, so the wall-clock columns
-- add one hour for Europe/Rome in winter time. From 2027-03-28 to 2027-10-31, use two hours.

DELETE FROM occurrence_saves WHERE event_id LIKE 'de300000-0000-4000-8000-%';
DELETE FROM event_occurrences WHERE event_id LIKE 'de300000-0000-4000-8000-%';
DELETE FROM event_categories WHERE event_id LIKE 'de300000-0000-4000-8000-%';
DELETE FROM events WHERE id LIKE 'de300000-0000-4000-8000-%';
DELETE FROM venues WHERE id LIKE 'de300000-0000-4000-8000-%';
DELETE FROM accounts WHERE id LIKE 'de300000-0000-4000-8000-%';

INSERT INTO accounts (id, name, email, role, created_at, updated_at) VALUES
    ('de300000-0000-4000-8000-0000000000a1', 'Demo Eventi', 'demo-eventi@fomofobo.local', 'organizer', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-0000000000a2', 'Demo Cultura', 'demo-cultura@fomofobo.local', 'organizer', unixepoch('now') * 1000, unixepoch('now') * 1000);

INSERT INTO categories (id, name, icon, created_at)
SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-8' || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
    wanted.name, wanted.icon, unixepoch('now') * 1000
FROM (
    SELECT 'Musica' AS name, 'music' AS icon
    UNION ALL SELECT 'Comedy', 'comedy'
    UNION ALL SELECT 'Arte', 'art'
    UNION ALL SELECT 'Teatro', 'theatre'
    UNION ALL SELECT 'Cinema', 'cinema'
    UNION ALL SELECT 'Cibo', 'food'
    UNION ALL SELECT 'Festa', 'party'
    UNION ALL SELECT 'Incontri', 'talk'
    UNION ALL SELECT 'Sport', 'sport'
    UNION ALL SELECT 'Mercati', 'market'
) AS wanted
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories.name = wanted.name);

-- Regular venues. Bar Centrale and Enoteca Vicolo sit 15 m apart: no zoom splits them.
INSERT INTO venues (id, name, address, latitude, longitude, description, created_by, created_at, updated_at) VALUES
    ('de300000-0000-4000-8000-000000000b01', 'Parco delle Acque Minerali', 'Viale delle Acque Minerali, Imola', 44.3445, 11.7120, 'Il parco sulla collina, con il palco all''aperto.', 'de300000-0000-4000-8000-0000000000a1', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b02', 'Piazza Gramsci', 'Piazza Gramsci, Imola', 44.3540, 11.7155, NULL, 'de300000-0000-4000-8000-0000000000a1', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b03', 'Bar Centrale', 'Via Mazzini 20, Imola', 44.3560, 11.7120, NULL, 'de300000-0000-4000-8000-0000000000a1', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b04', 'Enoteca Vicolo', 'Via Mazzini 22, Imola', 44.3561, 11.7121, NULL, 'de300000-0000-4000-8000-0000000000a1', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b05', 'Autodromo Enzo e Dino Ferrari', 'Via Fratelli Rosselli 2, Imola', 44.3439, 11.7167, 'Il circuito, con il paddock aperto al pubblico.', 'de300000-0000-4000-8000-0000000000a1', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b06', 'Circolo Sabbioni', 'Via Sabbioni 4, Imola', 44.3600, 11.7350, NULL, 'de300000-0000-4000-8000-0000000000a2', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b07', 'Palazzetto Ruggi', 'Via Ruggi 1, Imola', 44.3400, 11.7250, NULL, 'de300000-0000-4000-8000-0000000000a2', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b08', 'Piazza Caduti per la Libertà', 'Piazza Caduti per la Libertà, Imola', 44.3528, 11.7135, NULL, 'de300000-0000-4000-8000-0000000000a2', unixepoch('now') * 1000, unixepoch('now') * 1000);

-- Permanent venues, each in the color of permanent venues whatever the date filter
INSERT INTO venues (id, name, address, latitude, longitude, kind, programme_url, category_id, created_by, created_at, updated_at) VALUES
    ('de300000-0000-4000-8000-000000000b11', 'Cinema Cappuccini', 'Via Cappuccini 15, Imola', 44.3590, 11.7020, 'cinema', 'https://example.com/cinema-cappuccini', (SELECT id FROM categories WHERE name = 'Cinema'), 'de300000-0000-4000-8000-0000000000a2', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b12', 'Teatro dell''Osservanza', 'Via Venturini 18, Imola', 44.3505, 11.7065, 'theatre', 'https://example.com/teatro-osservanza', (SELECT id FROM categories WHERE name = 'Teatro'), 'de300000-0000-4000-8000-0000000000a2', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b13', 'Galleria del Chiostro', 'Via Emilia 70, Imola', 44.3525, 11.7180, 'gallery', 'https://example.com/galleria-chiostro', (SELECT id FROM categories WHERE name = 'Arte'), 'de300000-0000-4000-8000-0000000000a2', unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000b14', 'Museo della Città', 'Via Sacchi 6, Imola', 44.3550, 11.7200, 'museum', 'https://example.com/museo-citta', (SELECT id FROM categories WHERE name = 'Arte'), 'de300000-0000-4000-8000-0000000000a2', unixepoch('now') * 1000, unixepoch('now') * 1000);

INSERT INTO events (id, organizer_id, venue_id, title, description, starts_at_local, ends_at_local, recurrence, is_free, full_price_cents, reduced_prices, membership_name, membership_cost_cents, minimum_age, price_notes, capacity, is_blocked, block_reason, created_at, updated_at) VALUES
    -- Live, paid with a reduced price, saved above the participant threshold, two categories
    ('de300000-0000-4000-8000-000000000e01', 'de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000b01', 'Concerto al Parco', 'Band dal vivo sul palco del parco, con area ristoro.',
        strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '-1 hour'), strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '+2 hours'), NULL,
        0, 1200, json_array(json_object('label', 'Under 18', 'amountCents', 800)), NULL, NULL, NULL, NULL, 300, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- Upcoming today at the same venue: the live pin shows +1
    ('de300000-0000-4000-8000-000000000e02', 'de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000b01', 'DJ set al tramonto', NULL,
        strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '+4 hours'), strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '+7 hours'), NULL,
        1, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- Three results at one venue: ended, live and upcoming, so the live pin shows +2
    ('de300000-0000-4000-8000-000000000e03', 'de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000b02', 'Mercatino del mattino', NULL,
        strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '-6 hours'), strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '-3 hours'), NULL,
        1, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000e04', 'de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000b02', 'Teatro di strada', 'Giocolieri e acrobati in piazza.',
        strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '-30 minutes'), strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '+90 minutes'), NULL,
        0, NULL, '[]', NULL, NULL, NULL, 'Offerta libera a fine spettacolo', NULL, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000e05', 'de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000b02', 'Stand-up in piazza', NULL,
        strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '+2 hours'), strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '+210 minutes'), NULL,
        0, 500, '[]', 'Tessera ARCI', 1000, NULL, NULL, NULL, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- Tomorrow: two reduced prices, a minimum age and a capacity
    ('de300000-0000-4000-8000-000000000e06', 'de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000b05', 'Notte dei motori', 'Giri di pista, paddock aperto e musica.',
        date('now', '+1 hour', '+1 day') || 'T20:30', date('now', '+1 hour', '+1 day') || 'T23:00', NULL,
        0, 2500, json_array(json_object('label', 'Ridotto', 'amountCents', 1500), json_object('label', 'Bambini', 'amountCents', 500)), NULL, NULL, 14, NULL, 2000, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- Next Sunday at the same venue, for the weekend filter
    ('de300000-0000-4000-8000-000000000e07', 'de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000b05', 'Corsa podistica in pista', NULL,
        date('now', '+1 hour', '+1 day', 'weekday 0') || 'T09:00', date('now', '+1 hour', '+1 day', 'weekday 0') || 'T12:00', NULL,
        1, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- At a permanent cinema: its preview pages through the event first, the cinema last
    ('de300000-0000-4000-8000-000000000e08', 'de300000-0000-4000-8000-0000000000a2', 'de300000-0000-4000-8000-000000000b11', 'Proiezione speciale: un titolo molto lungo che va a capo su più righe nell''anteprima', 'Versione restaurata, in lingua originale con sottotitoli.',
        strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '+3 hours'), strftime('%Y-%m-%dT%H:%M', 'now', '+1 hour', '+5 hours'), NULL,
        0, 700, '[]', NULL, NULL, NULL, NULL, 120, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- Tomorrow at two venues 15 m apart
    ('de300000-0000-4000-8000-000000000e09', 'de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000b03', 'Aperitivo jazz', NULL,
        date('now', '+1 hour', '+1 day') || 'T18:30', date('now', '+1 hour', '+1 day') || 'T20:30', NULL,
        1, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    ('de300000-0000-4000-8000-000000000e10', 'de300000-0000-4000-8000-0000000000a1', 'de300000-0000-4000-8000-000000000b04', 'Degustazione di vini', NULL,
        date('now', '+1 hour', '+1 day') || 'T19:00', date('now', '+1 hour', '+1 day') || 'T21:00', NULL,
        0, 1500, '[]', NULL, NULL, 18, NULL, 30, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- Nine days ahead: outside the default window, inside a custom range
    ('de300000-0000-4000-8000-000000000e11', 'de300000-0000-4000-8000-0000000000a2', 'de300000-0000-4000-8000-000000000b06', 'Fiera del libro', NULL,
        date('now', '+1 hour', '+9 days') || 'T10:00', date('now', '+1 hour', '+9 days') || 'T19:00', NULL,
        1, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- Tonight past midnight, with a membership card of no cost
    ('de300000-0000-4000-8000-000000000e12', 'de300000-0000-4000-8000-0000000000a2', 'de300000-0000-4000-8000-000000000b07', 'Notte elettronica', NULL,
        date('now', '+1 hour') || 'T22:00', date('now', '+1 hour', '+1 day') || 'T02:00', NULL,
        0, 1000, '[]', 'Tessera del circolo', NULL, 18, NULL, NULL, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- Every Saturday for three weeks
    ('de300000-0000-4000-8000-000000000e13', 'de300000-0000-4000-8000-0000000000a2', 'de300000-0000-4000-8000-000000000b08', 'Mercato contadino', 'Produttori locali, frutta, verdura e formaggi.',
        date('now', '+1 hour', 'weekday 6') || 'T08:00', date('now', '+1 hour', 'weekday 6') || 'T13:00',
        json_object('rule', json_object('frequency', 'weekly', 'weekdays', json_array('saturday'), 'until', date('now', '+1 hour', 'weekday 6', '+14 days')), 'addedDates', json_array(), 'removedDates', json_array()),
        1, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 0, NULL, unixepoch('now') * 1000, unixepoch('now') * 1000),
    -- Blocked: the backoffice lists it with its reason, the public app hides it
    ('de300000-0000-4000-8000-000000000e14', 'de300000-0000-4000-8000-0000000000a2', 'de300000-0000-4000-8000-000000000b02', 'Evento bloccato di prova', NULL,
        date('now', '+1 hour', '+2 days') || 'T21:00', date('now', '+1 hour', '+2 days') || 'T23:00', NULL,
        1, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 1, 'Dati del luogo da verificare', unixepoch('now') * 1000, unixepoch('now') * 1000);

INSERT INTO event_categories (event_id, category_id, is_primary)
SELECT link.event_id, categories.id, link.is_primary
FROM (
    SELECT 'de300000-0000-4000-8000-000000000e01' AS event_id, 'Musica' AS name, 1 AS is_primary
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e01', 'Festa', 0
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e02', 'Festa', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e03', 'Mercati', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e04', 'Teatro', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e05', 'Comedy', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e06', 'Sport', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e07', 'Sport', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e08', 'Cinema', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e09', 'Musica', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e09', 'Cibo', 0
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e10', 'Cibo', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e11', 'Incontri', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e12', 'Festa', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e12', 'Musica', 0
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e13', 'Mercati', 1
    UNION ALL SELECT 'de300000-0000-4000-8000-000000000e14', 'Incontri', 1
) AS link
JOIN categories ON categories.name = link.name;

-- `unixepoch(<Rome wall clock>, '-1 hour')` turns the winter time of Rome into UTC
INSERT INTO event_occurrences (event_id, local_date, starts_at, ends_at)
SELECT event_id, substr(starts_at_local, 1, 10), unixepoch(starts_at_local, '-1 hour') * 1000, unixepoch(ends_at_local, '-1 hour') * 1000
FROM (
    SELECT id AS event_id, starts_at_local, ends_at_local FROM events
    WHERE id LIKE 'de300000-0000-4000-8000-%' AND recurrence IS NULL
    UNION ALL
    SELECT 'de300000-0000-4000-8000-000000000e13', date('now', '+1 hour', 'weekday 6', '+' || weeks.n || ' days') || 'T08:00', date('now', '+1 hour', 'weekday 6', '+' || weeks.n || ' days') || 'T13:00'
    FROM (SELECT 0 AS n UNION ALL SELECT 7 UNION ALL SELECT 14) AS weeks
);

-- 25 saves put the live concert above a participant threshold of 20
WITH RECURSIVE devices(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM devices WHERE n < 25)
INSERT INTO occurrence_saves (event_id, local_date, device_id, created_at)
SELECT event_id, local_date, 'demo-device-' || n, unixepoch('now') * 1000
FROM event_occurrences, devices
WHERE event_id = 'de300000-0000-4000-8000-000000000e01';
