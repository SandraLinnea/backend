--Insert data users
INSERT into users (name, email, password_hash, is_admin)
values
  ('Alice Andersson', 'alice@example.com', '$2a$10$WQ2kR8OeHgM4fX8I8b4cmeKe7Eef0/9ZrTzMZCwRDP3l4E6KPg.E2', false),
  ('Bob Bergström', 'bob@example.com', '$2a$10$Z6yJt8QpdWc4iUQqMRmTLeP1IElRQ1Z.kts1OYJpvCkPiP8nBkZb2', false),
  ('Clara Claesson', 'clara@example.com', '$2a$10$F8xYJbKzNxl97Z0A1b8hjOiM4rFqD4nCzR/NzN9wNn7sZEVH1GVCW', false),
  ('David Dahl', 'david@example.com', '$2a$10$3lQ.qf82hxiT9J7E69KuLe1RS40RkEiFQlKdyIo6OPsWv8BW6vDmO', true),
  ('Ella Engström', 'ella@example.com', '$2a$10$yzqz7f9YxWz.TnD/MjUyYeVDdS6zOK3PXz8vBf0aPiWykvK7NlkPy', false),
  ('Filip Forsberg', 'filip@example.com', '$2a$10$7iMJhLJgHke0V6ku6rH7yOZJ0x9h3DT9e1M6qD5phdRR9LRZzI2qO', false),
  ('Greta Gustafsson', 'greta@example.com', '$2a$10$h62z5ZC6zuepWqvPBbQKgeuOEWfX26MR3vDjngE9xOoxAmc3J0l2G', true),
  ('Hugo Holm', 'hugo@example.com', '$2a$10$QbH6klyf4U1aIcbX5hhiBeWg4ak6Dvu4vQe5KTqZ/oZpP4s6xpmue', false),
  ('Ida Isaksson', 'ida@example.com', '$2a$10$EoKkkShxvZMb1aK/tIzGEu9ef4PfnRpejIYpDp5HqJfKht2cLf2nW', false),
  ('Jonas Johansson', 'jonas@example.com', '$2a$10$Jr7cCrX8NuwB/hbMR5nlLeY7E4mSYX5YpYuhqMceJDCivupfCKEWe', true);

-- Table property
  property:
