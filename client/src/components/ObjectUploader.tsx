import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import XHRUpload from "@uppy/xhr-upload";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method?: "PUT" | "POST";
    url: string;
    uploadURL?: string;
    isLocalFallback?: boolean;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  
  // Create a new uppy instance each time we open the modal to handle dynamic upload methods
  const createUppyInstance = async () => {
    try {
      const params = await onGetUploadParameters();
      
      const uppyInstance = new Uppy({
        restrictions: {
          maxNumberOfFiles,
          maxFileSize,
        },
        autoProceed: false,
      });

      if (params.isLocalFallback) {
        // Use XHR upload for local fallback
        uppyInstance.use(XHRUpload, {
          endpoint: params.uploadURL || params.url,
          method: 'POST',
          formData: true,
          fieldName: 'file',
        });
        
        toast({
          title: "Using local storage",
          description: "Files will be uploaded to temporary storage. Please set up object storage for production use.",
        });
      } else {
        // Use AWS S3 for object storage
        uppyInstance.use(AwsS3, {
          shouldUseMultipart: false,
          getUploadParameters: async () => ({
            method: 'PUT' as const,
            url: params.url,
          }),
        });
      }

      uppyInstance.on("complete", (result) => {
        onComplete?.(result);
      });

      return uppyInstance;
    } catch (error) {
      console.error('Upload parameter error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to get upload parameters. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const [uppy, setUppy] = useState<Uppy | null>(null);

  const handleOpenModal = async () => {
    try {
      const uppyInstance = await createUppyInstance();
      setUppy(uppyInstance);
      setShowModal(true);
    } catch (error) {
      // Error is already handled in createUppyInstance
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (uppy) {
      uppy.destroy();
      setUppy(null);
    }
  };

  return (
    <div>
      <Button onClick={handleOpenModal} className={buttonClassName}>
        {children}
      </Button>

      {uppy && (
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={handleCloseModal}
          proudlyDisplayPoweredByUppy={false}
        />
      )}
    </div>
  );
}