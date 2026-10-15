-- Official Bricksplaza price list, effective 1 November 2026.
-- ZAR, excluding VAT and delivery. Colour does not change a price.
-- Trade is the published 12% figure. Volume is the published 20% figure.
-- Made-to-order figures already include the 15% premium.
-- Precast lintels are not on the list, so they are not touched.
-- Mortar plasticiser is not on the list, so it is not touched.
-- Kerbs, airbricks and permeable pavers are not sold as priced SKUs here.

-- Clay face, semi-face, and clay maxi (facing maxi, not a plaster common).
update products
set retail_price = 4760.00, trade_price = 4188.80, volume_price = 3808.00
where category_slug in ('clay-face-bricks', 'semi-face-bricks', 'clay-maxi-bricks')
  and fulfilment_type = 'Stock Item';

update products
set retail_price = 5474.00, trade_price = 4817.12, volume_price = 4379.20
where category_slug in ('clay-face-bricks', 'semi-face-bricks', 'clay-maxi-bricks')
  and fulfilment_type = 'Made-to-Order';

-- Clay commons. The list has no made-to-order line.
update products
set retail_price = 2098.40, trade_price = 1846.59, volume_price = 1678.72
where category_slug = 'stock-bricks';

-- Engineering brick. The list has no made-to-order line.
update products
set retail_price = 5504.00, trade_price = 4843.52, volume_price = 4403.20
where category_slug = 'engineering-bricks';

-- Firebrick is each, every type and size. Not per thousand.
update products
set unit_of_sale = 'Each',
    retail_price = 26.10,
    trade_price = 22.97,
    volume_price = 20.88
where category_slug = 'fire-bricks';

-- Specials are each. Stock single cant and single bullnose are the stock line.
-- Every other shape, and any made-to-order special, is the made-to-order line.
update products
set unit_of_sale = 'Each',
    retail_price = case
      when fulfilment_type = 'Stock Item' and product_type in ('Single Cant', 'Bullnose') then 10.07
      else 11.59
    end,
    trade_price = case
      when fulfilment_type = 'Stock Item' and product_type in ('Single Cant', 'Bullnose') then 8.87
      else 10.20
    end,
    volume_price = case
      when fulfilment_type = 'Stock Item' and product_type in ('Single Cant', 'Bullnose') then 8.06
      else 9.27
    end
where category_slug = 'clay-specials';

-- Every concrete masonry block, every thickness. No made-to-order line.
update products
set retail_price = 15.00, trade_price = 13.20, volume_price = 12.00
where category_slug = 'concrete-blocks';

-- Cement maxi brick, per thousand. No made-to-order line.
update products
set retail_price = 2403.40, trade_price = 2114.99, volume_price = 1922.72
where category_slug = 'concrete-maxi';

update products
set retail_price = 41.60, trade_price = 36.61, volume_price = 33.28
where category_slug = 'aac-blocks';

-- CSEB is priced per thousand, and every official line is made to order.
update products
set unit_of_sale = 'Per 1,000 units',
    retail_price = 2084.38,
    trade_price = 1834.25,
    volume_price = 1667.50
where category_slug = 'cseb';

-- Class I / II mortar is the 40kg masonry-cement bag. Jointing sand is kiln-dried 40kg.
-- Sealers are the 20L wet-look drum, because that is the unit already on the SKU.
update products
set retail_price = 92.00, trade_price = 80.96, volume_price = 73.60
where category_slug = 'mortar-accessories'
  and product_type in ('Class I Masonry Mortar', 'Class II Masonry Mortar');

update products
set retail_price = 77.50, trade_price = 68.20, volume_price = 62.00
where category_slug = 'mortar-accessories'
  and product_type = 'Jointing Sand';

update products
set retail_price = 2370.00, trade_price = 2085.60, volume_price = 1896.00
where category_slug = 'mortar-accessories'
  and product_type in ('Paver Sealer', 'Face Brick Sealer');

-- Clay pavers by duty. There is no extra-heavy clay line, so that duty uses heavy-duty.
update products
set retail_price = 234.60, trade_price = 206.45, volume_price = 187.68
where category_slug = 'clay-pavers' and duty_load_class = 'Pedestrian' and fulfilment_type = 'Stock Item';

update products
set retail_price = 269.79, trade_price = 237.42, volume_price = 215.83
where category_slug = 'clay-pavers' and duty_load_class = 'Light Vehicular' and fulfilment_type = 'Stock Item';

update products
set retail_price = 340.17, trade_price = 299.35, volume_price = 272.14
where category_slug = 'clay-pavers' and duty_load_class in ('Heavy-Duty', 'Extra Heavy-Duty') and fulfilment_type = 'Stock Item';

update products
set retail_price = 269.79, trade_price = 237.42, volume_price = 215.83
where category_slug = 'clay-pavers' and duty_load_class = 'Pedestrian' and fulfilment_type = 'Made-to-Order';

update products
set retail_price = 310.26, trade_price = 273.03, volume_price = 248.21
where category_slug = 'clay-pavers' and duty_load_class = 'Light Vehicular' and fulfilment_type = 'Made-to-Order';

