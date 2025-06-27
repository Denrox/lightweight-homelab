import Title from "~/components/shared/title/title";
import ContentBlock from "~/components/shared/content-block/content-block";
import PageLayoutNav from "~/components/shared/layout/page-layout-nav";
import { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router";
import classNames from "classnames";
import type { Route } from "./+types/downloads";
import { downloadsService, type Download } from "~/services/data/downloads";
import DownloadForm from "~/components/downloads/download-form";
import DownloadList from "~/components/downloads/download-list";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Downloads Management" },
    { name: "description", content: "Manage automated downloads" },
  ];
}

export async function loader() {
  const downloads = await downloadsService.getAllDownloads();
  return { downloads };
}

const sections = [
  { id: "direct", linkName: "Direct Downloads", title: "Direct Downloads" },
  { id: "pattern", linkName: "Pattern Downloads", title: "Pattern Downloads" },
  { id: "docker", linkName: "Docker Images", title: "Docker Images" }
];

export default function Downloads() {
  const { downloads } = useLoaderData<typeof loader>();
  const [activeSection, setActiveSection] = useState<string>("direct");
  const [filteredDownloads, setFilteredDownloads] = useState<Download[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDownload, setEditingDownload] = useState<{ download: Download; index: number } | null>(null);

  useEffect(() => {
    const filtered = downloads.filter(download => download.type === activeSection);
    setFilteredDownloads(filtered);
  }, [downloads, activeSection]);

  const handleAddDownload = () => {
    setEditingDownload(null);
    setShowForm(true);
  };

  const handleEditDownload = (download: Download, filteredIndex: number) => {
    // Find the actual index in the full downloads array
    const actualIndex = downloads.findIndex(d => 
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

  const handleDeleteDownload = async (filteredIndex: number) => {
    const download = filteredDownloads[filteredIndex];
    if (!download) return;

    // Find the actual index in the full downloads array
    const actualIndex = downloads.findIndex(d => 
      d.type === download.type && 
      d.url === download.url && 
      d.dest === download.dest &&
      d.pattern === download.pattern &&
      d.image === download.image &&
      d.namespace === download.namespace
    );

    if (actualIndex === -1) return;

    if (confirm('Are you sure you want to delete this download?')) {
      try {
        await downloadsService.deleteDownload(actualIndex);
        window.location.reload();
      } catch (error) {
        alert('Failed to delete download');
      }
    }
  };

  const handleSaveDownload = async (download: Download) => {
    try {
      if (editingDownload) {
        await downloadsService.updateDownload(editingDownload.index, download);
      } else {
        await downloadsService.addDownload(download);
      }
      setShowForm(false);
      setEditingDownload(null);
      window.location.reload();
    } catch (error) {
      alert('Failed to save download');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDownload(null);
  };

  return (
    <PageLayoutNav
      nav={sections.map((section) => (
        <Link 
          key={section.id}
          to={`#${section.id}`} 
          className={classNames(
            "text-[16px] block leading-[48px] min-h-[48px] flex-0 bg-blue-200 border-white border-b-2 hover:border-blue-600 px-[16px] w-[200px] hover:text-blue-600 text-center font-semibold", 
            {
              "border-blue-600 border-b-2 text-blue-600": activeSection === section.id
            }
          )}
          onClick={() => setActiveSection(section.id)}
        >
          {section.linkName}
        </Link>
      ))}
    >
      <>
        <Title title={sections.find((section) => section.id === activeSection)?.title || ""} />
        
        {showForm ? (
          <ContentBlock>
            <DownloadForm
              download={editingDownload?.download}
              type={activeSection as Download['type']}
              onSave={handleSaveDownload}
              onCancel={handleCancelForm}
            />
          </ContentBlock>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={handleAddDownload}
                className="h-[40px] px-[16px] bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Download
              </button>
            </div>
            
            <ContentBlock>
              <DownloadList
                downloads={filteredDownloads}
                onEdit={handleEditDownload}
                onDelete={handleDeleteDownload}
              />
            </ContentBlock>
          </>
        )}
      </>
    </PageLayoutNav>
  );
} 