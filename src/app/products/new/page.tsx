'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState, ChangeEvent, useRef } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// --- Type definition for a product variation ---
type Variation = {
    id: number;
    name: string; // e.g., 'Color'
    value: string; // e.g., 'Red'
    price: string;
    cost: string;
};

// --- Type definition for an uploaded image ---
type UploadedImage = {
    id: number;
    src: string;
};

// --- Helper function to get cropped image data ---
function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return Promise.reject(new Error('Canvas context is not available.'));
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error('Canvas is empty.'));
                return;
            }
            const fileUrl = window.URL.createObjectURL(blob);
            resolve(fileUrl);
        }, 'image/jpeg');
    });
}


// --- Main Page Component ---
export default function AddNewProductPage() {
    const [hasVariations, setHasVariations] = useState(false);
    const [variations, setVariations] = useState<Variation[]>([]);
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [imageToCrop, setImageToCrop] = useState<UploadedImage | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const imgRef = useRef<HTMLImageElement>(null);

    const addVariation = () => {
        setVariations([
            ...variations,
            { id: Date.now(), name: '', value: '', price: '', cost: '' }
        ]);
    };

    const removeVariation = (id: number) => {
        setVariations(variations.filter(v => v.id !== id));
    };

    const handleVariationChange = (id: number, field: keyof Omit<Variation, 'id'>, value: string) => {
        setVariations(
            variations.map(v => v.id === id ? { ...v, [field]: value } : v)
        );
    };

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);

            const imagePromises = files.map(file => {
                return new Promise<{ src: string, valid: boolean }>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.onload = () => {
                            if (img.width < 300 || img.height < 300) {
                                alert(`Image "${file.name}" is too small. Please upload images that are at least 300x300 pixels.`);
                                resolve({ src: '', valid: false });
                            } else {
                                resolve({ src: img.src, valid: true });
                            }
                        };
                        img.onerror = reject;
                        img.src = e.target?.result as string;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imagePromises)
                .then(results => {
                    const validImages = results
                        .filter(r => r.valid)
                        .map(r => ({ id: Date.now() + Math.random(), src: r.src }));
                    setImages(prevImages => [...prevImages, ...validImages]);
                })
                .catch(error => {
                    console.error("Error processing images:", error);
                    alert("There was an error processing some of the images.");
                });
        }
    };


    const removeImage = (id: number) => {
        setImages(images.filter(img => img.id !== id));
    };

    const handleCropImage = async () => {
        if (imgRef.current && crop?.width && crop?.height && imageToCrop) {
            const croppedImageUrl = await getCroppedImg(imgRef.current, crop);
            setImages(images.map(img => img.id === imageToCrop.id ? { ...img, src: croppedImageUrl } : img));
            setImageToCrop(null); // Close modal
        }
    };

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 90,
            },
            1, // aspect ratio 1:1
            width,
            height
          ),
          width,
          height
        );
        setCrop(crop);
    }

    return (
        <DashboardLayout>
            {/* Centering and Width Wrapper */}
            <div className="w-full lg:w-4/5 mx-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                    <Link href="/products">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300">
                            Cancel
                        </button>
                    </Link>
                </div>

                {/* Form Section */}
                <div className="bg-white p-8 rounded-lg shadow-sm">
                    <form className="space-y-8">
                        {/* Product Name */}
                        <div>
                            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input type="text" id="productName" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>

                        {/* Product Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                            <textarea id="description" rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
                        </div>
                        
                        {/* Image Upload Section */}
                        <div className="border-t pt-6">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (min. 300x300)</label>
                             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                {images.map((image) => (
                                    <div key={image.id} className="relative aspect-square group">
                                        <img src={image.src} alt="Product preview" className="w-full h-full object-cover rounded-lg" />
                                        <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-start justify-between p-1">
                                            <button type="button" onClick={() => setImageToCrop(image)} className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 rounded-full p-1 leading-none hover:bg-gray-200">
                                                <Icons.campaigns className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => removeImage(image.id)} className="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-1 leading-none hover:bg-red-700">
                                                <Icons.close className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <label htmlFor="image-upload" className="cursor-pointer aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500">
                                    <div className="text-center">
                                        <Icons.products className="mx-auto h-8 w-8 text-gray-400" />
                                        <span className="mt-2 block text-xs font-medium text-gray-500">Add Image</span>
                                    </div>
                                    <input id="image-upload" name="image-upload" type="file" className="sr-only" multiple onChange={handleImageUpload} accept="image/*" />
                                </label>
                             </div>
                        </div>


                        {/* Variations Question */}
                        <div className="border-t pt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Does this product have variations like Colours, Sizes, etc?</label>
                            <div className="flex items-center gap-x-6">
                                <div className="flex items-center">
                                    <input id="no-variations" name="variations-option" type="radio" checked={!hasVariations} onChange={() => setHasVariations(false)} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                    <label htmlFor="no-variations" className="ml-2 block text-sm text-gray-900">No, it doesn’t</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="yes-variations" name="variations-option" type="radio" checked={hasVariations} onChange={() => setHasVariations(true)} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                    <label htmlFor="yes-variations" className="ml-2 block text-sm text-gray-900">Yes, it has</label>
                                </div>
                            </div>
                        </div>

                        {/* Conditional Fields */}
                        {hasVariations ? (
                            // -- Variations Section --
                            <div className="border-t pt-6 space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Product Variations</h3>
                                {variations.map((variation) => (
                                    <div key={variation.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg relative">
                                        <input type="text" placeholder="Option Name (e.g. Color)" value={variation.name} onChange={(e) => handleVariationChange(variation.id, 'name', e.target.value)} className="col-span-1 md:col-span-1 border border-gray-300 rounded-lg p-2" />
                                        <input type="text" placeholder="Option Value (e.g. Red)" value={variation.value} onChange={(e) => handleVariationChange(variation.id, 'value', e.target.value)} className="col-span-1 md:col-span-1 border border-gray-300 rounded-lg p-2" />
                                        <input type="text" placeholder="Price (₦)" value={variation.price} onChange={(e) => handleVariationChange(variation.id, 'price', e.target.value)} className="col-span-1 md:col-span-1 border border-gray-300 rounded-lg p-2" />
                                        <input type="text" placeholder="Cost Price (₦)" value={variation.cost} onChange={(e) => handleVariationChange(variation.id, 'cost', e.target.value)} className="col-span-1 md:col-span-1 border border-gray-300 rounded-lg p-2" />
                                        <button type="button" onClick={() => removeVariation(variation.id)} className="col-span-1 md:col-span-1 text-red-500 hover:text-red-700 flex items-center justify-center">
                                            <Icons.expenses className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                                 <button type="button" onClick={addVariation} className="w-full border-2 border-dashed border-gray-300 text-gray-500 px-4 py-2 rounded-lg hover:border-primary-500 hover:text-primary-500">
                                    + Add Variation
                                </button>
                            </div>
                        ) : (
                            // -- Simple Price Section --
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                                    <input type="text" id="price" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₦)</label>
                                    <input type="text" id="costPrice" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 border-t pt-6">
                             <Link href="/products">
                                <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">
                                    Cancel
                                </button>
                            </Link>
                            <button type="submit" className="bg-[linear-gradient(90deg,#FA4A84,#7E51FF,#FA4A84,#7E51FF)] bg-[length:200%_auto] hover:bg-right transition-all duration-500 ease-in-out text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl">
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Crop Modal */}
            {imageToCrop && (
                <div className="fixed inset-0  bg-opacity-75 z-50 flex justify-center items-center p-4">
                    <div className="bg-white p-4 rounded-lg shadow-2xl max-w-2xl w-full">
                        <h3 className="text-xl font-semibold mb-4">Crop Image</h3>
                        <ReactCrop
                            crop={crop}
                            onChange={c => setCrop(c)}
                            aspect={1} // Square aspect ratio
                        >
                            <img ref={imgRef} src={imageToCrop.src} alt="Crop preview" style={{maxHeight: '70vh'}} onLoad={onImageLoad} />
                        </ReactCrop>
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => setImageToCrop(null)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                            <button onClick={handleCropImage} className="bg-[#8430ce] hover:bg-[#6b26a6] text-white px-4 py-2 rounded-lg">Crop & Save</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
