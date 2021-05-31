import { PrivateKey } from '@textile/crypto';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { encrypt } from '../helpers/crypto';
import styles from './dropzone.module.css';

export interface DropzoneProps {privateKey: PrivateKey, uploadCallback: (results: Uint8Array) => void};

export function Dropzone({ privateKey, uploadCallback }: DropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = async () => {
        const fileContents = reader.result;
        if (fileContents && typeof fileContents !== 'string') {
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
