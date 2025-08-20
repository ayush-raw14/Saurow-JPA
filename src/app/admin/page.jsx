"use client";

import { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { CldImage, CldUploadWidget } from 'next-cloudinary';
import SignOut from "./signOut";

export default function Admin() {
    const [activeTab, setActiveTab] = useState('blogs');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: null,
        subtitle: '',
        meta: '',
        members: []
    });

    const [data, setData] = useState({
        blogs: { title: '', subtitle: '', content: '', image: null, meta: '' },
        events: { title: '', subtitle: '', content: '', image: null, meta: '' },
        newsletter: { title: '', subtitle: '', content: '', image: null, meta: '' },
        teams: { title: '', subtitle: '', content: '', image: null, meta: '', members: [] }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [uploadError, setUploadError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/content/${activeTab}`);
                if (response.ok) {
                    const sectionData = await response.json();
                    setData(prev => ({
                        ...prev,
                        [activeTab]: sectionData
                    }));
                } else {
                    console.error('Failed to load data:', response.statusText);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [activeTab]);

    const tabs = [
        { key: 'blogs', label: 'Blog Page' },
        { key: 'events', label: 'Events Page' },
        { key: 'newsletter', label: 'News Page' },
        { key: 'teams', label: 'Team Page' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const startEditing = () => {
        const currentData = data[activeTab];
        setFormData({
            title: currentData.title || '',
            subtitle: currentData.subtitle || '',
            content: currentData.content || '',
            image: currentData.image || null,
            meta: currentData.meta || '',
            members: currentData.members || []
        });
        setIsEditing(true);
        setUploadError(null);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setFormData({
            title: '',
            subtitle: '',
            content: '',
            image: null,
            meta: '',
            members: []
        });
        setUploadError(null);
    };

    const addTeamMember = () => {
        setFormData(prev => ({
            ...prev,
            members: [...prev.members, { name: '', image: null, id: Date.now() }]
        }));
    };

    const removeTeamMember = (index) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.filter((_, i) => i !== index)
        }));
    };

    const updateTeamMember = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.map((member, i) =>
                i === index ? { ...member, [field]: value } : member
            )
        }));
    };

    const handleMemberImageUpload = (index, result) => {
        if (result.event === 'success' && result.info) {
            const imageUrl = result.info.secure_url || result.info.url || result.info.public_id;
            updateTeamMember(index, 'image', imageUrl);
        }
    };

    const handleUploadSuccess = (result) => {
        try {
            if (result.event === 'success' && result.info) {
                console.log('Full upload result:', result.info);
                const imageUrl = result.info.secure_url || result.info.url || result.info.public_id;
                setFormData(prev => ({
                    ...prev,
                    image: imageUrl
                }));
                setUploadError(null);
                console.log('Image uploaded successfully:', imageUrl);
            }
        } catch (error) {
            console.error('Upload success handler error:', error);
            setUploadError('Error processing uploaded image');
        }
    };

    const handleUploadError = (error) => {
        console.error('Upload error:', error);
        setUploadError('Failed to upload image. Please try again.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setUploadError(null);

        console.log('Submitting form data:', formData);

        try {
            const response = await fetch(`/api/content/${activeTab}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();
            console.log('Server response:', responseData);

            if (response.ok) {
                setData(prev => ({
                    ...prev,
                    [activeTab]: { ...formData }
                }));
                setIsEditing(false);
                alert('Content saved successfully!');
                console.log('Content saved successfully!');
            } else {
                console.error('Server error:', responseData);
                const errorMessage = responseData.error || responseData.message || 'Unknown server error';
                alert(`Error saving content: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Network/Client error:', error);
            alert(`Error saving content: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
    };

    const SafeUploadButton = ({
                                  uploadPreset,
                                  options,
                                  onSuccess,
                                  onError,
                                  buttonText,
                                  className
                              }) => {
        return (
            <CldUploadWidget
                uploadPreset={uploadPreset}
                options={options}
                onSuccess={onSuccess}
                onError={onError}
            >
                {(widget) => {
                    if (!widget || typeof widget.open !== 'function') {
                        return (
                            <button
                                type="button"
                                className={className}
                                disabled
                                title="Upload widget is loading..."
                            >
                                Loading...
                            </button>
                        );
                    }

                    return (
                        <button
                            type="button"
                            className={className}
                            onClick={() => widget.open()}
                        >
                            {buttonText}
                        </button>
                    );
                }}
            </CldUploadWidget>
        );
    };

    const currentPageData = data[activeTab];

    return (
        <section className={styles.admin}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Content Management</h1>
                </header>
                <SignOut />

                <nav className={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <main className={styles.content}>
                    {isLoading ? (
                        <div className={styles.loading}>Loading...</div>
                    ) : !isEditing ? (
                        <div className={styles.preview}>
                            <div className={styles.previewHeader}>
                                <div>
                                    <h2>{currentPageData.title || 'No title set'}</h2>
                                    <p className={styles.subtitle}>{currentPageData.subtitle || 'No subtitle set'}</p>
                                </div>
                                <button
                                    className={styles.editBtn}
                                    onClick={startEditing}
                                >
                                    Edit Page
                                </button>
                            </div>

                            {currentPageData.image && (
                                <div className={styles.previewImage}>
                                    <CldImage
                                        src={currentPageData.image}
                                        alt={currentPageData.title || 'Page image'}
                                        width={800}
                                        height={400}
                                        crop="fill"
                                        className={styles.previewImg}
                                        sizes="(max-width: 768px) 100vw, 800px"
                                        quality="auto"
                                        format="auto"
                                    />
                                </div>
                            )}

                            <div className={styles.previewContent}>
                                <p>{currentPageData.content || 'No content available'}</p>
                            </div>
                            
                            {activeTab === 'teams' && currentPageData.members && currentPageData.members.length > 0 && (
                                <div className={styles.teamPreview}>
                                    <h3>Team Members</h3>
                                    <div className={styles.membersGrid}>
                                        {currentPageData.members.map((member, index) => (
                                            <div key={index} className={styles.memberCard}>
                                                {member.image && (
                                                    <CldImage
                                                        src={member.image}
                                                        alt={member.name || 'Team member'}
                                                        width={200}
                                                        height={200}
                                                        crop="fill"
                                                        className={styles.memberImage}
                                                        quality="auto"
                                                        format="auto"
                                                    />
                                                )}
                                                <h4>{member.name || 'No name'}</h4>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentPageData.meta && (
                                <div className={styles.meta}>
                                    {currentPageData.meta}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.editor}>
                            <div className={styles.editorHeader}>
                                <h2>Edit {tabs.find(tab => tab.key === activeTab)?.label}</h2>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={cancelEditing}
                                >
                                    Cancel
                                </button>
                            </div>

                            {uploadError && (
                                <div className={styles.errorMessage}>
                                    {uploadError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Page Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Subtitle</label>
                                        <input
                                            type="text"
                                            name="subtitle"
                                            value={formData.subtitle}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Content</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        rows="8"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Hero Image</label>
                                    {formData.image ? (
                                        <div className={styles.imagePreview}>
                                            <CldImage
                                                src={formData.image}
                                                alt="Preview"
                                                width={600}
                                                height={300}
                                                crop="fill"
                                                className={styles.previewImg}
                                                sizes="(max-width: 768px) 100vw, 600px"
                                                quality="auto"
                                                format="auto"
                                            />
                                            <button
                                                type="button"
                                                className={styles.removeImage}
                                                onClick={removeImage}
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    ) : (
                                        <SafeUploadButton
                                            uploadPreset="ca_db_images"
                                            options={{
                                                sources: ['local', 'url', 'camera'],
                                                multiple: false,
                                                maxFiles: 1,
                                                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                                                maxFileSize: 50000000,
                                                folder: `admin/${activeTab}`,
                                                publicId: `${activeTab}_hero_${Date.now()}`,
                                                resourceType: 'image',
                                                cropping: false,
                                                eager: [
                                                    {
                                                        width: 1200,
                                                        height: 600,
                                                        crop: 'limit',
                                                        quality: 'auto',
                                                        format: 'auto'
                                                    }
                                                ],
                                                chunksizeBytes: 6000000,
                                                tags: [`${activeTab}_hero`, 'admin_upload']
                                            }}
                                            onSuccess={handleUploadSuccess}
                                            onError={handleUploadError}
                                            buttonText="Upload Hero Image"
                                            className={styles.uploadButton}
                                        />
                                    )}
                                </div>

                                {/* Team Members Management - Only show for teams tab */}
                                {activeTab === 'teams' && (
                                    <div className={styles.formGroup}>
                                        <div className={styles.membersHeader}>
                                            <label>Team Members</label>
                                            <button
                                                type="button"
                                                className={styles.addMemberBtn}
                                                onClick={addTeamMember}
                                            >
                                                Add Member
                                            </button>
                                        </div>

                                        <div className={styles.membersEditor}>
                                            {formData.members.map((member, index) => (
                                                <div key={member.id || index} className={styles.memberEditor}>
                                                    <div className={styles.memberEditorHeader}>
                                                        <h4>Member {index + 1}</h4>
                                                        <button
                                                            type="button"
                                                            className={styles.removeMemberBtn}
                                                            onClick={() => removeTeamMember(index)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>

                                                    <div className={styles.memberFields}>
                                                        <div className={styles.formGroup}>
                                                            <label>Name</label>
                                                            <input
                                                                type="text"
                                                                value={member.name}
                                                                onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                                                placeholder="Enter member name"
                                                                required
                                                            />
                                                        </div>

                                                        <div className={styles.formGroup}>
                                                            <label>Profile Image</label>
                                                            {member.image ? (
                                                                <div className={styles.imagePreview}>
                                                                    <CldImage
                                                                        src={member.image}
                                                                        alt={member.name || 'Member'}
                                                                        width={200}
                                                                        height={200}
                                                                        crop="fill"
                                                                        className={styles.memberImg}
                                                                        quality="auto"
                                                                        format="auto"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className={styles.removeImage}
                                                                        onClick={() => updateTeamMember(index, 'image', null)}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <SafeUploadButton
                                                                    uploadPreset="ca_db_images"
                                                                    options={{
                                                                        sources: ['local', 'url', 'camera'],
                                                                        multiple: false,
                                                                        maxFiles: 1,
                                                                        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                                                                        maxFileSize: 10000000,
                                                                        folder: `admin/teams/members`,
                                                                        publicId: `member_${Date.now()}_${index}`,
                                                                        resourceType: 'image',
                                                                        cropping: false,
                                                                        eager: [
                                                                            {
                                                                                width: 400,
                                                                                height: 400,
                                                                                crop: 'limit',
                                                                                quality: 'auto',
                                                                                format: 'auto'
                                                                            }
                                                                        ],
                                                                        tags: ['team_member', 'admin_upload']
                                                                    }}
                                                                    onSuccess={(result) => handleMemberImageUpload(index, result)}
                                                                    onError={handleUploadError}
                                                                    buttonText="Upload Profile Image"
                                                                    className={styles.uploadButton}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {formData.members.length === 0 && (
                                                <div className={styles.noMembers}>
                                                    <p>No team members added yet. Click "Add Member" to get started.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label>Meta Information</label>
                                    <input
                                        type="text"
                                        name="meta"
                                        value={formData.meta}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Updated monthly, Last updated: Jan 2024"
                                    />
                                </div>

                                <div className={styles.formActions}>
                                    <button
                                        type="submit"
                                        className={styles.saveBtn}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </main>
            </div>

        </section>
    );
}