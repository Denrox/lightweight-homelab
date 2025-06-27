import { useState, useEffect } from "react";
import type { Download } from "~/types/downloads";
import FormField from "~/components/shared/form/form-field";
import FormInput from "~/components/shared/form/form-input";
import FormSelect from "~/components/shared/form/form-select";
import FormCheckbox from "~/components/shared/form/form-checkbox";
import FormButton from "~/components/shared/form/form-button";

interface DownloadFormProps {
  download?: Download;
  type: Download['type'];
  onSave: (download: Download) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function DownloadForm({ download, type, onSave, onCancel, isSubmitting = false }: DownloadFormProps) {
  const [formData, setFormData] = useState<Download>({
    type,
    url: '',
    dest: '',
    pattern: '',
    latest: false,
    image: '',
    namespace: 'library'
  });

  useEffect(() => {
    if (download) {
      // Strip "../../data/" prefix for display when editing
      const displayData = { ...download };
      if (displayData.dest && displayData.dest.startsWith('../../data/')) {
        displayData.dest = displayData.dest.replace(/^\.\.\/\.\.\/data\//, '');
      }
      setFormData(displayData);
    }
  }, [download]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on type
    if (type === 'direct' && (!formData.url || !formData.dest)) {
      alert('URL and destination are required for direct downloads');
      return;
    }
    
    if (type === 'pattern' && (!formData.url || !formData.dest || !formData.pattern)) {
      alert('URL, destination, and pattern are required for pattern downloads');
      return;
    }
    
    if (type === 'docker' && !formData.image) {
      alert('Image name is required for docker downloads');
      return;
    }

    onSave(formData);
  };

  const handleSubmitClick = () => {
    // Validate required fields based on type
    if (type === 'direct' && (!formData.url || !formData.dest)) {
      alert('URL and destination are required for direct downloads');
      return;
    }
    
    if (type === 'pattern' && (!formData.url || !formData.dest || !formData.pattern)) {
      alert('URL, destination, and pattern are required for pattern downloads');
      return;
    }
    
    if (type === 'docker' && !formData.image) {
      alert('Image name is required for docker downloads');
      return;
    }

    // Validate and process destination path
    if (formData.dest) {
      const dest = formData.dest.trim();
      
      // Check for invalid path patterns
      if (dest.includes('../') || dest.includes('./') || dest.startsWith('/')) {
        alert('Invalid destination path. Please use relative paths like "files/os/ubuntu-releases" or "wiki/zim"');
        return;
      }
      
      // Auto-prepend "../../data/" if not already present
      if (!dest.startsWith('../../data/')) {
        formData.dest = `../../data/${dest}`;
      }
    }

    onSave(formData);
  };

  const handleDestChange = (value: string) => {
    // Remove any "../" or "./" patterns as user types
    let cleanValue = value.replace(/\.\.\//g, '').replace(/\.\//g, '');
    
    // Remove leading slashes
    cleanValue = cleanValue.replace(/^\/+/, '');
    
    setFormData({ ...formData, dest: cleanValue });
  };

  const renderDirectFields = () => (
    <>
      <FormField label="URL" required>
        <FormInput
          value={formData.url || ''}
          onChange={(value) => setFormData({ ...formData, url: value })}
          placeholder="https://example.com/file.iso"
        />
      </FormField>
      
      <FormField label="Destination Path" required>
        <FormInput
          value={formData.dest || ''}
          onChange={handleDestChange}
          placeholder="files/os/ubuntu-releases"
        />
        <div className="text-[12px] text-gray-500 mt-[4px]">
          Path will be automatically prefixed with "../../data/"
        </div>
      </FormField>
    </>
  );

  const renderPatternFields = () => (
    <>
      <FormField label="URL" required>
        <FormInput
          value={formData.url || ''}
          onChange={(value) => setFormData({ ...formData, url: value })}
          placeholder="https://download.kiwix.org/zim/stack_exchange/"
        />
      </FormField>
      
      <FormField label="Destination Path" required>
        <FormInput
          value={formData.dest || ''}
          onChange={handleDestChange}
          placeholder="wiki/zim"
        />
        <div className="text-[12px] text-gray-500 mt-[4px]">
          Path will be automatically prefixed with "../../data/"
        </div>
      </FormField>
      
      <FormField label="Pattern" required>
        <FormInput
          value={formData.pattern || ''}
          onChange={(value) => setFormData({ ...formData, pattern: value })}
          placeholder="(stackoverflow\\.com_en_all)"
        />
      </FormField>
      
      <FormField label="Latest Only">
        <FormCheckbox
          checked={formData.latest || false}
          onChange={(checked) => setFormData({ ...formData, latest: checked })}
          label="Download only the latest file matching the pattern"
        />
      </FormField>
    </>
  );

  const renderDockerFields = () => (
    <>
      <FormField label="Image Name" required>
        <FormInput
          value={formData.image || ''}
          onChange={(value) => setFormData({ ...formData, image: value })}
          placeholder="nginx"
        />
      </FormField>
      
      <FormField label="Namespace">
        <FormSelect
          value={formData.namespace || 'library'}
          onChange={(value) => setFormData({ ...formData, namespace: value })}
          options={[
            { value: 'library', label: 'Library (Official)' },
            { value: 'custom', label: 'Custom' }
          ]}
        />
      </FormField>
    </>
  );

  const renderFields = () => {
    switch (type) {
      case 'direct':
        return renderDirectFields();
      case 'pattern':
        return renderPatternFields();
      case 'docker':
        return renderDockerFields();
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
      <div className="text-[18px] font-semibold">
        {download ? 'Edit Download' : 'Add New Download'}
      </div>
      
      {renderFields()}
      
      <div className="flex gap-[12px] justify-end">
        <FormButton type="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </FormButton>
        <FormButton type="primary" onClick={handleSubmitClick} disabled={isSubmitting}>
          {download ? 'Update' : 'Add'}
        </FormButton>
      </div>
    </form>
  );
} 