-- Complementary manufacturer ranges. Not part of the priced catalogue.
-- Specifications, prices, stock and photographs stay empty until the manufacturer confirms them.

create table if not exists brand_skus (
  sku text primary key,
  brand text not null,
  brand_slug text not null,
  family text not null,
  name text not null,
  official_url text not null,
  dimensions text,
  colour_finish text,
  standard_ref text,
  brochure_ref text,
  availability_status text not null,
  delivery_class text not null,
  image_rights_status text not null,
  publication_status text not null,
  source_status text not null,
  notes text not null
);
create index if not exists brand_skus_slug_idx on brand_skus (brand_slug);

insert into brand_skus (
  sku, brand, brand_slug, family, name, official_url, dimensions, colour_finish, standard_ref, brochure_ref,
  availability_status, delivery_class, image_rights_status, publication_status, source_status, notes
) values
('BP-CB-0001', 'Corobrik', 'corobrik', 'Clay face bricks', 'Clay Face Brick Range', 'https://www.corobrik.co.za/clay-face-brick-range', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_navigation', 'Exact SKU/variant fields to be extracted from individual range pages and brochure PDFs.'),
('BP-CB-0002', 'Corobrik', 'corobrik', 'Clay face bricks', 'Slimline Face Brick Range', 'https://www.corobrik.co.za/slimline-face-bricks', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_navigation', 'Exact SKU/variant fields to be extracted from individual range pages and brochure PDFs.'),
('BP-CB-0003', 'Corobrik', 'corobrik', 'Clay face bricks', 'Breezeblock Face Bricks', 'https://www.corobrik.co.za/breezeblock-face-brick', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_navigation', 'Exact SKU/variant fields to be extracted from individual range pages and brochure PDFs.'),
('BP-CB-0004', 'Corobrik', 'corobrik', 'Clay paving', 'Clay Paving Range', 'https://www.corobrik.co.za/clay-brick-pavers', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_navigation', 'Exact SKU/variant fields to be extracted from individual range pages and brochure PDFs.'),
('BP-CB-0005', 'Corobrik', 'corobrik', 'Concrete paving', 'Concrete Paving Range', 'https://www.corobrik.co.za/concrete-paving-range', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_navigation', 'Exact SKU/variant fields to be extracted from individual range pages and brochure PDFs.'),
('BP-CB-0006', 'Corobrik', 'corobrik', 'Concrete masonry', 'Concrete Bricks & Blocks', 'https://www.corobrik.co.za/concrete-bricks-and-blocks', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_navigation', 'Exact SKU/variant fields to be extracted from individual range pages and brochure PDFs.'),
('BP-CB-0007', 'Corobrik', 'corobrik', 'Retaining systems', 'Geolock Earth Retaining System', 'https://www.corobrik.co.za/geolock-earth-retaining-system', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_navigation', 'Exact SKU/variant fields to be extracted from individual range pages and brochure PDFs.'),
('BP-CB-0008', 'Corobrik', 'corobrik', 'Retaining systems', 'Terraforce Retaining Blocks', 'https://www.corobrik.co.za/terraforce-retaining-blocks', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_navigation', 'Exact SKU/variant fields to be extracted from individual range pages and brochure PDFs.'),
('BP-BS-0001', 'Bosun', 'bosun', 'Paving', 'Paving Blocks', 'https://www.bosun.co.za/products/paving/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Extract individual Bosun product names, sizes, colours and finishes from category page or manufacturer brochure.'),
('BP-BS-0002', 'Bosun', 'bosun', 'Kerbs', 'Kerbs', 'https://www.bosun.co.za/products/kerbs/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Extract individual Bosun product names, sizes, colours and finishes from category page or manufacturer brochure.'),
('BP-BS-0003', 'Bosun', 'bosun', 'Retaining walls', 'Retaining Wall Blocks', 'https://www.bosun.co.za/products/retaining-wall-blocks/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Extract individual Bosun product names, sizes, colours and finishes from category page or manufacturer brochure.'),
('BP-BS-0004', 'Bosun', 'bosun', 'Paving finishes', 'Colourfast Finishes', 'https://www.bosun.co.za/products/paving/designer-paving/colourfast-finishes/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Extract individual Bosun product names, sizes, colours and finishes from category page or manufacturer brochure.'),
('BP-TC-0001', 'Technicrete', 'technicrete', 'Paving', 'Paving Range', 'https://www.technicrete.co.za/commercial/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Individual product brochures and current specifications required.'),
('BP-TC-0002', 'Technicrete', 'technicrete', 'Concrete masonry', 'Concrete Masonry', 'https://www.technicrete.co.za/residential/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Individual product brochures and current specifications required.'),
('BP-TC-0003', 'Technicrete', 'technicrete', 'Retaining walls', 'Retaining Wall Systems', 'https://www.technicrete.co.za/residential/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Individual product brochures and current specifications required.'),
('BP-TC-0004', 'Technicrete', 'technicrete', 'Erosion control', 'Armorflex / Erosion Protection', 'https://www.technicrete.co.za/commercial/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Individual product brochures and current specifications required.'),
('BP-TC-0005', 'Technicrete', 'technicrete', 'Drainage', 'Drainage Products', 'https://www.technicrete.co.za/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Individual product brochures and current specifications required.'),
('BP-TC-0006', 'Technicrete', 'technicrete', 'Kerbs', 'Kerbs', 'https://www.technicrete.co.za/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Individual product brochures and current specifications required.'),
('BP-TC-0007', 'Technicrete', 'technicrete', 'Mining', 'Mining Pre-bagged Products', 'https://www.technicrete.co.za/mining/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Individual product brochures and current specifications required.'),
('BP-TC-0008', 'Technicrete', 'technicrete', 'Mining', 'Mining Support Packs', 'https://www.technicrete.co.za/mining/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_page', 'Individual product brochures and current specifications required.'),
('BP-IF-0001', 'Infraset', 'infraset', 'Roof tiles', 'Roof Tile Range', 'https://infraset.co.za/roof-tiles/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0002', 'Infraset', 'infraset', 'Roof tiles', 'Horizon Concrete Shingle Tile', 'https://infraset.co.za/roof-tiles/horizon-concrete-shingle-tile/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0003', 'Infraset', 'infraset', 'Roof tiles', 'Sunset Double Roman Bold Roll Tile', 'https://infraset.co.za/roof-tiles/sunset-double-roman-concrete-bold-roll-tile/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0004', 'Infraset', 'infraset', 'Roof tiles', 'Vintage Multi Blend Roof Tiles', 'https://infraset.co.za/roof-tiles/vintage-multi-blend-roof-tiles/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0005', 'Infraset', 'infraset', 'Paving', 'Paving & Cobbles', 'https://infraset.co.za/paving/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0006', 'Infraset', 'infraset', 'Retaining walls', 'Retaining Wall Systems', 'https://infraset.co.za/retaining-walls/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0007', 'Infraset', 'infraset', 'Erosion control', 'Erosion Control', 'https://infraset.co.za/erosion-control/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0008', 'Infraset', 'infraset', 'Accessories', 'Roof Tile Fittings & Accessories', 'https://infraset.co.za/roof-tile-fittings-and-accessories/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0009', 'Infraset', 'infraset', 'Accessories', 'Eco Shield', 'https://infraset.co.za/eco-shield/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0010', 'Infraset', 'infraset', 'Accessories', 'Infra-Flash', 'https://infraset.co.za/infra-flash/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.'),
('BP-IF-0011', 'Infraset', 'infraset', 'Landscape', 'Embankment Seating and Steps', 'https://infraset.co.za/embankment-seating/', null, null, null, null, 'manufacturer_confirmation_required', 'heavy_or_quote_required', 'permission_required', 'candidate_for_import', 'official_public_category_or_product_page', 'Exact SKU, dimensions, colours, stock region and MOQ require manufacturer confirmation.')
on conflict (sku) do update set
  brand = excluded.brand,
  brand_slug = excluded.brand_slug,
  family = excluded.family,
  name = excluded.name,
  official_url = excluded.official_url,
  dimensions = excluded.dimensions,
  colour_finish = excluded.colour_finish,
  standard_ref = excluded.standard_ref,
  brochure_ref = excluded.brochure_ref,
  availability_status = excluded.availability_status,
  delivery_class = excluded.delivery_class,
  image_rights_status = excluded.image_rights_status,
  publication_status = excluded.publication_status,
  source_status = excluded.source_status,
  notes = excluded.notes;
