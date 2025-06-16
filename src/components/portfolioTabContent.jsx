
import React, { useState, useRef } from 'react';
import { 
  Trash2, 
  Edit3, 
  Save, 
  Star,
  ImagePlus,
  Video,
  PlusCircle,
  Loader2,
  Check,
  Camera
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PortfolioGalleryTabContent = ({ 
  initialImages = [], 
  initialVideos = [],
  onSaveGallery = () => {},
  isLoading = false 
}) => {
  // State for managing images
  const [images, setImages] = useState([
    { 
      id: 1, 
      src: "/placeholder.svg?height=300&width=300&text=Portfolio+1", 
      alt: "Portfolio Image 1",
      title: "Birthday Party Setup",
      description: "Colorful birthday party decoration for 8-year-old"
    },
    { 
      id: 2, 
      src: "/placeholder.svg?height=300&width=300&text=Portfolio+2", 
      alt: "Portfolio Image 2",
      title: "Magic Show Performance",
      description: "Entertaining children with magic tricks"
    },
    { 
      id: 3, 
      src: "/placeholder.svg?height=300&width=300&text=Portfolio+3", 
      alt: "Portfolio Image 3",
      title: "Face Painting Session",
      description: "Professional face painting at outdoor event"
    },
  ]);

  // State for managing videos
  const [videoLinks, setVideoLinks] = useState([
    { id: 1, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Birthday Party Entertainment" }
  ]);

  // State for UI
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Refs
  const fileInputRef = useRef(null);

  // Test function to make sure event handling works
  const testDelete = (imageId) => {
    console.log('Delete clicked for image:', imageId);
    alert(`Delete clicked for image ${imageId}`);
  };

  // Simple delete function
  const handleDeleteImage = (imageId) => {
    console.log('Attempting to delete image:', imageId);
    if (confirm('Are you sure you want to delete this image?')) {
      setImages(prev => {
        const newImages = prev.filter(img => img.id !== imageId);
        console.log('New images array:', newImages);
        return newImages;
      });
    }
  };

  // Image upload handler
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);

    try {
      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        
        const newImage = {
          id: Date.now() + Math.random(),
          src: previewUrl,
          alt: `Portfolio image ${images.length + 1}`,
          title: file.name.split('.')[0],
          description: "",
          file: file
        };

        setImages(prev => [...prev, newImage]);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Update image details handler
  const handleUpdateImage = (imageId, updates) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ));
    setEditingImage(null);
  };

  // Add video link handler
  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;

    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/;
    if (!videoUrlPattern.test(newVideoUrl)) {
      alert('Please enter a valid YouTube or Vimeo URL');
      return;
    }

    const newVideo = {
      id: Date.now(),
      url: newVideoUrl,
      title: `Video ${videoLinks.length + 1}`
    };

    setVideoLinks(prev => [...prev, newVideo]);
    setNewVideoUrl("");
  };

  // Delete video handler
  const handleDeleteVideo = (videoId) => {
    setVideoLinks(prev => prev.filter(video => video.id !== videoId));
  };

  // Update video handler
  const handleUpdateVideo = (videoId, updates) => {
    setVideoLinks(prev => prev.map(video => 
      video.id === videoId ? { ...video, ...updates } : video
    ));
  };

  return (
    <div className="space-y-8">
      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Portfolio updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Photo Gallery Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <CardTitle>Photo Gallery</CardTitle>
              <CardDescription>
                Upload high-quality photos of your services. The first image will be your main cover photo.
              </CardDescription>
            </div>
            <Button 
              onClick={() => onSaveGallery({ images, videoLinks })}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {images.map((img, index) => (
              <div key={img.id} className="relative group">
                {/* Image Container */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Buttons - Always visible on mobile, hover on desktop */}
                <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Edit clicked for:', img.id);
                      setEditingImage(img);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-xs"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Delete button clicked for image:', img.id);
                      handleDeleteImage(img.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
                  >
                    🗑️
                  </button>
                </div>

                {/* Image Info */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black bg-opacity-70 text-white text-xs rounded px-2 py-1">
                    {index === 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">Cover Photo</span>
                      </div>
                    )}
                    <div className="truncate">{img.title || `Image ${index + 1}`}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Photo Button */}
            <div className="aspect-square">
              <label
                htmlFor="photo-upload"
                className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-full cursor-pointer hover:border-blue-500 transition-colors ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Photo</span>
                  </>
                )}
                <input 
                  id="photo-upload" 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {/* Test Button for debugging */}
          <div className="mb-4 p-4 bg-yellow-50 border rounded">
            <p className="text-sm text-yellow-800 mb-2">Debug: Test if buttons work</p>
            <Button 
              onClick={() => testDelete(999)}
              variant="outline"
              size="sm"
            >
              Test Delete Function
            </Button>
          </div>

          {/* Tips */}
          <div className="text-sm text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Camera className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 mb-1">Photo Tips:</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Upload high-quality images (1200x800px or larger)</li>
                  <li>• First image becomes your cover photo</li>
                  <li>• Show your services in action with happy customers</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Links Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Video Links</CardTitle>
          <CardDescription>
            Add links to YouTube or Vimeo videos showcasing your services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {videoLinks.map((video) => (
              <div key={video.id} className="flex items-center gap-2 p-3 border rounded-lg">
                <Video className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Input 
                    defaultValue={video.url} 
                    placeholder="https://youtube.com/..." 
                    className="mb-2"
                    onBlur={(e) => handleUpdateVideo(video.id, { url: e.target.value })}
                  />
                  <Input 
                    defaultValue={video.title} 
                    placeholder="Video title..." 
                    className="text-sm"
                    onBlur={(e) => handleUpdateVideo(video.id, { title: e.target.value })}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteVideo(video.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <div className="flex-1">
                <Input 
                  placeholder="Add new video link (e.g., https://youtube.com/watch?v=...)" 
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddVideo()}
                />
              </div>
              <Button 
                variant="outline"
                onClick={handleAddVideo}
                disabled={!newVideoUrl.trim()}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Add Video
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Image Details</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-title">Title</Label>
                <Input
                  id="image-title"
                  defaultValue={editingImage.title}
                  placeholder="Image title..."
                  onChange={(e) => setEditingImage(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="image-description">Description</Label>
                <Textarea
                  id="image-description"
                  defaultValue={editingImage.description}
                  placeholder="Describe what's shown in this image..."
                  rows={3}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setEditingImage(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleUpdateImage(editingImage.id, {
                  title: editingImage.title,
                  description: editingImage.description
                })}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioGalleryTabContent;