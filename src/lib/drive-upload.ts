import { google } from 'googleapis';
import { Readable } from 'stream';

// Initialize the Google Drive Client with upload scopes
export async function getUploadDriveClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing Google OAuth2 credentials.');
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
}

// Helper to make a file or folder public
export async function makePublic(drive: any, fileId: string) {
    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });
}

// Convert a Web File object (from FormData) into a readable Node stream for Googleapis
export function bufferToStream(buffer: ArrayBuffer) {
    const stream = new Readable();
    stream.push(Buffer.from(buffer));
    stream.push(null);
    return stream;
}
