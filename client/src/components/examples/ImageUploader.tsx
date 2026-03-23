import { useState } from 'react'
import ImageUploader from '../ImageUploader'

export default function ImageUploaderExample() {
  const [images, setImages] = useState<any[]>([])

  const handleAdd = (files: File[]) => {
    const newImages = files.map((file, index) => ({
      id: Date.now() + index + '',
      url: URL.createObjectURL(file),
      label: String.fromCharCode(97 + images.length + index),
      file
    }))
    setImages([...images, ...newImages])
  }

  const handleRemove = (id: string) => {
    setImages(images.filter(img => img.id !== id))
  }

  return <ImageUploader images={images} onImagesAdd={handleAdd} onImageRemove={handleRemove} />
}
