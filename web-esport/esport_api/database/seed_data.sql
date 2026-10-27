-- 1. Tambah Users (kolom: password, mmr_point, role)
INSERT INTO users (username, password, mmr_point, role) VALUES
  ('RakaXtreme', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 2150, 'user'),
  ('SoraByte', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 1820, 'user'),
  ('Vexel', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 1740, 'user'),
  ('KiroZen', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 1900, 'user'),
  ('NamiExe', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 1650, 'user'),
  ('AresNova', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 2300, 'user'),
  ('Noctis', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 1980, 'user'),
  ('TidalWave', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 1890, 'user'),
  ('Reverb', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 1780, 'user'),
  ('Mikael', '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 2050, 'user')
ON CONFLICT (username) DO NOTHING;

-- 2. Tambah Turnamen (kolom: total_slots, available_slots, status)
INSERT INTO tournaments (name, total_slots, available_slots, status) VALUES
  ('NEXUS CHAMPIONSHIP 2026', 16, 16, 'open'),
  ('MIDNIGHT BRAWL SERIES', 8, 8, 'open'),
  ('APEX MASTERS ASIA', 16, 16, 'open'),
  ('GARUDA INVITATIONAL CUP', 8, 8, 'open')
ON CONFLICT (lower(btrim(name))) DO NOTHING;

-- 3. Tambah Tim & Kapten
DO $$
DECLARE
  v_raka_id INT;
  v_ares_id INT;
  v_noctis_id INT;
  v_tidal_id INT;
  v_mikael_id INT;
  v_team_phoenix INT;
  v_team_void INT;
  v_team_kraken INT;
  v_team_onyx INT;
BEGIN
  SELECT id INTO v_raka_id FROM users WHERE username = 'RakaXtreme';
  SELECT id INTO v_ares_id FROM users WHERE username = 'AresNova';
  SELECT id INTO v_noctis_id FROM users WHERE username = 'Noctis';
  SELECT id INTO v_tidal_id FROM users WHERE username = 'TidalWave';
  SELECT id INTO v_mikael_id FROM users WHERE username = 'Mikael';

  -- Buat Tim PHOENIX FIVE jika belum ada
  IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'PHOENIX FIVE') THEN
    INSERT INTO teams (name, captain_id) VALUES ('PHOENIX FIVE', v_ares_id) RETURNING id INTO v_team_phoenix;
    INSERT INTO team_members (team_id, user_id, status) VALUES (v_team_phoenix, v_ares_id, 'active');
  END IF;

  -- Buat Tim VOID REAPERS
  IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'VOID REAPERS') THEN
    INSERT INTO teams (name, captain_id) VALUES ('VOID REAPERS', v_noctis_id) RETURNING id INTO v_team_void;
    INSERT INTO team_members (team_id, user_id, status) VALUES (v_team_void, v_noctis_id, 'active');
  END IF;

  -- Buat Tim KRAKEN ID
  IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'KRAKEN ID') THEN
    INSERT INTO teams (name, captain_id) VALUES ('KRAKEN ID', v_tidal_id) RETURNING id INTO v_team_kraken;
    INSERT INTO team_members (team_id, user_id, status) VALUES (v_team_kraken, v_tidal_id, 'active');
  END IF;

  -- Buat Tim ONYX SQUAD
  IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'ONYX SQUAD') THEN
    INSERT INTO teams (name, captain_id) VALUES ('ONYX SQUAD', v_mikael_id) RETURNING id INTO v_team_onyx;
    INSERT INTO team_members (team_id, user_id, status) VALUES (v_team_onyx, v_mikael_id, 'active');
  END IF;

  -- Update NOVA STRIKE agar kaptennya RakaXtreme
  IF v_raka_id IS NOT NULL THEN
    UPDATE teams SET captain_id = v_raka_id WHERE name = 'NOVA STRIKE';
    INSERT INTO team_members (team_id, user_id, status)
    SELECT 1, v_raka_id, 'active' WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE team_id = 1 AND user_id = v_raka_id);
  END IF;

  -- Tambahkan anggota tambahan ke NOVA STRIKE
  INSERT INTO team_members (team_id, user_id, status)
  SELECT 1, u.id, 'active' FROM users u 
  WHERE u.username IN ('SoraByte', 'Vexel', 'KiroZen', 'NamiExe')
  AND NOT EXISTS (SELECT 1 FROM team_members WHERE team_id = 1 AND user_id = u.id);
