import Title from "~/components/shared/title/title";
import ContentBlock from "~/components/shared/content-block/content-block";
import PageLayoutNav from "~/components/shared/layout/page-layout-nav";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useActionData, Form, useNavigation } from "react-router";
import classNames from "classnames";
import type { Route } from "./+types/downloads";
import type { Download } from "~/types/downloads";
import DownloadForm from "~/components/downloads/download-form";
import DownloadList from "~/components/downloads/download-list";
import NavLink from "~/components/shared/nav/nav-link";
import fs from "fs/promises";
import appConfig from "~/config/config.json";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Downloads Management" },
    { name: "description", content: "Manage automated downloads" },
  ];
}

export async function loader() {
  try {
    const content = await fs.readFile((appConfig as any).downloadsConfigPath, 'utf-8');
    const config = JSON.parse(content);
    return { downloads: config.downloads || [] };
  } catch (error) {
    console.error('Error reading downloads config:', error);
    return { downloads: [] };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get('action') as string;
  
  try {
    const content = await fs.readFile((appConfig as any).downloadsConfigPath, 'utf-8');
    const config = JSON.parse(content);
    
    switch (action) {
      case 'add': {
        const download: Download = JSON.parse(formData.get('download') as string);
        config.downloads.push(download);
        break;
      }
      case 'update': {
        const download: Download = JSON.parse(formData.get('download') as string);
        const index = parseInt(formData.get('index') as string);
        if (index >= 0 && index < config.downloads.length) {
          config.downloads[index] = download;
        } else {
          throw new Error('Download not found');
        }
        break;
      }
      case 'delete': {
        const index = parseInt(formData.get('index') as string);
        if (index >= 0 && index < config.downloads.length) {
          config.downloads.splice(index, 1);
        } else {
          throw new Error('Download not found');
        }
        break;
      }
      default:
        throw new Error('Invalid action');
    }
    
    await fs.writeFile((appConfig as any).downloadsConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error writing downloads config:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

const sections = [
  { id: "direct", linkName: "Direct Downloads", title: "Direct Downloads" },
  { id: "pattern", linkName: "Pattern Downloads", title: "Pattern Downloads" },
  { id: "docker", linkName: "Docker Images", title: "Docker Images" }
];

export default function Downloads() {
  const { downloads } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState<string>("direct");
  const [filteredDownloads, setFilteredDownloads] = useState<Download[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDownload, setEditingDownload] = useState<{ download: Download; index: number } | null>(null);

  useEffect(() => {
    const filtered = downloads.filter((download: Download) => download.type === activeSection);
    setFilteredDownloads(filtered);
    // Reset edit state when switching tabs
    setShowForm(false);
    setEditingDownload(null);
  }, [downloads, activeSection]);

  // Handle action results
  useEffect(() => {
    if (actionData?.success) {
      setShowForm(false);
      setEditingDownload(null);
      window.location.reload();
    } else if (actionData?.error) {
      alert(`Failed to save download: ${actionData.error}`);
    }
  }, [actionData]);

  const handleAddDownload = () => {
    setEditingDownload(null);
    setShowForm(true);
  };

  const handleEditDownload = (download: Download, filteredIndex: number) => {
    // Find the actual index in the full downloads array
    const actualIndex = downloads.findIndex((d: Download) => 
      d.type === download.type && 
      d.url === download.url && 
      d.dest === download.dest &&
      d.pattern === download.pattern &&
      d.image === download.image &&
      d.namespace === download.namespace
    );
    
    if (actualIndex !== -1) {
      setEditingDownload({ download, index: actualIndex });
      setShowForm(true);
    }
  };

  const handleDeleteDownload = (filteredIndex: number) => {
    const download = filteredDownloads[filteredIndex];
    if (!download) return;

    // Find the actual index in the full downloads array
    const actualIndex = downloads.findIndex((d: Download) => 
      d.type === download.type && 
      d.url === download.url && 
      d.dest === download.dest &&
      d.pattern === download.pattern &&
      d.image === download.image &&
      d.namespace === download.namespace
    );

    if (actualIndex === -1) return;

    if (confirm('Are you sure you want to delete this download?')) {
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('index', actualIndex.toString());
      
      const form = document.createElement('form');
      form.method = 'post';
      formData.forEach((value, key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    }
  };

  const handleSaveDownload = (download: Download) => {
    const formData = new FormData();
    
    if (editingDownload) {
      formData.append('action', 'update');
      formData.append('index', editingDownload.index.toString());
    } else {
      formData.append('action', 'add');
    }
    
    formData.append('download', JSON.stringify(download));
    
    const form = document.createElement('form');
    form.method = 'post';
    formData.forEach((value, key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDownload(null);
  };

  const isSubmitting = navigation.state === 'submitting';

  return (
    <PageLayoutNav
      nav={sections.map((section) => (
        <NavLink
          key={section.id}
          to={`#${section.id}`}
          isActive={activeSection === section.id}
          onClick={() => setActiveSection(section.id)}
        >
          {section.linkName}
        </NavLink>
      ))}
    >
      <>
        <Title 
          title={sections.find((section) => section.id === activeSection)?.title || ""} 
          action={
            <button
              onClick={handleAddDownload}
              className="h-[40px] w-[40px] bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-center"
              aria-label="Add Download"
            >
              +
            </button>
          }
        />
        
        {showForm ? (
          <ContentBlock>
            <DownloadForm
              download={editingDownload?.download}
              type={activeSection as Download['type']}
              onSave={handleSaveDownload}
              onCancel={handleCancelForm}
              isSubmitting={isSubmitting}
            />
          </ContentBlock>
        ) : (
          <ContentBlock>
            <DownloadList
              downloads={filteredDownloads}
              onEdit={handleEditDownload}
              onDelete={handleDeleteDownload}
            />
          </ContentBlock>
        )}
      </>
    </PageLayoutNav>
  );
} 