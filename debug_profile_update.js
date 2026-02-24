// Debug script to test profile update with detailed logging
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://remxfxopqdgwqyyjssrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbXhmeG9wcWRnd3F5eWpzc3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc1ODcsImV4cCI6MjA4MzEwMzU4N30.SUekXSmKyyucfUoxHvJKlnILxI6Q0FDno4ykRW7XUDc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProfileUpdate() {
    console.log('=== DEBUGGING PROFILE UPDATE ===\n');

    // 1. Login
    console.log('Step 1: Logging in...');
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'newshop@test.com',
        password: 'testpass123'
    });

    if (loginError) {
        console.error('❌ Login failed:', loginError);
        return;
    }
    console.log('✅ Logged in as:', session.user.email);
    console.log('   User ID:', session.user.id);

    // 2. Fetch current profile
    console.log('\nStep 2: Fetching current profile...');
    const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (fetchError) {
        console.error('❌ Fetch failed:', fetchError);
        return;
    }
    console.log('✅ Current profile:', {
        id: currentProfile.id,
        shop_name: currentProfile.shop_name,
        bio: currentProfile.bio,
        instagram_url: currentProfile.instagram_url,
        phone_number: currentProfile.phone_number
    });

    // 3. Attempt update
    console.log('\nStep 3: Attempting update...');
    const updateData = {
        bio: 'Welcome to My Cool Shop! We sell the best items.',
        instagram_url: 'https://instagram.com/mycoolshop',
        phone_number: '0785555555',
        whatsapp_number: '0785555555',
        updated_at: new Date().toISOString()
    };

    console.log('Update data:', updateData);

    const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', session.user.id)
        .select();

    if (updateError) {
        console.error('\n❌ UPDATE FAILED!');
        console.error('Error details:', {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
        });
        return;
    }

    if (!updatedProfile || updatedProfile.length === 0) {
        console.error('\n⚠️  UPDATE RETURNED EMPTY RESULT');
        console.error('   This usually means RLS policies blocked the update');
        console.error('   The query succeeded but no rows were affected');
    } else {
        console.log('\n✅ UPDATE SUCCESSFUL!');
        console.log('Updated profile:', updatedProfile[0]);
    }

    // 4. Verify update by fetching again
    console.log('\nStep 4: Verifying update...');
    const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (verifyError) {
        console.error('❌ Verification failed:', verifyError);
        return;
    }

    console.log('Verified profile:', {
        bio: verifyProfile.bio,
        instagram_url: verifyProfile.instagram_url,
        phone_number: verifyProfile.phone_number,
        whatsapp_number: verifyProfile.whatsapp_number
    });

    if (verifyProfile.bio === updateData.bio) {
        console.log('\n✅ ALL TESTS PASSED - Update is working!');
    } else {
        console.log('\n❌ UPDATE DID NOT PERSIST - RLS issue confirmed');
    }
}

debugProfileUpdate().catch(console.error);
