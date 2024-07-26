import { hashAsBigInt, HashType } from "bigint-hash";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { Configs } from "./ConfigsServices";
import { Proofs } from "./proofService";

export interface FileProps {
  fileIndex: number;
  fileHash: string;
  fileProof: string[];
}

export interface FileDetails {
  fileName: string;
  fileBuffer: ArrayBuffer | Uint8Array;
}

export interface MetaDataObj extends Proofs {
  commitAddress: string;
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
          fileProof: [],
        });
      } catch (error) {
        console.error("Error processing file(s):", error);
      }
    }
    return results;
  }

  // async getMetaObj(files: File): Promise<MetaDataObj> {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const bufferContent = await files.arrayBuffer();
  //       const pdfDoc = await PDFDocument.load(bufferContent);
  //       const fields = pdfDoc.getKeywords();
  //       console.log(config);
  //       if (commitHash && commitAddress && props && config) {
  //         const parsedProps = JSON.parse(props);
  //         const parsedConfig = JSON.parse(config);
  //         const metaObj: MetaDataObj = {
  //           commitAddress: commitAddress,
  //           files: parsedProps,
  //           config: parsedConfig,
  //         };
  //         console.log(metaObj);
  //         resolve(metaObj);
  //       } else {
  //         reject(
  //           new Error(
  //             "Embedded certificate is missing some required field(s).",
  //           ),
  //         );
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       reject(error);
  //     }
  //   });
  // }

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
    const promises = filesDetails.map(async (fileDetail, index) => {
      const pdfDoc = await PDFDocument.load(fileDetail.fileBuffer);
      const keywords = [
        metadataObjects.commitAddress,
        JSON.stringify(metadataObjects.files[index]),
        JSON.stringify(metadataObjects.config),
      ];
      pdfDoc.setKeywords(keywords);
      const pdfBytes = await pdfDoc.save();
      zip.file(`${fileDetail.fileName}_embedded.pdf`, pdfBytes);
    });

    await Promise.all(promises);

    return zip.generateAsync({ type: "uint8array" });
  }
}

export default new FilesServices();
