export const environment = {
  production: true,
  token: process.env['NG_APP_TOKEN'] || '',

  supabase: {
    url: process.env['NG_APP_SUPABASE_URL'] || '',
    anonKey: process.env['NG_APP_SUPABASE_ANON_KEY'] || '',
    enabled: true,
  },
};
