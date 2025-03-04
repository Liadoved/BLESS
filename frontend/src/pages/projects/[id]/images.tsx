import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ImageCategory, ProjectImage } from '../../../types';

const IMAGE_CATEGORIES: { [key in ImageCategory]: string } = {
  childhood: 'ילדות',
  youth: 'נעורים',
  army: 'צבא',
  wedding: 'חתונה',
  family: 'משפחה מורחבת',
  adulthood: 'חיים בוגרים',
  work_friends: 'חברים ועבודה'
};

export default function ProjectImages() {
  const router = useRouter();
  const { id } = router.query;
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>('childhood');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchImages();
    }
  }, [id]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/images`);
      const data = await response.json();
      setImages(data);
    } catch (error: any) {
      console.error('Failed to fetch images:', error);
      alert(error?.message || 'Failed to fetch images');
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (images.length + files.length > 70) {
      alert('מספר התמונות המקסימלי הוא 70');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('category', selectedCategory);
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`/api/projects/${id}/images/upload`, {
        method: 'POST',
        body: formData
      });
      const newImages = await response.json();
      setImages([...images, ...newImages]);
    } catch (error: any) {
      console.error('Failed to upload images:', error);
      alert(error?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImages(items);

    try {
      await fetch(`/api/projects/${id}/images/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images: items })
      });
    } catch (error: any) {
      console.error('Failed to reorder images:', error);
      alert(error?.message || 'Failed to reorder images');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            העלאת תמונות
          </h1>
          <p className="text-gray-600">
            העלו עד 70 תמונות וסדרו אותן לפי קטגוריות
          </p>
        </div>

        {/* קטגוריות */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-4">
          {Object.entries(IMAGE_CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as ImageCategory)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* אזור העלאה */}
        <div className="mb-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleImageUpload(e.dataTransfer.files);
            }}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? 'מעלה...' : 'העלאת תמונות'}
            </label>
            <p className="mt-2 text-sm text-gray-500">
              או גררו תמונות לכאן
            </p>
          </div>
        </div>

        {/* תצוגת תמונות */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images
            .filter(image => image.category === selectedCategory)
            .map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() => {/* פתיחת תצוגה מקדימה */}}
                    className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {/* מחיקת תמונה */}}
                    className="p-2 rounded-full bg-white text-red-600 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
