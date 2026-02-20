import { 
    S3Client, 
    PutObjectCommand, 
    DeleteObjectCommand, 
    GetObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Initialize the S3 Client pointed at Cloudflare R2
export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Generates a secure, temporary URL that the browser can use to upload directly to R2.
 */
export async function generateUploadUrl(key, contentType) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    // URL expires in 5 minutes
    return await getSignedUrl(r2Client, command, { expiresIn: 300 }); 
}

/**
 * Returns the public URL for reading the file (using your Custom Domain / dev URL)
 * Ideal for displaying images or thumbnails.
 */
export function getR2PublicUrl(key) {
    if (!key) return null;
    return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
}

/**
 * Generates a temporary, secure read URL for downloading files.
 * If downloadName is provided, it forces the browser to download the file rather than opening it.
 */
export async function generateReadUrl(key, downloadName = null) {
    if (!key) return null;

    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
    };

    // Force download header if a name is provided
    if (downloadName) {
        // encodeURIComponent handles spaces and special characters in filenames securely
        params.ResponseContentDisposition = `attachment; filename="${encodeURIComponent(downloadName)}"`;
    }

    const command = new GetObjectCommand(params);

    // URL expires in 1 hour (3600 seconds)
    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

/**
 * Deletes a file from the R2 bucket.
 * Call this from your Server Actions when a user deletes a note or blog.
 */
export async function deleteFileFromR2(key) {
    if (!key) return false;
    
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        
        await r2Client.send(command);
        console.log(`Successfully deleted ${key} from R2`);
        return true;
    } catch (error) {
        console.error(`Error deleting file ${key} from R2:`, error);
        return false;
    }
}