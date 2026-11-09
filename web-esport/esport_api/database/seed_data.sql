INSERT INTO users (id, username, mmr_point, password, role, created_at) VALUES
  (1, 'admin_esport', 5000, '$argon2id$v=19$m=19456,t=2,p=1$nhl719bgRvlpzhCcPRHo9A$nfdjTtnjWCbQazaOf1OgzlsEe0PPYtg+DHn61zEAvo4', 'admin', '2026-10-27 20:27:38.54758'),
  (2, 'RakaXtreme', 2150, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (3, 'SoraByte', 1820, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (4, 'Vexel', 1740, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (5, 'KiroZen', 1900, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (6, 'NamiExe', 1650, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (7, 'AresNova', 2300, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (8, 'Noctis', 1980, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (9, 'TidalWave', 1890, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (10, 'Reverb', 1780, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (11, 'Mikael', 2050, '$argon2id$v=19$m=19456,t=2,p=1$4NlqDbg9WJb6i/E6d/7rPQ$vj0oO44eP3Nffj9V/3g/8A67t0Iff+Z5gD+bC+qFz80', 'user', '2026-10-27 20:47:13.881294'),
  (22, 'pemain_baru', 0, '$argon2id$v=19$m=19456,t=2,p=1$ne+CNdFijBBncMar8DDqFA$4j2SCqnreVrq/8Nw1sQErts421kELws7YrLsdLcwB6U', 'user', '2026-10-27 21:21:41.856542'),
  (23, 'me_ftr', 1000, '$argon2id$v=19$m=19456,t=2,p=1$AI+Ykj3/56ITekTBgk+Fhg$GctPDJWznI57PxVGey8+IMiVArLd9a9NWwG8k0Qh5vA', 'user', '2026-10-27 21:26:16.015197')
ON CONFLICT (username) DO NOTHING;

INSERT INTO tournaments (id, name, total_slots, available_slots, status, created_at) VALUES
  (1, 'VALORANT CHAMPIONS TOUR 2026', 16, 16, 'open', '2026-11-09 18:41:30.308846'),
  (2, 'MLBB PRO LEAGUE INDONESIA', 8, 8, 'open', '2026-11-09 18:41:30.323566'),
  (3, 'PUBG MOBILE NATIONAL SERIES', 16, 16, 'open', '2026-11-09 18:41:30.334937'),
  (4, 'DOTA 2 COMMUNITY CUP', 8, 8, 'open', '2026-11-09 18:41:30.345588')
ON CONFLICT (lower(btrim(name))) DO NOTHING;

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true);
SELECT setval('tournaments_id_seq', COALESCE((SELECT MAX(id) FROM tournaments), 1), true);
