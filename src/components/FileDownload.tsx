import { useState, useEffect, useRef, type FC } from 'react';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import type { FileItem } from '../types/file-item';
import './FileDownload.scss';

interface FileDownloadProps {
  files: FileItem[];
}

export const FileDownload: FC<FileDownloadProps> = ({ files }) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const availableFiles = files.map((file, index) => ({ ...file, index }))
    .filter(file => file.status === 'available');
  const availableIndices = availableFiles.map(file => file.index);

  const selectedCount = selectedFiles.size;
  const availableCount = availableFiles.length;

  useEffect(() => {
    if (selectAllRef.current) {
      if (selectedCount === 0) {
        selectAllRef.current.indeterminate = false;
        selectAllRef.current.checked = false;
      } else if (selectedCount === availableCount) {
        selectAllRef.current.indeterminate = false;
        selectAllRef.current.checked = true;
      } else {
        selectAllRef.current.indeterminate = true;
        selectAllRef.current.checked = false;
      }
    }
  }, [selectedCount, availableCount]);

  const handleSelectAll = () => {
    if (selectedCount === availableCount) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(availableIndices));
    }
  };

  const handleFileSelect = (index: number) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFiles(newSelected);
  };

  const handleDownloadSelected = () => {
    const selectedFileDetails = Array.from(selectedFiles)
      .map(index => files[index])
      .map(file => `Device: ${file.device}\nPath: ${file.path}`)
      .join('\n\n');

    if (selectedFileDetails) {
      alert(selectedFileDetails);
    }
  };

  const getSelectionText = () => {
    return selectedCount === 0 ? 'None Selected' : `Selected ${selectedCount}`;
  };

  return (
    <div className="fd" role="region" aria-label="File download manager">
      <div className="fd__header">
        <div className="fd__selection" role="group" aria-label="File selection controls">
          <input
            ref={selectAllRef}
            type="checkbox"
            className="fd__select-all"
            onChange={handleSelectAll}
            aria-label="Select all available files"
            aria-describedby="selection-count"
          />
          <span
            id="selection-count"
            className="fd__selection-text"
          >
            {getSelectionText()}
          </span>
        </div>
        <button
          className="fd__btn"
          onClick={handleDownloadSelected}
          disabled={selectedCount === 0}
          aria-label={`Download ${selectedCount} selected files`}
          aria-describedby="selection-count"
        >
          <ArrowDownIcon className="fd__icon" aria-hidden="true" />
          Download Selected
        </button>
      </div>

      <table className="fd__table" aria-label="File list">
        <thead>
          <tr className="fd__header-row">
            <th className="fd__header-cell fd__header-cell--checkbox" aria-label="Select column"></th>
            <th className="fd__header-cell">Name</th>
            <th className="fd__header-cell">Device</th>
            <th className="fd__header-cell">Path</th>
            <th className="fd__header-cell">Status</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => {
            const isAvailable = file.status === 'available';
            const isSelected = selectedFiles.has(index);

            return (
              <tr
                key={index}
                className={`fd__row ${isSelected ? 'fd__row--selected' : ''} ${!isAvailable ? 'fd__row--disabled' : ''}`}
                aria-selected={isSelected}
                onClick={isAvailable ? () => handleFileSelect(index) : undefined}
                style={{ cursor: isAvailable ? 'pointer' : 'not-allowed' }}
              >
                <td className="fd__cell fd__cell--checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleFileSelect(index)}
                    disabled={!isAvailable}
                    aria-label={`Select ${file.name}`}
                    aria-describedby={`file-${index}-info`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="fd__cell" title={file.name}>{file.name}</td>
                <td className="fd__cell" title={file.device}>{file.device}</td>
                <td className="fd__cell" title={file.path}>{file.path}</td>
                <td className="fd__cell">
                  <span
                    className={`fd__status fd__status--${file.status}`}
                    id={`file-${index}-info`}
                    aria-label={`Status: ${file.status}`}
                  >
                    {isAvailable && <span className="fd__dot" aria-hidden="true"></span>}
                    {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};