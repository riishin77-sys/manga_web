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
        const chapterNumber = formData.get('chapterNumber') as string;
        const existingFolderId = formData.get('folderId') as string | null;
        const mangaFolderId = formData.get('mangaFolderId') as string | null;

        if (!file || !chapterNumber) {
            return NextResponse.json({ error: 'Missing file or chapterNumber' }, { status: 400 });
        }

        if (!mangaFolderId) {
            return NextResponse.json({ error: 'Missing mangaFolderId' }, { status: 400 });
        }

        const driveRootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

        if (!driveRootFolderId) {
            return NextResponse.json({ error: 'Server missing GOOGLE_DRIVE_ROOT_FOLDER_ID' }, { status: 500 });
        }

        const drive = await getUploadDriveClient();
        let targetFolderId = existingFolderId;

        // If no existing folderId was passed, this is the first image in the sequence.
        // We need to create the Chapter Folder first.
        if (!targetFolderId) {
            const folderRes = await drive.files.create({
                requestBody: {
                    name: `Chapter ${chapterNumber}`,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [mangaFolderId],
                },
                fields: 'id',
            });

            targetFolderId = folderRes.data?.id || null;

            if (!targetFolderId) {
                throw new Error('Failed to create Chapter Folder on Google Drive.');
            }

            // Immediately make the folder public so all contents inherit it (or are accessible)
            await makePublic(drive, targetFolderId);
        }

        // Upload the image file inside the target folder
        const buffer = await file.arrayBuffer();

        const driveRes = await drive.files.create({
            requestBody: {
                name: file.name, // Keep original filename for sorting (01.jpg, 02.jpg, etc.)
                mimeType: file.type,
                parents: [targetFolderId],
            },
            media: {
                mimeType: file.type,
                body: bufferToStream(buffer),
            },
            fields: 'id, webContentLink',
        });

        // Make the individual image public as well to be safe
        if (driveRes.data.id) {
            await makePublic(drive, driveRes.data.id);
        }

        return NextResponse.json({
            success: true,
            folderId: targetFolderId, // Return the folder ID so the client can pass it to subsequent requests
            fileId: driveRes.data.id,
        });

    } catch (error: any) {
        console.error('Chapter Image Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to upload chapter image' }, { status: 500 });
    }
}
