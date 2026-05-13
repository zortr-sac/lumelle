-- 0014_seed_demo.sql
-- Common service categories and a couple of seed examples for new businesses
-- These are NOT inserted automatically; they are reference seeds for the UI to suggest

create table public.service_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  default_price_cents bigint not null,
  default_duration_minutes smallint not null,
  description text
);

insert into public.service_templates(name, category, default_price_cents, default_duration_minutes, description) values
  ('Manicure clásica', 'Manicure', 2500, 45, 'Limado, cutícula y esmaltado tradicional'),
  ('Manicure gel', 'Manicure', 4500, 60, 'Esmaltado en gel con curado UV'),
  ('Rubber gel', 'Manicure', 6000, 75, 'Base rubber para mayor resistencia'),
  ('Soft gel', 'Manicure', 8000, 90, 'Extensión con tips de gel suave'),
  ('Acrílicas', 'Manicure', 12000, 120, 'Extensión acrílica esculpida'),
  ('Esculpidas', 'Manicure', 15000, 150, 'Esculpidas con molde, diseño libre'),
  ('Pedicure spa', 'Pedicure', 5000, 60, 'Tratamiento completo de pedicure'),
  ('Retiro de gel', 'Manicure', 1500, 20, 'Limpieza y retiro de esmalte gel'),
  ('Diseño adicional', 'Diseños', 1000, 15, 'Por uña, en gel o acrílico'),
  ('Reparación de uña', 'Manicure', 1500, 20, 'Reparación puntual'),
  ('Cejas - perfilado', 'Cejas', 2000, 30, 'Diseño y perfilado'),
  ('Pestañas - lifting', 'Pestañas', 8000, 60, 'Lifting con queratina'),
  ('Maquillaje social', 'Maquillaje', 8000, 60, 'Maquillaje completo para evento');

alter table public.service_templates enable row level security;

create policy "Anyone can read service templates"
  on public.service_templates for select
  to authenticated, anon
  using (true);
