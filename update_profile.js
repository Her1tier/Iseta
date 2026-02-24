import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://remxfxopqdgwqyyjssrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbXhmeG9wcWRnd3F5eWpzc3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc1ODcsImV4cCI6MjA4MzEwMzU4N30.SUekXSmKyyucfUoxHvJKlnILxI6Q0FDno4ykRW7XUDc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProfile() {
    console.log('Updating profile for slug "my-cool-shop"...');

    const { data: profile, error } = await supabase
        .from('profiles')
        .update({
            bio: 'Welcome to My Cool Shop! We sell the best items.',
            instagram_url: 'https://instagram.com/mycoolshop',
            whatsapp_number: '0785555555'
        })
        .eq('slug', 'my-cool-shop')
        .select();

    if (error) {
        console.error('Error updating profile:', error);
    } else {
        console.log('Profile updated successfully:', profile);
    }
}

updateProfile();
