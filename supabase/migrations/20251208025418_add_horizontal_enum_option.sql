alter type "public"."material_cut_direction" rename to "material_cut_direction__old_version_to_be_dropped";

create type "public"."material_cut_direction" as enum ('V', 'VH', 'H');

alter table "public"."materials" alter column cut_direction type "public"."material_cut_direction" using cut_direction::text::"public"."material_cut_direction";

alter table "public"."orders_pieces_materials_snapshot" alter column cut_direction type "public"."material_cut_direction" using cut_direction::text::"public"."material_cut_direction";

drop type "public"."material_cut_direction__old_version_to_be_dropped";


