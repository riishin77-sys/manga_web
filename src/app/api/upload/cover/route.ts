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
        const title = formData.get('title') as string;

        if (!file || !title) {
            return NextResponse.json({ error: 'Missing file or title' }, { status: 400 });
        }

        const driveRootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

        if (!driveRootFolderId) {
            return NextResponse.json({ error: 'Server missing GOOGLE_DRIVE_ROOT_FOLDER_ID' }, { status: 500 });
        }

        const drive = await getUploadDriveClient();
        const buffer = await file.arrayBuffer();

        // First create the Manga Folder
        const folderRes = await drive.files.create({
            requestBody: {
                name: title,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [driveRootFolderId],
            },
            fields: 'id',
        });

        const mangaFolderId = folderRes.data.id;

        if (!mangaFolderId) {
            throw new Error('Failed to create Manga Folder on Google Drive.');
        }

        // Make the manga folder public
        await makePublic(drive, mangaFolderId);

        // Upload to Drive folder
        const driveRes = await drive.files.create({
            requestBody: {
                name: `cover-${Date.now()}-${file.name}`,
                mimeType: file.type,
                parents: [mangaFolderId], // Upload to newly created manga folder
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

        // Make the file publicly accessible so the frontend `<img src={...} />` can load it
        await makePublic(drive, fileId);

        return NextResponse.json({
            success: true,
            url: finalUrl,
            mangaFolderId: mangaFolderId
        });

    } catch (error: any) {
        console.error('Cover Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to upload cover' }, { status: 500 });
    }
}
