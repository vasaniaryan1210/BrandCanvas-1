import DownloadSection from '../DownloadSection'

export default function DownloadSectionExample() {
  return (
    <DownloadSection
      collageCount={20}
      onDownload={() => console.log('Download triggered')}
      isGenerating={false}
    />
  )
}
