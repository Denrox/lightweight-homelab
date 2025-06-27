import { useState, useEffect } from "react";
import type { Download } from "~/services/data/downloads";
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
}

export default function DownloadForm({ download, type, onSave, onCancel }: DownloadFormProps) {
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
      setFormData(download);
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

    onSave(formData);
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
          onChange={(value) => setFormData({ ...formData, dest: value })}
          placeholder="../../data/files/os/ubuntu-releases"
        />
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
          onChange={(value) => setFormData({ ...formData, dest: value })}
          placeholder="../../data/wiki/zim"
        />
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
        <FormButton type="secondary" onClick={onCancel}>
          Cancel
        </FormButton>
        <FormButton type="primary" onClick={handleSubmitClick}>
          {download ? 'Update' : 'Add'}
        </FormButton>
      </div>
    </form>
  );
} 