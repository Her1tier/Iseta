import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://remxfxopqdgwqyyjssrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbXhmeG9wcWRnd3F5eWpzc3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc1ODcsImV4cCI6MjA4MzEwMzU4N30.SUekXSmKyyucfUoxHvJKlnILxI6Q0FDno4ykRW7XUDc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
    console.log('Fetching profile for slug "my-cool-shop"...');

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', 'my-cool-shop')
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Profile Data:');
        console.log('Bio:', profile.bio);
        console.log('Instagram:', profile.instagram_url);
        console.log('Banner:', profile.banner_url);
    }
}

checkProfile();
