import { appConfig } from '~/configs';
import { COMMIT_HASH } from '~/constants';

export const appendCommitHash =  (_request, reply, payload) => {
    try {
        reply.header(appConfig.server.commitHashKeyName, COMMIT_HASH);
        return payload;
    } catch (error) {
         // Log the error if appending the header fails
         console.error(`Failed to append commit hash: ${error.message}`);
         return payload; // Return the payload even if an error occurs
    }
};
