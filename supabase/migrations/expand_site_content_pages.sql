  -- Site content table + seeds for editable marketing page copy.
  -- Safe to run if the table does not exist yet (creates it first).

  create table if not exists public.site_content (
    page_key text primary key,
    payload jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
  );

  alter table public.site_content enable row level security;

  drop policy if exists "Public can read site content" on public.site_content;
  create policy "Public can read site content"
    on public.site_content for select
    using (true);

  alter table public.site_content drop constraint if exists site_content_page_key_check;

  alter table public.site_content
    add constraint site_content_page_key_check
    check (page_key in ('homepage', 'about', 'services', 'contact', 'footer'));

  insert into public.site_content (page_key, payload)
  values
    (
      'services',
      jsonb_build_object(
        'heroTitle', 'Enns Real Estate Services',
        'heroDescription', 'We''re here to help you value, buy, and sell your home.',
        'appraisalTitle', 'Home Appraisal',
        'appraisalBody', 'Appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details.',
        'buyingTitle', 'Buying',
        'buyingBody', 'Appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details.',
        'sellingTitle', 'Selling',
        'sellingBody', 'Appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details.'
      )
    ),
    (
      'contact',
      jsonb_build_object(
        'title', 'Get in Touch',
        'intro', 'Ready to buy, sell, or have questions about the market? Send a message or give me a call.',
        'sectionTitle', 'Other ways to reach me',
        'mobile', '(519) 500-1641',
        'office', '(519) 888-7778',
        'fax', '(519) 954-7575',
        'email', 'brad@mres.ca',
        'addressLine1', '368 Ash Tree Place',
        'addressLine2', 'Waterloo, ON N2T 1R7',
        'facebookUrl', 'https://www.facebook.com/ennsrealestate',
        'linkedinUrl', 'https://ca.linkedin.com/pub/brad-enns/44/75b/5b9'
      )
    ),
    (
      'footer',
      jsonb_build_object(
        'copyright', 'Brad Enns. Kitchener–Waterloo & area.',
        'facebookUrl', 'https://www.facebook.com/ennsrealestate',
        'linkedinUrl', 'https://ca.linkedin.com/pub/brad-enns/44/75b/5b9'
      )
    )
  on conflict (page_key) do nothing;

  insert into public.site_content (page_key, payload)
  values (
    'homepage',
    jsonb_build_object(
    'heroEyebrow', 'Kitchener, Waterloo',
    'heroTitle', 'Enns Real Estate',
    'heroDescription', 'Real estate and brief agent description. Real estate and brief agent description. Real estate and brief agent description.',
    'heroCtaLabel', 'LEARN MORE',
    'primaryCtaLabel', 'View listings',
      'secondaryCtaLabel', 'Contact Brad',
      'sectionTitle', 'How I can help',
      'buyingTitle', 'Buying',
      'buyingText', 'Strategy for homes that fit your budget, neighbourhood, and timeline.',
      'sellingTitle', 'Selling',
      'sellingText', 'Pricing context, presentation, and negotiation with less guesswork.',
      'appraisalsTitle', 'Appraisals',
      'appraisalsText', 'Context on value and what to expect when numbers land on paper.',
      'footerNote', 'Placeholder copy. Replace with Brad''s voice, neighbourhoods, and credentials.'
    )
  )
  on conflict (page_key) do nothing;

  insert into public.site_content (page_key, payload)
  values (
    'about',
    jsonb_build_object(
      'eyebrow', 'Kitchener, Waterloo Real Estate Agent',
      'headline', 'Meet Brad Enns',
      'bio', 'Placeholder bio. Replace with Brad''s story, credentials, and neighbourhoods served.',
      'subheading', 'Another heading / What I do',
      'subBio', 'appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details',
      'stat1Value', '20+',
      'stat1Label', 'homes sold',
      'stat2Value', '5+',
      'stat2Label', 'years of experience',
      'phone', '519 - 500 - 1641',
      'email', 'brad@mres.ca',
      'ctaLabel', 'Contact Brad Today'
    )
  )
  on conflict (page_key) do nothing;
