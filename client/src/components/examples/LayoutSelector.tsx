import { useState } from 'react'
import LayoutSelector from '../LayoutSelector'

export default function LayoutSelectorExample() {
  const [layout, setLayout] = useState('grid-2x2')
  return <LayoutSelector imagesPerCollage={4} selectedLayout={layout} onLayoutSelect={setLayout} />
}