update products
set retail_price = 391.20, trade_price = 344.25, volume_price = 312.96
where category_slug = 'clay-pavers' and duty_load_class in ('Heavy-Duty', 'Extra Heavy-Duty') and fulfilment_type = 'Made-to-Order';

-- Concrete pavers. Extra heavy-duty is published only as made-to-order.
update products
set retail_price = 189.00, trade_price = 166.32, volume_price = 151.20
where category_slug = 'concrete-pavers' and duty_load_class = 'Pedestrian' and fulfilment_type = 'Stock Item';

update products
set retail_price = 217.35, trade_price = 191.27, volume_price = 173.88
where category_slug = 'concrete-pavers' and duty_load_class = 'Light Vehicular' and fulfilment_type = 'Stock Item';

update products
set retail_price = 274.05, trade_price = 241.16, volume_price = 219.24
where category_slug = 'concrete-pavers' and duty_load_class = 'Heavy-Duty' and fulfilment_type = 'Stock Item';

update products
set retail_price = 217.35, trade_price = 191.27, volume_price = 173.88
where category_slug = 'concrete-pavers' and duty_load_class = 'Pedestrian' and fulfilment_type = 'Made-to-Order';

update products
set retail_price = 249.95, trade_price = 219.96, volume_price = 199.96
where category_slug = 'concrete-pavers' and duty_load_class = 'Light Vehicular' and fulfilment_type = 'Made-to-Order';

update products
set retail_price = 315.16, trade_price = 277.34, volume_price = 252.13
where category_slug = 'concrete-pavers' and duty_load_class = 'Heavy-Duty' and fulfilment_type = 'Made-to-Order';

update products
set retail_price = 380.36, trade_price = 334.72, volume_price = 304.29
where category_slug = 'concrete-pavers' and duty_load_class = 'Extra Heavy-Duty';

-- Cobbles. Size does not change the price.
update products
set retail_price = 269.80, trade_price = 237.42, volume_price = 215.84
where category_slug = 'cobbles' and fulfilment_type = 'Stock Item';

update products
set retail_price = 310.27, trade_price = 273.04, volume_price = 248.22
where category_slug = 'cobbles' and fulfilment_type = 'Made-to-Order';

-- Slabs are each. Price follows plan area from the 400x400 rate, including sizes the list does not name.
-- Trade and volume are taken off the unrounded retail, which is how 450x450 lands on R52.93.
update products
set unit_of_sale = 'Each',
    retail_price = round((47.52::numeric * length_mm * width_mm / 160000) * case when fulfilment_type = 'Made-to-Order' then 1.15 else 1 end, 2),
    trade_price = round((47.52::numeric * length_mm * width_mm / 160000) * case when fulfilment_type = 'Made-to-Order' then 1.15 else 1 end * 0.88, 2),
    volume_price = round((47.52::numeric * length_mm * width_mm / 160000) * case when fulfilment_type = 'Made-to-Order' then 1.15 else 1 end * 0.80, 2)
where category_slug = 'slabs'
  and length_mm > 0
  and width_mm > 0;

-- Retaining blocks, and coping sold as a capping unit rather than a special brick.
update products
set retail_price = 37.80, trade_price = 33.26, volume_price = 30.24
where category_slug in ('retaining-blocks', 'coping') and fulfilment_type = 'Stock Item';

update products
set retail_price = 43.47, trade_price = 38.25, volume_price = 34.78
where category_slug in ('retaining-blocks', 'coping') and fulfilment_type = 'Made-to-Order';

-- Slips. Only the corner return has a made-to-order price.
update products
set retail_price = 217.50, trade_price = 191.40, volume_price = 174.00
where category_slug = 'brick-slips' and product_type in ('Clay Brick Slip', 'Flexible Slip');

update products
set retail_price = 250.12, trade_price = 220.11, volume_price = 200.10
where category_slug = 'brick-slips' and product_type = 'Corner Slip';

-- Braai kits. Island is not a separate line, so it takes the double-grid kit.
update products
set retail_price = 1232.50, trade_price = 1084.60, volume_price = 986.00
where category_slug = 'braai-kits' and product_type = 'Single Braai Kit';

update products
set retail_price = 1417.38, trade_price = 1247.29, volume_price = 1133.90
where category_slug = 'braai-kits' and product_type in ('Double Braai Kit', 'Island Braai Kit');

-- Do not claim a 15% premium on a line the list prices once.
update products
set description = replace(
  description,
  'Made-to-order (15% surcharge already in the price).',
  'Made-to-order. This line has one official price, with no separate made-to-order premium.'
)
where fulfilment_type = 'Made-to-Order'
  and (
    category_slug in (
      'stock-bricks',
      'engineering-bricks',
      'concrete-blocks',
      'concrete-maxi',
      'fire-bricks',
      'aac-blocks'
    )
    or (category_slug = 'brick-slips' and product_type in ('Clay Brick Slip', 'Flexible Slip'))
    or (category_slug = 'braai-kits' and product_type = 'Single Braai Kit')
  );
