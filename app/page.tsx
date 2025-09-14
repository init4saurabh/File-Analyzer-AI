"use client"
import { DragDropUpload } from "@/components/file_upload";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4 flex flex-col gap-6 max-w-xl">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Drag & Drop Upload</h1>
          <p className="text-muted-foreground">Upload your files by dragging and dropping or clicking to browse</p>
        </div>
        

        <DragDropUpload
          maxFiles={5}
          maxSize={10 * 1024 * 1024} // 10MB
          acceptedTypes={["image/*", "application/pdf", ".doc", ".docx", ".txt"]}
          onFilesChange={(files) => {
            console.log("Files changed:", files)
          }}
        />
      </div>
      <Button>Submit</Button>
    </main>
  );
}
