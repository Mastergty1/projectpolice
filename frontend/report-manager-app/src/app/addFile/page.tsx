import FileUploader from "@/components/Uploader/FileUploader";
import Uploaded from "@/components/Uploader/Uploaded";

export default function addFile(){
    return (
        <div className="flex flex-col md:flex-row justify-between w-full md:h-full p-[4rem] pt-[2rem] gap-[3rem]">
              <div className="flex flex-1">
                <FileUploader></FileUploader>
              </div>
              <div className="flex flex-2">
                <Uploaded/> 
              </div>
            </div>
    )
}