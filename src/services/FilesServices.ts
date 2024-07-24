import { hashAsBigInt, HashType } from "bigint-hash";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { Configs } from "./ConfigsServices";
import { Proofs } from "./proofService";

export interface Elliptic {
  r: string;
  s: string;
  recoveryParam: string;
}

export interface FileProps {
  fileIndex: number;
  fileHash: string;
  fileProof: Elliptic;
}

export interface FileDetails {
  fileName: string;
  fileBuffer: ArrayBuffer | Uint8Array;
}

export interface MetaDataObj extends Proofs {
  commitAddress: string;
  commitHash: string;
  config: Configs;
}

class FilesServices {
  async hashFiles(files: FileList): Promise<FileProps[]> {
    const results: FileProps[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const bufferContent = await files[i].arrayBuffer();
        const hashContent = hashAsBigInt(
          HashType.KECCAK224,
          Buffer.from(bufferContent),
        ).toString();
        results.push({
          fileIndex: i,
          fileHash: hashContent,
          fileProof: { r: "", s: "", recoveryParam: "" },
        });
      } catch (error) {
        console.error("Error processing file(s):", error);
      }
    }
    return results;
  }

  async getMetaObj(files: File): Promise<MetaDataObj> {
    return new Promise(async (resolve, reject) => {
      try {
        const bufferContent = await files.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bufferContent);
        const commitHash = pdfDoc.getTitle();
        const commitAddress = pdfDoc.getAuthor();
        const props = pdfDoc.getSubject();
        const config = pdfDoc.getCreator();
        console.log(config);
        if (commitHash && commitAddress && props && config) {
          const parsedProps = JSON.parse(props);
          const parsedConfig = JSON.parse(config);
          const metaObj: MetaDataObj = {
            commitAddress: commitAddress,
            commitHash: commitHash,
            files: parsedProps,
            config: parsedConfig,
          };
          console.log(metaObj);
          resolve(metaObj);
        } else {
          reject(
            new Error(
              "Embedded certificate is missing some required field(s).",
            ),
          );
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  async generateFilesProps(files: FileList): Promise<FileDetails[]> {
    const results: FileDetails[] = [];
    for (const file of files) {
      const bufferContent = await file.arrayBuffer();
      results.push({
        fileName: file.name.replace(".pdf", ""),
        fileBuffer: bufferContent,
      });
    }
    return results;
  }

  objectToUint8Array<T>(object: T): Uint8Array {
    const stringContent = JSON.stringify(object);
    const encoder = new TextEncoder();
    return encoder.encode(stringContent);
  }

  async embedAndZip(
    filesDetails: FileDetails[],
    metadataObjects: MetaDataObj,
  ): Promise<Uint8Array> {
    const zip = new JSZip();
    for (let i = 0; i < filesDetails.length; i++) {
      const pdfDoc = await PDFDocument.load(filesDetails[i].fileBuffer);
      pdfDoc.setTitle(metadataObjects.commitHash);
      pdfDoc.setAuthor(metadataObjects.commitAddress);
      pdfDoc.setSubject(JSON.stringify(metadataObjects.files[i]));
      pdfDoc.setCreator(JSON.stringify(metadataObjects.config));
      zip.file(`${filesDetails[i].fileName}_embedded.pdf`, await pdfDoc.save());
    }
    return zip.generateAsync({ type: "uint8array" });
  }
}

export default new FilesServices();
