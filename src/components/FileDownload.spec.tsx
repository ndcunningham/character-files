import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileDownload } from './FileDownload';
import type { FileItem } from '../types/file-item';

const mockFiles: FileItem[] = [
  {
    name: 'test1.exe',
    device: 'Device1',
    path: '\\Device\\test1.exe',
    status: 'available'
  },
  {
    name: 'test2.dll',
    device: 'Device2',
    path: '\\Device\\test2.dll',
    status: 'available'
  },
  {
    name: 'test3.sys',
    device: 'Device3',
    path: '\\Device\\test3.sys',
    status: 'scheduled'
  }
];

describe('FileDownload Component', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {
      // Mock implementation for testing
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders component and displays file information correctly', () => {
    render(<FileDownload files={mockFiles} />);

    expect(screen.getByText('None Selected')).toBeInTheDocument();
    expect(screen.getByText('test1.exe')).toBeInTheDocument();
    expect(screen.getAllByText('Available').length).toBeGreaterThan(0);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download.*selected/i })).toBeDisabled();
  });

  it('allows selecting available files and prevents selecting scheduled files', () => {
    render(<FileDownload files={mockFiles} />);

    const availableCheckbox = screen.getByLabelText('Select test1.exe');
    const scheduledCheckbox = screen.getByLabelText('Select test3.sys');

    expect(scheduledCheckbox).toBeDisabled();

    fireEvent.click(availableCheckbox);
    expect(availableCheckbox).toBeChecked();
    expect(screen.getByText('Selected 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download.*selected/i })).not.toBeDisabled();
  });

  it('select-all checkbox works with three states (none/some/all)', () => {
    render(<FileDownload files={mockFiles} />);

    const selectAllCheckbox = screen.getByLabelText('Select all available files');
    const checkbox1 = screen.getByLabelText('Select test1.exe');
    const checkbox2 = screen.getByLabelText('Select test2.dll');

    // Initial state - none selected
    expect(selectAllCheckbox).not.toBeChecked();

    // Select one file - indeterminate state
    fireEvent.click(checkbox1);
    expect(selectAllCheckbox).toHaveProperty('indeterminate', true);

    // Select all available files via select-all
    fireEvent.click(selectAllCheckbox);
    expect(screen.getByText('Selected 2')).toBeInTheDocument();
    expect(checkbox1).toBeChecked();
    expect(checkbox2).toBeChecked();
    expect(selectAllCheckbox).toBeChecked();

    // Deselect all via select-all
    fireEvent.click(selectAllCheckbox);
    expect(screen.getByText('None Selected')).toBeInTheDocument();
  });

  it('download functionality shows alert with selected file details', () => {
    const alertSpy = vi.spyOn(window, 'alert');
    render(<FileDownload files={mockFiles} />);

    const checkbox1 = screen.getByLabelText('Select test1.exe');
    const checkbox2 = screen.getByLabelText('Select test2.dll');
    const downloadButton = screen.getByRole('button', { name: /download.*selected/i });

    // Select multiple files and download
    fireEvent.click(checkbox1);
    fireEvent.click(checkbox2);
    fireEvent.click(downloadButton);

    const expectedAlert = 'Device: Device1\nPath: \\Device\\test1.exe\n\nDevice: Device2\nPath: \\Device\\test2.dll';
    expect(alertSpy).toHaveBeenCalledWith(expectedAlert);
  });
});