import { supabase } from './src/services/supabase';

async function checkStatus() {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'rhanna@live.com')
        .maybeSingle();

    if (error) {
        console.error('Database Error:', error);
    } else if (profile) {
        console.log('Profile found for rhanna@live.com:');
        console.log(JSON.stringify(profile, null, 2));
    } else {
        console.log('No profile found for rhanna@live.com.');
    }
}

checkStatus();
