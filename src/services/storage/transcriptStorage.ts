import { dataClient } from '../../lib/data-client';
import { Vault, getUserId } from './storageCore';
import { STORAGE_KEYS } from '../../constants';
import { withTimeout } from '../../utils/promiseUtils';
import type { Transcript } from '../../modules/grad/types';

export const TranscriptStorage = {
    async getTranscript(): Promise<Transcript | null> {
        const localResult = await Vault.getSecure<Transcript>(STORAGE_KEYS.TRANSCRIPT_CACHE);
        
        if (localResult === undefined) {
             console.error("[TranscriptStorage] Failed to decrypt transcript.");
             return null;
        }

        let transcript = localResult;

        const userId = await getUserId();
        if (userId) {
            const { data } = await dataClient
                .from('transcripts')
                .select('content')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data?.content) {
                let cloudTranscript = data.content as Transcript;
                
                if (transcript) {
                    const cloudUpdatedAt = cloudTranscript.dateUploaded || 0;
                    const localUpdatedAt = transcript.dateUploaded || 0;

                    if (cloudUpdatedAt > localUpdatedAt + 1000) {
                        transcript = cloudTranscript;
                        await Vault.setSecure(STORAGE_KEYS.TRANSCRIPT_CACHE, transcript);
                    } else if (localUpdatedAt > cloudUpdatedAt + 1000) {
                        // Local is newer, sync back to cloud
                        this.saveTranscript(transcript).catch(err => console.error("[TranscriptStorage] Sync-back failed:", err));
                    }
                } else {
                    transcript = cloudTranscript;
                    await Vault.setSecure(STORAGE_KEYS.TRANSCRIPT_CACHE, transcript);
                }
            }
        }
        return transcript;
    },

    async saveTranscript(transcript: Transcript) {
        const userId = await getUserId();
        
        // Ensure transcript has a dateUploaded timestamp for versioning
        const updatedTranscript = { 
            ...transcript, 
            dateUploaded: transcript.dateUploaded || Date.now() 
        };

        await Promise.all([
            Vault.setSecure(STORAGE_KEYS.TRANSCRIPT_CACHE, updatedTranscript),
            (async () => {
                if (!userId) return;

                const { data, error: selectError } = await withTimeout(
                    dataClient.from('transcripts').select('id').eq('user_id', userId).limit(1).maybeSingle()
                );

                if (selectError) throw selectError;

                const payload = {
                    user_id: userId,
                    university: updatedTranscript.university,
                    program: updatedTranscript.program,
                    content: updatedTranscript,
                    updated_at: new Date().toISOString()
                };

                if (data) {
                    const { error: updateError } = await withTimeout(
                        dataClient.from('transcripts').update(payload).eq('id', data.id)
                    );
                    if (updateError) throw updateError;
                } else {
                    const { error: insertError } = await withTimeout(
                        dataClient.from('transcripts').insert(payload)
                    );
                    if (insertError) throw insertError;
                }
            })()
        ]);
    }
};
