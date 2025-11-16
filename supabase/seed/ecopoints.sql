-- Seed de ecopontos iniciais
-- Centro: -23.21412666073546, -45.851297670739164 (São José dos Campos area)
-- Raio: 200km

INSERT INTO ecopoints (name, email, description, location, category, address, contact, status) VALUES
(
  'Feira Orgânica Central',
  'feira@sjc.org',
  'Feira semanal de produtos orgânicos e agroecológicos. Acontece todos os sábados das 7h às 13h.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.8513, -23.2141), 4326),
  ARRAY['alimentacao-regenerativa', 'agroecologia-urbana'],
  '{"street": "Praça Central", "city": "São José dos Campos", "state": "SP"}',
  '{"phone": "(12) 3629-1075", "instagram": "@feiraorganicasjc"}',
  'validated'
),
(
  'Horta Comunitária Urbanova',
  'horta@urbanova.com',
  'Espaço de cultivo coletivo aberto à comunidade. Oficinas de compostagem e permacultura mensais.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.9234, -23.1856), 4326),
  ARRAY['agroecologia-urbana', 'comunidades-coletivos'],
  '{"street": "Rua das Flores, 123", "city": "São José dos Campos", "state": "SP"}',
  '{"email": "horta@urbanova.com", "website": "https://hortaurbanova.org"}',
  'validated'
),
(
  'Instituto Verde Vale',
  'contato@verdevale.org.br',
  'ONG dedicada à educação ambiental e agricultura urbana. Programas para escolas e empresas.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.7823, -23.3012), 4326),
  ARRAY['ongs-organizacoes', 'oficinas-aprendizado'],
  '{"street": "Av. Principal, 2690", "city": "Jacareí", "state": "SP"}',
  '{"phone": "(12) 3081-5432", "website": "https://verdevale.org.br"}',
  'validated'
),
(
  'Brechó Consciente',
  'contato@brechoconsci.com.br',
  'Loja colaborativa de roupas de segunda mão. Aceitamos doações e oferecemos oficinas de customização.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.6912, -23.4234), 4326),
  ARRAY['consumo-consciente', 'economia-circular'],
  '{"street": "Rua do Comércio, 725", "city": "Caçapava", "state": "SP"}',
  '{"instagram": "@brechoconsci", "whatsapp": "(12) 99876-5432"}',
  'validated'
),
(
  'Coletivo Agroecológico Serra',
  'coletivo@agroserra.org',
  'Grupo de agricultores urbanos da região serrana. Venda direta de cestas orgânicas.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.4567, -22.9123), 4326),
  ARRAY['agroecologia-urbana', 'comunidades-coletivos', 'alimentacao-regenerativa'],
  '{"street": "Estrada da Serra, 100", "city": "Campos do Jordão", "state": "SP"}',
  '{"whatsapp": "(12) 98765-4321"}',
  'pending'
),
(
  'Repair Café Taubaté',
  'repaircafe@taubate.cc',
  'Encontros mensais para conserto de eletrônicos, roupas e móveis. Traga seus objetos quebrados!',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.5556, -23.0234), 4326),
  ARRAY['economia-circular', 'oficinas-aprendizado'],
  '{"street": "Rua Central, 1000", "city": "Taubaté", "state": "SP"}',
  '{"instagram": "@repaircafetaubate", "website": "https://repaircafe.taubate.cc"}',
  'validated'
),
(
  'Mercado de Trocas Regional',
  'trocas@regional.com',
  'Feira mensal de trocas de objetos, livros e roupas. Economia solidária em ação.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-46.0123, -23.0987), 4326),
  ARRAY['economia-circular', 'consumo-consciente'],
  '{"street": "Praça da Matriz", "city": "Pindamonhangaba", "state": "SP"}',
  '{"instagram": "@mercadotrocasreg"}',
  'pending'
),
(
  'Viveiro Mata Atlântica',
  'viveiro@mataatlantica.com.br',
  'Produção de mudas nativas e PANCs. Cursos de identificação de plantas alimentícias.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.3234, -23.1567), 4326),
  ARRAY['natureza-biodiversidade', 'alimentacao-regenerativa', 'oficinas-aprendizado'],
  '{"street": "Estrada Rural, 515", "city": "Tremembé", "state": "SP"}',
  '{"phone": "(12) 2618-8535", "website": "https://mataatlantica.com.br"}',
  'validated'
),
(
  'Casa de Cultura Vale',
  'cultura@valepb.org',
  'Centro cultural com foco em sustentabilidade. Cinema, teatro e biblioteca comunitária.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.9876, -23.4123), 4326),
  ARRAY['comunidades-coletivos', 'oficinas-aprendizado'],
  '{"street": "Av. das Artes, 1234", "city": "Lorena", "state": "SP"}',
  '{"phone": "(12) 3091-0001", "instagram": "@casaculturavale"}',
  'validated'
),
(
  'Loja Zero Desperdício',
  'contato@zerodesperdicio.sp',
  'Produtos a granel sem embalagem. Traz seu pote e leva o necessário. Higiene, limpeza e alimentos.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.7234, -23.0456), 4326),
  ARRAY['consumo-consciente', 'economia-circular'],
  '{"street": "Rua Sustentável, 1749", "city": "Guaratinguetá", "state": "SP"}',
  '{"instagram": "@zerodesperdicio_sp", "whatsapp": "(12) 97654-3210"}',
  'pending'
),
(
  'Feira Agroecológica Litoral',
  'feira@litoralnorte.rj',
  'Produtos orgânicos direto do produtor. Sábados de manhã na praça central.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-44.8923, -23.2234), 4326),
  ARRAY['alimentacao-regenerativa', 'agroecologia-urbana'],
  '{"street": "Praça do Mar", "city": "Ubatuba", "state": "SP"}',
  '{"phone": "(12) 2220-1234", "instagram": "@feiraagroubatuba"}',
  'validated'
),
(
  'Parque Ecológico - Educação Ambiental',
  'educacao@parqueeco.gov.br',
  'Programa educacional do Parque. Visitas guiadas e oficinas para escolas.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.2345, -22.8567), 4326),
  ARRAY['natureza-biodiversidade', 'oficinas-aprendizado', 'ongs-organizacoes'],
  '{"street": "Estrada do Parque, 1008", "city": "São Bento do Sapucaí", "state": "SP"}',
  '{"phone": "(12) 3874-1808", "website": "https://parqueeco.gov.br"}',
  'validated'
),
(
  'Coletivo Muda Caraguá',
  'muda@caraguatatuba.eco',
  'Grupo de moradores que transformou terreno baldio em horta comunitária. Doação de mudas.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.4123, -23.6234), 4326),
  ARRAY['agroecologia-urbana', 'comunidades-coletivos'],
  '{"street": "Rua da Praia, 501", "city": "Caraguatatuba", "state": "SP"}',
  '{"instagram": "@mudacaraga", "whatsapp": "(12) 98765-1234"}',
  'pending'
),
(
  'Bioconstrução Serra da Mantiqueira',
  'bioconstrucao@mantiqueira.arq',
  'Escritório de arquitetura sustentável. Cursos de bioconstrução e materiais naturais.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.1234, -22.7345), 4326),
  ARRAY['oficinas-aprendizado', 'economia-circular'],
  '{"street": "Rua da Serra, 229", "city": "Santo Antônio do Pinhal", "state": "SP"}',
  '{"phone": "(12) 3602-5678", "website": "https://bioconstrucao.mantiqueira.arq"}',
  'validated'
),
(
  'Banco de Sementes Crioulas Vale',
  'sementes@crioulas.vale',
  'Preservação de variedades tradicionais. Troca de sementes e capacitação.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-46.2345, -23.3456), 4326),
  ARRAY['natureza-biodiversidade', 'agroecologia-urbana'],
  '{"street": "Rua Rural, 347", "city": "Paraibuna", "state": "SP"}',
  '{"email": "sementes@crioulas.vale", "instagram": "@sementescrioulasvale"}',
  'validated'
),
(
  'ONG Guardiões da Serra',
  'contato@guardioesdaserra.org',
  'Proteção ambiental e conscientização. Mutirões mensais de reflorestamento.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.0567, -23.0123), 4326),
  ARRAY['ongs-organizacoes', 'natureza-biodiversidade', 'comunidades-coletivos'],
  '{"street": "Trilha da Serra, 400", "city": "Monteiro Lobato", "state": "SP"}',
  '{"phone": "(12) 2286-4567", "website": "https://guardioesdaserra.org", "instagram": "@guardioesdaserra"}',
  'pending'
),
(
  'Feira Ecológica Regional',
  'feira@ecologicaregional.mg',
  'Feira de produtos orgânicos certificados. Quartas e sábados pela manhã.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-46.5234, -22.8234), 4326),
  ARRAY['alimentacao-regenerativa', 'agroecologia-urbana'],
  '{"street": "Av. Principal, 1492", "city": "Cruzeiro", "state": "SP"}',
  '{"phone": "(12) 3223-4567", "instagram": "@feiraecologicareg"}',
  'validated'
),
(
  'Instituto Natureza Viva',
  'natureza@viva.org.br',
  'Programa de educação ambiental e ecoturismo. Trilhas e residências ecológicas.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-44.6789, -23.4567), 4326),
  ARRAY['natureza-biodiversidade', 'oficinas-aprendizado', 'ongs-organizacoes'],
  '{"street": "Estrada da Mata, 20", "city": "Ilhabela", "state": "SP"}',
  '{"phone": "(12) 3571-9700", "website": "https://naturezaviva.org.br"}',
  'validated'
),
(
  'Coletivo Lixo Zero Vale',
  'contato@lixozerovale.org',
  'Movimento por redução de resíduos. Oficinas de compostagem e consumo consciente.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.6123, -23.2789), 4326),
  ARRAY['economia-circular', 'comunidades-coletivos', 'oficinas-aprendizado'],
  '{"street": "Rua Verde, 1148", "city": "São José dos Campos", "state": "SP"}',
  '{"instagram": "@lixozerovale", "website": "https://lixozerovale.org"}',
  'validated'
),
(
  'Horta do Parque Municipal',
  'hortaparque@sjc.gov.br',
  'Horta educativa no Parque Municipal. Visitas agendadas para grupos.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.8901, -23.1789), 4326),
  ARRAY['agroecologia-urbana', 'oficinas-aprendizado'],
  '{"street": "Parque Santos Dumont", "city": "São José dos Campos", "state": "SP"}',
  '{"phone": "(12) 3277-4565"}',
  'pending'
),
(
  'Espaço Comum Sustentável',
  'espacocomum@sustentavel.org',
  'Centro cultural autogerido. Eventos culturais, horta comunitária e biblioteca popular.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.7567, -23.3234), 4326),
  ARRAY['comunidades-coletivos', 'agroecologia-urbana'],
  '{"street": "Rua Comunitária, 348", "city": "Jacareí", "state": "SP"}',
  '{"instagram": "@espacocomumsust", "website": "https://espacocomumsust.org"}',
  'validated'
),
(
  'Armazém Natural',
  'armazem@natural.sp',
  'Mercado de produtos locais e orgânicos. Apoio a pequenos produtores da região.',
  extensions.ST_SetSRID(extensions.ST_MakePoint(-45.9345, -23.0678), 4326),
  ARRAY['alimentacao-regenerativa', 'consumo-consciente'],
  '{"street": "Rua do Mercado, 1234", "city": "Taubaté", "state": "SP"}',
  '{"phone": "(12) 3261-7890", "instagram": "@armazemnaturalsp"}',
  'pending'
);
