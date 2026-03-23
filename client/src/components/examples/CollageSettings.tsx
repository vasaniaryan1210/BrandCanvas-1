import { useState } from 'react'
import CollageSettings from '../CollageSettings'

export default function CollageSettingsExample() {
  const [value, setValue] = useState(3)
  return <CollageSettings imagesPerCollage={value} onImagesPerCollageChange={setValue} totalImages={6} />
}
