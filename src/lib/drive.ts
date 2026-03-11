import { google } from 'googleapis';

export async function getDriveImages(folderId: string): Promise<string[]> {
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            console.warn('Missing Google OAuth2 credentials.');
            return [];
        }

        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            'https://developers.google.com/oauthplayground'
        );

        oauth2Client.setCredentials({ refresh_token: refreshToken });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const response = await drive.files.list({
            q: `'${folderId}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/webp') and trashed = false`,
            fields: 'files(id, name, mimeType)',
            orderBy: 'name',
            pageSize: 1000,
        });

        const files = response.data.files || [];

        return files
            .map(file => file.id ? `/api/image/${file.id}` : null)
            .filter((link): link is string => !!link);
    } catch (err) {
        console.warn('Google Drive failed to fetch explicitly:', err);
        return [];
    }
}
