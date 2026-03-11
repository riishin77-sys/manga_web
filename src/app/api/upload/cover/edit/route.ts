import { NextResponse } from 'next/server';
import { getUploadDriveClient, bufferToStream, makePublic } from '@/lib/drive-upload';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Enforce Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const mangaFolderId = formData.get('mangaFolderId') as string;

        if (!file || !mangaFolderId) {
            return NextResponse.json({ error: 'Missing file or mangaFolderId' }, { status: 400 });
        }

        const drive = await getUploadDriveClient();
        const buffer = await file.arrayBuffer();

        // Upload to existing Manga Drive folder
        const driveRes = await drive.files.create({
            requestBody: {
                name: `cover-edit-${Date.now()}-${file.name}`,
                mimeType: file.type,
                parents: [mangaFolderId], 
            },
            media: {
                mimeType: file.type,
                body: bufferToStream(buffer),
            },
            fields: 'id',
        });

        const fileId = driveRes.data.id;

        if (!fileId) {
            throw new Error('Failed to retrieve file ID from Google Drive after upload.');
        }

        const finalUrl = `/api/image/${fileId}`;

        // Make the file publicly accessible via proxy
        await makePublic(drive, fileId);

        return NextResponse.json({
            success: true,
            url: finalUrl
        });

    } catch (error: any) {
        console.error('Cover Edit Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to upload cover' }, { status: 500 });
    }
}
