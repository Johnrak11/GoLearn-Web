"use client";

import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash } from "lucide-react";

interface FileUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

export default function FileUpload({
  disabled,
  onChange,
  onRemove,
  value,
}: FileUploadProps) {

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div
            key={url}
            className="relative h-[200px] w-[200px] overflow-hidden rounded-md border"
          >
            <div className="absolute right-2 top-2 z-10">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="h-full w-full object-cover" alt="Upload" src={url} />
          </div>
        ))}
      </div>
      <CldUploadWidget
        onSuccess={(result: CloudinaryUploadWidgetResults) => {
          const info = result?.info;
          if (typeof info === "object" && info?.secure_url) {
            onChange(info.secure_url);
          }
        }}
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          maxFiles: 1,
          resourceType: "auto",
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            disabled={disabled}
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              open();
            }}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Upload an Image
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
}