END $$;

-- 4. Pendaftaran Tim ke Turnamen
DO $$
DECLARE
  v_tourney_nexus INT;
  v_tourney_brawl INT;
  v_team_nova INT;
  v_team_garuda INT;
  v_team_phoenix INT;
  v_team_void INT;
  v_team_kraken INT;
  v_team_onyx INT;
BEGIN
  SELECT id INTO v_tourney_nexus FROM tournaments WHERE name = 'NEXUS CHAMPIONSHIP 2026';
  SELECT id INTO v_tourney_brawl FROM tournaments WHERE name = 'MIDNIGHT BRAWL SERIES';

  SELECT id INTO v_team_nova FROM teams WHERE name = 'NOVA STRIKE';
  SELECT id INTO v_team_garuda FROM teams WHERE name = 'GARUDA PRIME';
  SELECT id INTO v_team_phoenix FROM teams WHERE name = 'PHOENIX FIVE';
  SELECT id INTO v_team_void FROM teams WHERE name = 'VOID REAPERS';
  SELECT id INTO v_team_kraken FROM teams WHERE name = 'KRAKEN ID';
  SELECT id INTO v_team_onyx FROM teams WHERE name = 'ONYX SQUAD';

  IF v_tourney_nexus IS NOT NULL THEN
    IF v_team_nova IS NOT NULL THEN
      INSERT INTO tournament_registrations (tournament_id, team_id) VALUES (v_tourney_nexus, v_team_nova) ON CONFLICT DO NOTHING;
    END IF;
    IF v_team_phoenix IS NOT NULL THEN
      INSERT INTO tournament_registrations (tournament_id, team_id) VALUES (v_tourney_nexus, v_team_phoenix) ON CONFLICT DO NOTHING;
    END IF;
    IF v_team_void IS NOT NULL THEN
      INSERT INTO tournament_registrations (tournament_id, team_id) VALUES (v_tourney_nexus, v_team_void) ON CONFLICT DO NOTHING;
    END IF;
    IF v_team_kraken IS NOT NULL THEN
      INSERT INTO tournament_registrations (tournament_id, team_id) VALUES (v_tourney_nexus, v_team_kraken) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  IF v_tourney_brawl IS NOT NULL THEN
    IF v_team_garuda IS NOT NULL THEN
      INSERT INTO tournament_registrations (tournament_id, team_id) VALUES (v_tourney_brawl, v_team_garuda) ON CONFLICT DO NOTHING;
    END IF;
    IF v_team_onyx IS NOT NULL THEN
      INSERT INTO tournament_registrations (tournament_id, team_id) VALUES (v_tourney_brawl, v_team_onyx) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- 5. Jadwal Pertandingan Resmi
DO $$
DECLARE
  v_tourney_nexus INT;
  v_team_nova INT;
  v_team_phoenix INT;
  v_team_void INT;
  v_team_kraken INT;
BEGIN
  SELECT id INTO v_tourney_nexus FROM tournaments WHERE name = 'NEXUS CHAMPIONSHIP 2026';
  SELECT id INTO v_team_nova FROM teams WHERE name = 'NOVA STRIKE';
  SELECT id INTO v_team_phoenix FROM teams WHERE name = 'PHOENIX FIVE';
  SELECT id INTO v_team_void FROM teams WHERE name = 'VOID REAPERS';
  SELECT id INTO v_team_kraken FROM teams WHERE name = 'KRAKEN ID';

  IF v_tourney_nexus IS NOT NULL AND v_team_nova IS NOT NULL AND v_team_phoenix IS NOT NULL THEN
    INSERT INTO matches (tournament_id, team_a_id, team_b_id, round_number, schedule_time, status)
    VALUES (v_tourney_nexus, v_team_nova, v_team_phoenix, 1, '2026-11-01 15:00:00', 'scheduled')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_tourney_nexus IS NOT NULL AND v_team_void IS NOT NULL AND v_team_kraken IS NOT NULL THEN
    INSERT INTO matches (tournament_id, team_a_id, team_b_id, round_number, schedule_time, status)
    VALUES (v_tourney_nexus, v_team_void, v_team_kraken, 1, '2026-11-01 19:30:00', 'scheduled')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
