import { supabaseAdmin } from '../config/supabase.js';

const AUTO_APPROVE_DELAY = 15000;

export const scheduleStudentVerification = (userId) => {
  setTimeout(async () => {
    try {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('student_verification_status')
        .eq('id', userId)
        .single();

      if (user?.student_verification_status === 'pending') {
        await supabaseAdmin
          .from('users')
          .update({ student_verification_status: 'approved' })
          .eq('id', userId);

        console.log(`Auto-approved student verification for user ${userId}`);
      }
    } catch (error) {
      console.error('Error auto-approving student verification:', error);
    }
  }, AUTO_APPROVE_DELAY);
};

export const scheduleLicenseVerification = (userId) => {
  setTimeout(async () => {
    try {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('drivers_license_verified')
        .eq('id', userId)
        .single();

      if (user && !user.drivers_license_verified) {
        await supabaseAdmin
          .from('users')
          .update({ drivers_license_verified: true })
          .eq('id', userId);

        console.log(`Auto-approved drivers license for user ${userId}`);
      }
    } catch (error) {
      console.error('Error auto-approving drivers license:', error);
    }
  }, AUTO_APPROVE_DELAY);
};
