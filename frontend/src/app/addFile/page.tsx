import FileUploader from "@/components/Uploader/FileUploader";
import Uploaded from "@/components/Uploader/Uploaded";

export default function addFile(){
    return (
        <div className="flex flex-col md:flex-row justify-between w-full md:h-full p-16 pt-8 gap-12">
              <div className="flex flex-1">
                <FileUploader></FileUploader>
              </div>
              <div className="flex flex-2">
                <Uploaded/> 
              </div>
            </div>
    )
}