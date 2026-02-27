// MTN MoMo API Configuration
export const MOMO_CONFIG = {
  // API Credentials (stored as Supabase secrets)
  API_USER: Deno.env.get('MOMO_API_USER') || '',
  API_KEY: Deno.env.get('MOMO_API_KEY') || '',
  PRIMARY_KEY: Deno.env.get('MOMO_PRIMARY_KEY') || '7f7668344bdb4584bce151d3dec6bb75',
  SECONDARY_KEY: Deno.env.get('MOMO_SECONDARY_KEY') || '41141b5c8f4446cfbf512a344e65c670',
  SUBSCRIPTION_KEY: Deno.env.get('MOMO_SUBSCRIPTION_KEY') || '',
  
  // API URLs
  BASE_URL: Deno.env.get('MOMO_BASE_URL') || 'https://sandbox.momodeveloper.mtn.com',
  CALLBACK_URL: Deno.env.get('MOMO_CALLBACK_URL') || '',
  
  // Environment
  TARGET_ENVIRONMENT: Deno.env.get('MOMO_TARGET_ENVIRONMENT') || 'sandbox', // 'sandbox' or 'production'
}

// Validate configuration
export function validateMomoConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!MOMO_CONFIG.API_USER) errors.push('MOMO_API_USER is missing')
  if (!MOMO_CONFIG.API_KEY) errors.push('MOMO_API_KEY is missing')
  if (!MOMO_CONFIG.SUBSCRIPTION_KEY) errors.push('MOMO_SUBSCRIPTION_KEY is missing')
  if (!MOMO_CONFIG.CALLBACK_URL) errors.push('MOMO_CALLBACK_URL is missing')
  
  return {
    valid: errors.length === 0,
    errors
  }
}
