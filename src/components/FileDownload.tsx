import { FileItem } from '../types/file-item';

interface FileDownloadProps {
  files: FileItem[];
}

const FileDownload = ({ files }: FileDownloadProps) => {
  return (
    <div>
      <h2>File Download</h2>
      <ul>
        {files.map((file) => (
          <li key={file.path}>
            {file.name} - {file.status}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FileDownload