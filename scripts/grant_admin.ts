import { supabase } from './src/services/supabase';

async function grantAdmin() {
    const { data: user } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'rhanna@live.com')
        .single();

    if (user) {
        await supabase
            .from('profiles')
            .update({ is_admin: true, is_tester: true })
            .eq('id', user.id);
        console.log('Successfully granted admin/tester status to rhanna@live.com');
    } else {
        console.log('User rhanna@live.com not found in profiles table.');
    }
}

grantAdmin();
