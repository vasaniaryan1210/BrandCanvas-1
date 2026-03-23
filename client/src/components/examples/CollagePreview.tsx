import CollagePreview from '../CollagePreview'

export default function CollagePreviewExample() {
  const mockImages = [
    { url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400', label: 'a' },
    { url: 'https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400', label: 'b' },
    { url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400', label: 'c' },
    { url: 'https://images.unsplash.com/photo-1682687220920-a29a92d06d71?w=400', label: 'd' },
  ]

  return (
    <CollagePreview
      images={mockImages}
      layout="grid-2x2"
      textOverlay={{ text: 'Summer 2024', fontSize: 32, color: '#FFFFFF', position: 'bottom-center' }}
      collageName="a+b+c+d"
      currentIndex={1}
      totalCount={15}
      onPrevious={() => console.log('Previous')}
      onNext={() => console.log('Next')}
    />
  )
}
