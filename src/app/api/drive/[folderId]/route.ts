import { NextResponse } from 'next/server';
import { getUploadDriveClient } from '@/lib/drive-upload';
import { createClient } from '@/lib/supabase-server';

export async function DELETE(
    request: Request,
    { params }: { params: { folderId: string } }
) {
    try {
        // Enforce Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const drive = await getUploadDriveClient();
        
        // Delete the folder (and all contents inside it are automatically deleted)
        await drive.files.delete({
            fileId: params.folderId
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Drive Folder Deletion Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete folder' }, { status: 500 });
    }
}
