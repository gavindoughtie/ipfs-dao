import { PushPathResult } from '@textile/buckets';
import { PrivateKey } from '@textile/crypto';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { encryptAndInsertFile, FileCallbackFn } from '../helpers/buckets';
import { encrypt } from '../helpers/crypto';
import styles from './dropzone.module.css';

export interface DropzoneProps {fileCallback: FileCallbackFn };

export function Dropzone({ fileCallback }: DropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    fileCallback(acceptedFiles);
  }, [fileCallback]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className={styles.dropzone} { ...getRootProps() }>
      <input { ...getInputProps() } />
      <p>Drag and drop a file here, or click to select a file</p>
    </div>
  )
}

export default Dropzone;
