import styles from './dropzone.module.css';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { encrypt } from '../helpers/crypto';
import { PrivateKey } from '@textile/crypto';

/* eslint-disable-next-line */
export interface DropzoneProps {privateKey: PrivateKey, uploadCallback: (results: Uint8Array) => void};

export function Dropzone({ privateKey, uploadCallback }: DropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = async () => {
        /* eslint-disable-next-line */
        const fileContents: ArrayBuffer | null = reader.result as any;
        if (fileContents) {
          const encryptResults = await encrypt(fileContents, privateKey);
          uploadCallback(encryptResults);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, [privateKey, uploadCallback]);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className={styles.dropzone} { ...getRootProps() }>
      <input { ...getInputProps() } />
      <p>Drag and drop a file here, or click to select a file</p>
    </div>
  )
}

export default Dropzone;
