import { NextResponse } from 'next/server';
import { getUploadDriveClient } from '@/lib/drive-upload';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!id) {
        return new NextResponse('Missing file ID', { status: 400 });
    }

    try {
        const drive = await getUploadDriveClient();

        // Get the file content as an arraybuffer
        const response = await drive.files.get(
            { fileId: id, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        // Convert the arraybuffer to a Buffer
        const buffer = Buffer.from(response.data as ArrayBuffer);

        // Attempt to extract content-type if Google Drive returned it, otherwise fallback to jpeg
        const contentType = response.headers['content-type'] || 'image/jpeg';

        // Set cache control for 1 year (31536000 seconds) since manga and cover images won't change
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Cache-Control', 'public, max-age=31536000');

        return new NextResponse(buffer, {
            status: 200,
            headers,
        });
    } catch (error: any) {
        console.error('Image Proxy Error:', error.message || error);
        return new NextResponse('Error fetching image from Drive', { status: 500 });
    }
}
