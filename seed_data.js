import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://remxfxopqdgwqyyjssrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbXhmeG9wcWRnd3F5eWpzc3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc1ODcsImV4cCI6MjA4MzEwMzU4N30.SUekXSmKyyucfUoxHvJKlnILxI6Q0FDno4ykRW7XUDc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    // 1. Login
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'newshop@test.com',
        password: 'testpass123'
    });

    if (loginError) {
        console.error('Login failed:', loginError);
        return;
    }

    console.log('Logged in as:', session.user.email);

    // 2. Update Profile with Session
    const { data: profile, error: updateError } = await supabase
        .from('profiles')
        .update({
            bio: 'Welcome to My Cool Shop! We sell the best items.',
            instagram_url: 'https://instagram.com/mycoolshop',
            whatsapp_number: '0785555555',
            phone_number: '0785555555'
        })
        .eq('id', session.user.id) // Use ID for safer update
        .select();

    if (updateError) {
        console.error('Update failed:', updateError);
    } else {
        console.log('Profile updated:', profile);
    }
}

seedData();