create table if not exists public.properties (
  property_id        uuid primary key default gen_random_uuid(),
  owner_id           uuid not null,
  title              text not null,
  price_per_night    numeric(10,2) not null check (price_per_night > 0),

  description        text,
  city               text,
  country            text,
  guests             int,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- insert data properties
insert into public.properties
(property_id, owner_id, title, price_per_night, description, city, country, guests)
values
('7c6f2a90-2c2c-4c8e-9df5-8a0f0c6c1a01','a1f8c5b2-5c9a-4b1f-9f6e-2d3a1e8b7c01','Ljus etta nära Odenplan',950,'Mysig studio med fransk balkong.','Stockholm','Sweden',2),
('8d7e3b91-3d3d-4d9f-a1e6-9b1f1d7d2b02','b2e9d6c3-7a1b-4d2c-8a7f-4e5b2f9c8d02','Modern tvåa vid Linné',1200,'Nära Slottsskogen och caféer.','Gothenburg','Sweden',3),
('9e8f4c92-4e4e-4ea0-b2f7-ac2f2e8e3c03','c3fad7e4-8b2c-4e3d-9b8a-5f6c3a0b9e03','Nyrenoverad lägenhet vid Möllevången',1100,'Tyst innergård, nära restauranger.','Malmö','Sweden',4),
('af905d93-5f5f-4fb1-c308-bd3f3f9f4d04','d4abe8f5-9c3d-4f4e-ac9b-6a7d4b1c0f04','Studentnära tvåa i Flogsta',890,'Perfekt bas för Uppsala-besök.','Uppsala','Sweden',2),
('b0a16ea4-6060-4102-d419-ce4010a00505','e5bcf906-ad4e-504f-bd0c-7b8e5c2d1a05','Trähus med bastu nära älven',1500,'Bastu och utsikt över Umeälven.','Umeå','Sweden',5),
('c1b27fb5-7171-4213-e52a-df5121b11606','a1f8c5b2-5c9a-4b1f-9f6e-2d3a1e8b7c01','Kalkstenshus innanför ringmuren',1800,'Charmigt boende nära Almedalen.','Visby','Sweden',4),
('d2c390c6-8282-4324-f63b-e06232c22707','b2e9d6c3-7a1b-4d2c-8a7f-4e5b2f9c8d02','Fjällstuga med norrsken',2200,'Utsikt mot Kebnekaise, öppen spis.','Kiruna','Sweden',6),
('e3d4a1d7-9393-4435-074c-f17343d33808','c3fad7e4-8b2c-4e3d-9b8a-5f6c3a0b9e03','Central trea vid Svampen',1150,'Gångavstånd till Conventum.','Örebro','Sweden',4),
('f4e5b2e8-a4a4-4546-185d-028454e44909','d4abe8f5-9c3d-4f4e-ac9b-6a7d4b1c0f04','Havsutsikt nära Norra Hamnen',1400,'Balkong med havsbris.','Helsingborg','Sweden',3),
('05f6c3f9-b5b5-4657-296e-139565f55a0a','e5bcf906-ad4e-504f-bd0c-7b8e5c2d1a05','Tegelvilla nära universitetet',1300,'Stor tomt och grillplats.','Lund','Sweden',5),
('1607d40a-c6c6-4768-3aaf-24a676066b0b','a1f8c5b2-5c9a-4b1f-9f6e-2d3a1e8b7c01','Rymlig trea vid Stora Torget',1050,'Ljus hörnlägenhet.','Linköping','Sweden',4),
('2718e51b-d7d7-4879-4bb0-35b787177c0c','b2e9d6c3-7a1b-4d2c-8a7f-4e5b2f9c8d02','Vindslägenhet i Vasastan',1600,'Exponerade bjälkar, mysigt loft.','Stockholm','Sweden',2),
('3829f62c-e8e8-498a-5cc1-46c898288d0d','c3fad7e4-8b2c-4e3d-9b8a-5f6c3a0b9e03','Lägenhet med kanalutsikt',1350,'Nära Turning Torso.','Malmö','Sweden',3),
('493a073d-f9f9-4a9b-6dd2-57d9a9399e0e','d4abe8f5-9c3d-4f4e-ac9b-6a7d4b1c0f04','Familjevänligt radhus i Eriksberg',1450,'Lekplats utanför dörren.','Uppsala','Sweden',5),
('5a4b184e-0a0a-4bab-7ee3-68eaba4aae0f','e5bcf906-ad4e-504f-bd0c-7b8e5c2d1a05','Designlägenhet i City',1900,'Nära NK och teatrar.','Stockholm','Sweden',2),
('6b5c295f-1b1b-4cbc-8ff4-79fbbb5bbf10','a1f8c5b2-5c9a-4b1f-9f6e-2d3a1e8b7c01','Hamnläge vid Eriksbergskranen',1550,'Båtpendel runt hörnet.','Gothenburg','Sweden',3),
('7c6d3a70-2c2c-4c8e-9001-8a0f0c6c1a11','b2e9d6c3-7a1b-4d2c-8a7f-4e5b2f9c8d02','Skärgårdsstuga på Värmdö',2100,'Egen brygga och roddbåt.','Stockholm','Sweden',6),
('8d7e4b81-3d3d-4d9f-a1e6-9b1f1d7d2b12','c3fad7e4-8b2c-4e3d-9b8a-5f6c3a0b9e03','Lantlig stuga nära Höga Kusten',1250,'Vandringsleder utanför knuten.','Härnösand','Sweden',4),
('9e8f5c72-4e4e-4ea0-b2f7-ac2f2e8e3c13','d4abe8f5-9c3d-4f4e-ac9b-6a7d4b1c0f04','Penthouse med takterrass',2400,'Utsikt över staden.','Stockholm','Sweden',2),
('af906d62-5f5f-4fb1-c308-bd3f3f9f4d14','e5bcf906-ad4e-504f-bd0c-7b8e5c2d1a05','Sekelskifte nära Haga',1700,'Högt i tak och kakelugn.','Gothenburg','Sweden',4),
('b0a17e54-6060-4102-d419-ce4010a00515','a1f8c5b2-5c9a-4b1f-9f6e-2d3a1e8b7c01','Hus vid stranden i Ystad',2000,'Promenadavstånd till havet.','Ystad','Sweden',6),
('c1b28f45-7171-4213-e52a-df5121b11616','b2e9d6c3-7a1b-4d2c-8a7f-4e5b2f9c8d02','Parhus i Väster',1150,'Lugnt område nära centrum.','Örebro','Sweden',5),
('d2c3a055-8282-4324-f63b-e06232c22717','c3fad7e4-8b2c-4e3d-9b8a-5f6c3a0b9e03','Falurött torp med vedeldad bastu',1300,'Skogsglänta och badsjö i närheten.','Falun','Sweden',4),
('e3d4b065-9393-4435-074c-f17343d33818','d4abe8f5-9c3d-4f4e-ac9b-6a7d4b1c0f04','Citynära studio vid Avenyn',980,'Perfekt för weekend.','Gothenburg','Sweden',2),
('f4e5c075-a4a4-4546-185d-028454e44919','e5bcf906-ad4e-504f-bd0c-7b8e5c2d1a05','Ljus lägenhet vid Triangeln',1120,'Nära tåg och shopping.','Malmö','Sweden',3),
('05f6d185-b5b5-4657-296e-139565f55a1a','a1f8c5b2-5c9a-4b1f-9f6e-2d3a1e8b7c01','Husbåt på Söder Mälarstrand',2300,'Unik upplevelse på vattnet.','Stockholm','Sweden',4),
('1607e295-c6c6-4768-3aaf-24a676066b1b','b2e9d6c3-7a1b-4d2c-8a7f-4e5b2f9c8d02','Stuga i Sälen med skid-in/out',2600,'Perfekt för vinterresor.','Sälen','Sweden',7),
('2718f2a5-d7d7-4879-4bb0-35b787177c1c','c3fad7e4-8b2c-4e3d-9b8a-5f6c3a0b9e03','Fiskestuga vid Vättern',1250,'Egen brygga och roddbåt.','Motala','Sweden',4),
('382a03b6-e8e8-498a-5cc1-46c898288d1d','d4abe8f5-9c3d-4f4e-ac9b-6a7d4b1c0f04','Loft med industrikänsla',1750,'Gamla fabriken, ny interiör.','Norrköping','Sweden',3),
('493a14c7-f9f9-4a9b-6dd2-57d9a9399e1e','e5bcf906-ad4e-504f-bd0c-7b8e5c2d1a05','Stadsvy från 17:e våningen',1950,'Hiss och balkong.','Umeå','Sweden',4),
('5a4b25d8-0a0a-4bab-7ee3-68eaba4aae1f','a1f8c5b2-5c9a-4b1f-9f6e-2d3a1e8b7c01','Villa med pool i Täby',2800,'Familjevänligt boende.','Täby','Sweden',8),
('6b5c36ea-1b1b-4cbc-8ff4-79fbbb5bbf20','b2e9d6c3-7a1b-4d2c-8a7f-4e5b2f9c8d02','Centralt boende nära Centralen',1500,'Perfekt pendlarläge.','Stockholm','Sweden',2),
('7c6d4b82-2c2c-4c8e-9001-8a0f0c6c1a21','c3fad7e4-8b2c-4e3d-9b8a-5f6c3a0b9e03','Lägenhet vid Domkyrkan',1180,'Historisk miljö.','Lund','Sweden',3),
('8d7e5c93-3d3d-4d9f-a1e6-9b1f1d7d2b22','d4abe8f5-9c3d-4f4e-ac9b-6a7d4b1c0f04','Lägenhet vid A6-området',1080,'Shopping och natur nära.','Jönköping','Sweden',4),
('9e8f6da4-4e4e-4ea0-b2f7-ac2f2e8e3c23','e5bcf906-ad4e-504f-bd0c-7b8e5c2d1a05','Stuga vid havet med bastu',2050,'Kvällsdopp och bastubad.','Varberg','Sweden',5),
('af907eb5-5f5f-4fb1-c308-bd3f3f9f4d24','a1f8c5b2-5c9a-4b1f-9f6e-2d3a1e8b7c01','Townhouse vid Munksjön',1650,'Utsikt över sjön.','Jönköping','Sweden',6),
('b0a18fc6-6060-4102-d419-ce4010a00525','b2e9d6c3-7a1b-4d2c-8a7f-4e5b2f9c8d02','Lägenhet nära Campus Valla',980,'Studentnära och lugnt.','Linköping','Sweden',2);
