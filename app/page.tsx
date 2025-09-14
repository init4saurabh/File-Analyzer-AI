import { FileUpload } from "@/components/file-upload";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6 flex flex-col gap-6 max-w-xl">
      <h1 className="text-3xl font-extrabold mb-6 ml-18">
  Samjhao File – AI Style
</h1>


      <div className="max-w-xl mx-auto">
        <FileUpload
          maxFiles={5}
          maxSize={10 * 1024 * 1024} 
          accept={{
            "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
            "application/pdf": [".pdf"],
            "application/msword": [".doc", ".docx"],
            "text/plain": [".txt"],
          }}
        />
      </div>
    </main>
  );
}