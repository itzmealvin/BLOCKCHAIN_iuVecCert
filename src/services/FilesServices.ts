import {hashAsBigInt, HashType} from "bigint-hash";
import JSZip from "jszip";
import {PDFDocument} from "pdf-lib";
import {Configs} from "./ConfigsServices";
import {Proofs} from "./proofService";

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

    async hasKeywordField(files: FileList): Promise<boolean> {
        return new Promise(async (resolve) => {
            try {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const metadata = await this.getMetaObj(file);
                    if (metadata) {
                        break;
                    }
                }
                resolve(false);
            } catch (error) {
                resolve(true)
            }
        });
    }

    async getMetaObj(files: File): Promise<MetaDataObj> {
        return new Promise(async (resolve, reject) => {
            try {
                const bufferContent = await files.arrayBuffer();
                const pdfDoc = await PDFDocument.load(bufferContent);
                const fields = pdfDoc.getKeywords();
                if (fields) {
                    const regex = /(0x[a-fA-F0-9]{40})|(\{[^}]+})/g;
                    const matches = fields.match(regex);
                    if (matches) {
                        const [address, object2, object3] = matches;
                        resolve({commitAddress: address, config: JSON.parse(object2), files: [JSON.parse(object3)]});
                    } else {
                        reject(
                            new Error(
                                "Embedded certificate is missing some required field(s)",
                            ),
                        );
                    }
                } else {
                    reject(new Error("This is not an embedded certificate"));
                }
            } catch (error) {
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

    async embedAndZip(
        filesDetails: FileDetails[],
        metadataObjects: MetaDataObj,
    ): Promise<Uint8Array> {
        const zip = new JSZip();
        const batchSize = 200;
        let batchStart = 0;
        const processBatch = async () => {
            const batch = filesDetails.slice(batchStart, batchStart + batchSize);
            const promises = batch.map(async (fileDetail, index) => {
                const {account, ...filteredConfig} = metadataObjects.config;
                const pdfDoc = await PDFDocument.load(fileDetail.fileBuffer);
                const keywords = [
                    metadataObjects.commitAddress,
                    JSON.stringify(filteredConfig),
                    JSON.stringify(metadataObjects.files[batchStart + index]),
                ];
                pdfDoc.setKeywords(keywords);
                const pdfBytes = await pdfDoc.save();
                zip.file(`${fileDetail.fileName}_embedded.pdf`, pdfBytes);
            });
            await Promise.all(promises);
            batchStart += batchSize;
            if (batchStart < filesDetails.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
                await processBatch();
            }
        };
        await processBatch();
        return zip.generateAsync({type: "uint8array"});
    }
}

export default new FilesServices();
