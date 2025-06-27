import type { Download } from "~/types/downloads";
import FormButton from "~/components/shared/form/form-button";

interface DownloadListProps {
  downloads: Download[];
  onEdit: (download: Download, index: number) => void;
  onDelete: (index: number) => void;
}

export default function DownloadList({ downloads, onEdit, onDelete }: DownloadListProps) {
  const formatDestinationPath = (path: string | undefined): string => {
    if (!path) return '';
    // Remove "../../data/" prefix if present for display
    return path.replace(/^\.\.\/\.\.\/data\//, '');
  };

  if (downloads.length === 0) {
    return (
      <div className="text-center text-gray-500 py-[48px]">
        No downloads found. Click "Add Download" to create one.
      </div>
    );
  }

  const renderDownloadInfo = (download: Download) => {
    switch (download.type) {
      case 'direct':
        return (
          <div className="flex flex-col gap-[8px]">
            <div className="text-[14px] font-semibold">Direct Download</div>
            <div className="text-[12px] text-gray-600">
              <div><strong>URL:</strong> {download.url}</div>
              <div><strong>Destination:</strong> {formatDestinationPath(download.dest)}</div>
            </div>
          </div>
        );
      
      case 'pattern':
        return (
          <div className="flex flex-col gap-[8px]">
            <div className="text-[14px] font-semibold">Pattern Download</div>
            <div className="text-[12px] text-gray-600">
              <div><strong>URL:</strong> {download.url}</div>
              <div><strong>Destination:</strong> {formatDestinationPath(download.dest)}</div>
              <div><strong>Pattern:</strong> {download.pattern}</div>
              <div><strong>Latest Only:</strong> {download.latest ? 'Yes' : 'No'}</div>
            </div>
          </div>
        );
      
      case 'docker':
        return (
          <div className="flex flex-col gap-[8px]">
            <div className="text-[14px] font-semibold">Docker Image</div>
            <div className="text-[12px] text-gray-600">
              <div><strong>Image:</strong> {download.image}</div>
              <div><strong>Namespace:</strong> {download.namespace}</div>
            </div>
          </div>
        );
      
      default:
        return <div className="text-[12px] text-gray-500">Unknown type</div>;
    }
  };

  return (
    <div className="flex flex-col gap-[16px]">
      {downloads.map((download, index) => (
        <div 
          key={index}
          className="flex flex-row justify-between items-center p-[16px] border border-gray-200 rounded-md bg-white shadow-sm"
        >
          <div className="flex-1">
            {renderDownloadInfo(download)}
          </div>
          
          <div className="flex gap-[8px]">
            <FormButton 
              type="secondary" 
              size="small"
              onClick={() => onEdit(download, index)}
            >
              Edit
            </FormButton>
            <FormButton 
              type="danger" 
              size="small"
              onClick={() => onDelete(index)}
            >
              Delete
            </FormButton>
          </div>
        </div>
      ))}
    </div>
  );
} 