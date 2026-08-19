update public.sewing_patterns
set title = replace(title, 'Bikini', 'Panty'),
    updated_at = now()
where title ilike '%bikini%';
