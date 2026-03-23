-- =========================================================================
--  ROYAL TABLE APP: Delete all test seasons
-- =========================================================================

-- WARNING: This will delete ALL seasons from the database, including 
-- the 'Beta Season' and any newly created test seasons.

-- Since events are linked to seasons with 'ON DELETE SET NULL', 
-- deleting these seasons will simply unlink them from previously 
-- created events without deleting the events themselves.

DELETE FROM public.seasons;
