"use client"

import type { Attachment } from "@/types/user";
import { File, Download } from 'lucide-react';

interface MessageAttachmentProps {
  attachment: Attachment;
}

export function MessageAttachment({ attachment }: MessageAttachmentProps) {
  const renderContent = () => {
    switch (attachment.type) {
      case 'image':
        return (
          <img 
            src={attachment.url} 
            alt={attachment.fileName} 
            className="max-w-xs max-h-64 rounded-lg object-cover cursor-pointer" 
            onClick={() => window.open(attachment.url, '_blank')}
          />
        );
      case 'video':
        return <video src={attachment.url} controls className="max-w-xs rounded-lg" />;
      case 'audio':
        return <audio src={attachment.url} controls className="w-full max-w-xs" />;
      case 'file':
      default:
        return (
          <a 
            href={attachment.url} 
            target="_blank" 
            rel="noopener noreferrer"
            download={attachment.fileName}
            className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors max-w-xs"
          >
            <File className="h-8 w-8 mr-3 text-gray-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{attachment.fileName}</p>
              <p className="text-xs text-muted-foreground">{(attachment.size / 1024).toFixed(2)} KB</p>
            </div>
            <Download className="h-5 w-5 ml-3 text-gray-500" />
          </a>
        );
    }
  };

  return <div className="mt-2">{renderContent()}</div>;
}
