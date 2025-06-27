import { useState, useEffect } from "react";
import type { Download } from "~/types/downloads";
import FormField from "~/components/shared/form/form-field";
import FormInput from "~/components/shared/form/form-input";
import FormSelect from "~/components/shared/form/form-select";
import FormCheckbox from "~/components/shared/form/form-checkbox";
import FormButton from "~/components/shared/form/form-button";
import { 
  isValidPath, 
  normalizePath, 
  denormalizePath, 
  cleanPath, 
  getPathValidationError 
} from "~/utils/path-validation";

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

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (download) {
      // Strip "../../data/" prefix for display when editing
      const displayData = { ...download };
      if (displayData.dest) {
        displayData.dest = normalizePath(displayData.dest);
      }
      setFormData(displayData);
    }
  }, [download]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validate URL for direct and pattern downloads
    if (type === 'direct' || type === 'pattern') {
      if (!formData.url) {
        newErrors.url = 'URL is required';
      } else {
        try {
          new URL(formData.url);
        } catch {
          newErrors.url = 'Invalid URL format';
        }
      }

      // Validate destination path
      if (!formData.dest) {
        newErrors.dest = 'Destination path is required';
      } else {
        const pathError = getPathValidationError(formData.dest);
        if (pathError) {
          newErrors.dest = pathError;
        }
      }
    }

    // Additional validation for pattern downloads
    if (type === 'pattern') {
      if (!formData.pattern) {
        newErrors.pattern = 'Pattern is required';
      } else {
        try {
          new RegExp(formData.pattern);
        } catch {
          newErrors.pattern = 'Invalid regex pattern';
        }
      }
    }

    // Validate docker downloads
    if (type === 'docker') {
      if (!formData.image) {
        newErrors.image = 'Image name is required';
      } else if (!/^[a-zA-Z0-9\/\-_]+$/.test(formData.image)) {
        newErrors.image = 'Image name can only contain letters, numbers, hyphens, underscores, and forward slashes';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Process the form data
    const processedData = { ...formData };
    
    // Denormalize the destination path
    if (processedData.dest) {
      processedData.dest = denormalizePath(processedData.dest);
    }

    onSave(processedData);
  };

  const handleSubmitClick = () => {
    if (!validateForm()) {
      return;
    }

    // Process the form data
    const processedData = { ...formData };
    
    // Denormalize the destination path
    if (processedData.dest) {
      processedData.dest = denormalizePath(processedData.dest);
    }

    onSave(processedData);
  };

  const handleDestChange = (value: string) => {
    // Clean the path input
    const cleanedValue = cleanPath(value);
    setFormData({ ...formData, dest: cleanedValue });
    
    // Clear dest error if it exists
    if (errors.dest) {
      setErrors({ ...errors, dest: '' });
    }
  };

  const handleUrlChange = (value: string) => {
    setFormData({ ...formData, url: value });
    
    // Clear url error if it exists
    if (errors.url) {
      setErrors({ ...errors, url: '' });
    }
  };

  const handlePatternChange = (value: string) => {
    setFormData({ ...formData, pattern: value });
    
    // Clear pattern error if it exists
    if (errors.pattern) {
      setErrors({ ...errors, pattern: '' });
    }
  };

  const handleImageChange = (value: string) => {
    setFormData({ ...formData, image: value });
    
    // Clear image error if it exists
    if (errors.image) {
      setErrors({ ...errors, image: '' });
    }
  };

  const renderDirectFields = () => (
    <>
      <FormField label="URL" required error={errors.url}>
        <FormInput
          value={formData.url || ''}
          onChange={handleUrlChange}
          placeholder="https://example.com/file.iso"
        />
      </FormField>
      
      <FormField label="Destination Path" required error={errors.dest}>
        <FormInput
          value={formData.dest || ''}
          onChange={handleDestChange}
          placeholder="files/os/ubuntu-releases"
        />
        <div className="text-[12px] text-gray-500 mt-[4px]">
          Path will be automatically prefixed with "../../data/". Only letters, numbers, hyphens, underscores, and forward slashes are allowed. Trailing slashes are allowed for directories.
        </div>
      </FormField>
    </>
  );

  const renderPatternFields = () => (
    <>
      <FormField label="URL" required error={errors.url}>
        <FormInput
          value={formData.url || ''}
          onChange={handleUrlChange}
          placeholder="https://download.kiwix.org/zim/stack_exchange/"
        />
      </FormField>
      
      <FormField label="Destination Path" required error={errors.dest}>
        <FormInput
          value={formData.dest || ''}
          onChange={handleDestChange}
          placeholder="wiki/zim"
        />
        <div className="text-[12px] text-gray-500 mt-[4px]">
          Path will be automatically prefixed with "../../data/". Only letters, numbers, hyphens, underscores, and forward slashes are allowed. Trailing slashes are allowed for directories.
        </div>
      </FormField>
      
      <FormField label="Pattern" required error={errors.pattern}>
        <FormInput
          value={formData.pattern || ''}
          onChange={handlePatternChange}
          placeholder="(stackoverflow\\.com_en_all)"
        />
        <div className="text-[12px] text-gray-500 mt-[4px]">
          Enter a valid regex pattern to match files
        </div>
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
      <FormField label="Image Name" required error={errors.image}>
        <FormInput
          value={formData.image || ''}
          onChange={handleImageChange}
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