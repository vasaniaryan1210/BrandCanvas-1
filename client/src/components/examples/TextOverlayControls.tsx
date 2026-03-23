import { useState } from 'react'
import TextOverlayControls from '../TextOverlayControls'

export default function TextOverlayControlsExample() {
  const [overlay, setOverlay] = useState<any>(null)
  return <TextOverlayControls textOverlay={overlay} onTextOverlayChange={setOverlay} />
}
