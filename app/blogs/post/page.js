"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { FaFeatherAlt, FaSave, FaTimes, FaLink, FaAlignLeft, FaQuoteRight, FaImage } from 'react-icons/fa';
import { createBlog, updateBlog } from "@/actions/blog.actions"; 
import { getBlogCoverUploadUrlAction } from "@/actions/upload.actions"; // ✅ NEW: R2 Upload Action

const PostBlogPage = ({ existingBlog = null, onBlogUpdated = () => {}, onClose = () => {} }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const isEditing = !!existingBlog;

    // --- State Management ---
    const [formData, setFormData] = useState({
        title: existingBlog?.title || '',
        summary: existingBlog?.summary || '', 
        content: existingBlog?.content || '',
        slug: existingBlog?.slug || '',
        tags: existingBlog?.tags ? existingBlog.tags.join(', ') : '' 
    });

    const [coverImage, setCoverImage] = useState(null); 
    const [previewImage, setPreviewImage] = useState(existingBlog?.coverImage || null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        if (!session && typeof window !== "undefined") {
            // Optional: router.push('/login');
        }
    }, [session, router]);

    // --- INTERNAL CSS: HOLOGRAPHIC THEME ---
    const styles = {
        container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' },
        formCard: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '3rem', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', color: '#fff' },
        header: { textAlign: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' },
        title: { fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(to right, #00d4ff, #ff00cc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' },
        formGroup: { marginBottom: '1.5rem', position: 'relative' },
        label: { marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
        input: { width: '100%', padding: '14px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s', fontFamily: 'inherit', boxSizing: 'border-box' },
        textarea: { width: '100%', padding: '14px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px', boxSizing: 'border-box' },
        fileInputWrapper: { position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' },
        fileLabel: { border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.3s', display: 'block', color: 'rgba(255,255,255,0.5)' },
        imagePreview: { width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.1)' },
        previewBox: { background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.2)', marginTop: '1rem', maxHeight: '400px', overflowY: 'auto', color: 'rgba(255,255,255,0.9)' },
        submitBtn: { padding: '14px 40px', borderRadius: '50px', background: 'linear-gradient(135deg, #00d4ff 0%, #333399 100%)', color: '#fff', border: 'none', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)', transition: 'transform 0.2s, opacity 0.2s', display: 'flex', alignItems: 'center', gap: '10px' },
        cancelBtn: { padding: '14px 30px', borderRadius: '50px', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '10px' },
        actions: { display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', flexWrap: 'wrap' },
        errorMsg: { background: 'rgba(255, 0, 85, 0.1)', color: '#ff0055', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(255, 0, 85, 0.2)', textAlign: 'center' },
        helperText: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '5px' },
        requiredStar: { color: '#ff0055', marginLeft: '4px' }
    };

    // --- Handlers ---
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'title' && !isEditing) {
            const newSlug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreviewImage(URL.createObjectURL(file)); 
        }
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = '#00d4ff';
        e.target.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.2)';
    };
    
    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.boxShadow = 'none';
    };

    // --- Helper: Client-Side Image Optimizer (16:9 WebP) ---
    const optimizeCoverImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    // Target 16:9 ratio, max width 1200px for blog covers
                    const MAX_WIDTH = 1200;
                    let targetWidth = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
                    let targetHeight = Math.round(targetWidth * (9 / 16));

                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    // Crop to center if original is not 16:9
                    const imgRatio = img.width / img.height;
                    const targetRatio = 16 / 9;
                    let sWidth = img.width, sHeight = img.height, sx = 0, sy = 0;

                    if (imgRatio > targetRatio) {
                        sWidth = img.height * targetRatio;
                        sx = (img.width - sWidth) / 2;
                    } else {
                        sHeight = img.width / targetRatio;
                        sy = (img.height - sHeight) / 2;
                    }

                    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

                    // Convert to WebP (0.8 quality = perfect balance of size/quality)
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], `cover.webp`, { type: "image/webp" }));
                        } else {
                            reject(new Error("Canvas to Blob failed"));
                        }
                    }, "image/webp", 0.8);
                };
                img.onerror = (error) => reject(error);
            };
        });
    };

    // --- Submit Logic (Migrated to Cloudflare R2) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim() || !formData.slug.trim()) {
            setError('All text fields are required.');
            return;
        }

        if (!isEditing && !coverImage) {
            setError('A cover image is required for new posts.');
            return;
        }

        setLoading(true);

        try {
            let imageUrl = previewImage; 
            let imageKey = existingBlog?.coverImageKey || null; // Keep existing R2 key if not changed

            // 1. Process & Upload Image to R2
            if (coverImage) {
                setUploadStatus("Optimizing image...");
                const optimizedImage = await optimizeCoverImage(coverImage);

                setUploadStatus("Uploading to R2...");
                const { success, uploadUrl, fileKey, error: uploadErr } = await getBlogCoverUploadUrlAction("image/webp");
                
                if (!success) throw new Error(uploadErr);

                await fetch(uploadUrl, {
                    method: "PUT",
                    body: optimizedImage,
                    headers: { "Content-Type": "image/webp" },
                });

                // Generate public R2 URL using env variable
                imageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileKey}`;
                imageKey = fileKey;
            }

            setUploadStatus(isEditing ? "Updating..." : "Publishing...");

            const tagArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

            let result;

            // 2. Call Server Action
            if (isEditing) {
                const updateData = {
                    title: formData.title,
                    content: formData.content,
                    summary: formData.summary,
                    slug: formData.slug,
                    tags: tagArray,
                    coverImage: imageUrl,        // Public URL
                    coverImageKey: imageKey,     // Secret Key for future deletion
                };
                result = await updateBlog(existingBlog._id, updateData, session?.user?.id);
            } else {
                result = await createBlog({
                    title: formData.title,
                    content: formData.content,
                    summary: formData.summary,
                    slug: formData.slug,
                    tags: tagArray,
                    coverImage: imageUrl,        // Public URL
                    coverImageKey: imageKey,     // Secret Key for future deletion
                    userId: session?.user?.id
                });
            }

            if (result.success) {
                if (isEditing) {
                    onBlogUpdated(result); 
                    onClose(); 
                } else {
                    router.push(`/blogs/${result.slug}`);
                }
            } else {
                throw new Error(result.error);
            }

        } catch (err) {
            console.error('Blog submission failed', err);
            setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} blog.`);
        } finally {
            setLoading(false);
            setUploadStatus('');
        }
    };
    
    return (
        <div className="post-blog-container" style={styles.container}>
            <form onSubmit={handleSubmit} className="post-blog-form" style={styles.formCard}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        <FaFeatherAlt /> {isEditing ? 'Edit Blog Post' : 'Write New Article'}
                    </h2>
                    <p style={{color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem'}}>
                        {isEditing ? 'Update your insights and tags.' : 'Share your knowledge with the community.'}
                    </p>
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}
                
                {/* --- Image Upload Section --- */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        <FaImage style={{color: '#ffaa00'}} /> Cover Image { !isEditing && <span style={styles.requiredStar}>*</span> }
                    </label>
                    <div style={styles.fileInputWrapper}>
                        <label htmlFor="coverImage" style={styles.fileLabel}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00d4ff'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                        >
                            {coverImage ? coverImage.name : (isEditing ? "Click to Change Banner Image" : "Click to Upload Banner Image (16:9 recommended)")}
                        </label>
                        <input 
                            id="coverImage" 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{display: 'none'}} 
                            required={!isEditing} 
                        />
                    </div>
                    {previewImage && (
                        <img 
                            src={previewImage} 
                            alt="Cover Preview" 
                            style={styles.imagePreview} 
                            referrerPolicy="no-referrer" 
                        />
                    )}
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="title" style={styles.label}>
                        <FaQuoteRight style={{color: '#00d4ff'}} /> Title <span style={styles.requiredStar}>*</span>
                    </label>
                    <input 
                        id="title" 
                        name="title" 
                        type="text" 
                        value={formData.title} 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="e.g., The Ultimate Guide to React Hooks" 
                        required 
                        style={styles.input}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label htmlFor="summary" style={styles.label}>
                        <FaAlignLeft style={{color: '#bc13fe'}} /> Summary (Teaser) <span style={styles.requiredStar}>*</span>
                    </label>
                    <textarea 
                        id="summary" 
                        name="summary" 
                        value={formData.summary} 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="A brief, engaging summary displayed in the feed..." 
                        rows="2" 
                        required 
                        style={styles.textarea}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="tags" style={styles.label}>
                        <FaLink style={{color: '#ff00cc'}} /> Tags
                    </label>
                    <input 
                        id="tags" 
                        name="tags" 
                        type="text" 
                        value={formData.tags} 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="React, JavaScript, WebDev (Comma separated)" 
                        style={styles.input}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label htmlFor="slug" style={styles.label}>
                        <FaLink style={{color: '#00ffaa'}} /> URL Slug <span style={styles.requiredStar}>*</span>
                    </label>
                    <input 
                        id="slug" 
                        name="slug" 
                        type="text" 
                        value={formData.slug} 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="auto-generated-from-title" 
                        required 
                        style={{...styles.input, fontFamily: 'monospace', color: '#00d4ff'}}
                    />
                    <p style={styles.helperText}>This will be the URL of your post. Keep it lowercase and hyphenated.</p>
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="content" style={styles.label}>
                        <FaFeatherAlt style={{color: '#ff00cc'}} /> Content (Markdown Supported) <span style={styles.requiredStar}>*</span>
                    </label>
                    <textarea 
                        id="content" 
                        name="content" 
                        value={formData.content} 
                        onChange={handleChange} 
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Write your article content here using Markdown..." 
                        rows="15" 
                        required 
                        style={{...styles.textarea, fontFamily: 'monospace'}}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <h3 style={{color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '0.5rem'}}>
                        Live Preview
                    </h3>
                    <div style={styles.previewBox} className="markdown-content prose prose-invert max-w-none">
                         <ReactMarkdown>{formData.content || "*Your content preview will appear here...*"}</ReactMarkdown>
                    </div>
                </div>

                <div style={styles.actions}>
                    {isEditing && (
                         <button 
                            type="button" 
                            style={styles.cancelBtn} 
                            onClick={onClose} 
                            disabled={loading}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <FaTimes /> Cancel
                        </button>
                    )}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer'}}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <FaSave /> {loading ? (uploadStatus || (isEditing ? 'Saving...' : 'Publishing...')) : (isEditing ? 'Save Changes' : 'Publish Post')}
                    </button>
                </div>
            </form>

            <style>{`
                /* Responsive Padding Adjustment for Mobile */
                @media (max-width: 768px) {
                    .post-blog-container { padding: 0.5rem !important; }
                    .post-blog-form { padding: 1rem !important; }
                }
            `}</style>
        </div>
    );
};

export default PostBlogPage;