-- A free-text price becomes a paid scheme that keeps the text as its notes; no price stays free.
UPDATE `events` SET `is_free` = 0, `price_notes` = `price` WHERE `price` IS NOT NULL;
