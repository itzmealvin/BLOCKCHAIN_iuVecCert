import {md, pki, util} from "node-forge";

export interface Configs {
    account: string;
    signature: string;
    certChain: string;
}

class ConfigsServices {
    async readConfigs(ConfigsFile: File): Promise<Configs> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const configs = JSON.parse(event.target?.result as string);
                    if (
                        configs.ethereumAccount &&
                        configs.ethereumAccountSignature &&
                        configs.issuerCertificateChain
                    ) {
                        const config: Configs = {
                            account: configs.ethereumAccount,
                            signature: configs.ethereumAccountSignature,
                            certChain: configs.issuerCertificateChain,
                        };
                        resolve(config);
                    } else {
                        reject(new Error("Config file is missing some required field(s)."));
                    }
                } catch (error) {
                    console.error("Error reading config file:", error);
                    reject(error);
                }
            };
            reader.onerror = (error) => {
                console.error("Error reading config file:", error);
                reject(error);
            };
            reader.readAsText(ConfigsFile);
        });
    }

    extractCertChain(certChain: string): pki.Certificate {
        return pki.certificateFromPem(certChain);
    }

    // checkValidityDate(cert: forge.pki.Certificate): boolean {
    //   const now = new Date();
    //   const notBefore = new Date(cert.validity.notBefore);
    //   const notAfter = new Date(cert.validity.notAfter);
    //   return now >= notBefore && now <= notAfter;
    // }

    getField(cert: pki.Certificate, fieldName: "CN" | "O"): string {
        return cert.subject?.getField(fieldName)?.value;
    }

    splitCertificates(pemString: string): string[] {
        return pemString
            .split(/(?=-----BEGIN CERTIFICATE-----)/)
            .map(cert => cert.trim())
            .filter(cert => cert.includes('-----BEGIN CERTIFICATE-----') && cert.includes('-----END CERTIFICATE-----'));
    }

    verifyX509Chain(
        certificateChain: string[],
    ): boolean {
        try {
            const rootCACertificate = pki.certificateFromPem(certificateChain[1]);
            const endEntityCertificate = pki.certificateFromPem(certificateChain[0]);
            return rootCACertificate.verify(endEntityCertificate);
            // const caStore = forge.pki.createCaStore([rootCACertificate]);
            // try {
            //     return forge.pki.verifyCertificateChain(caStore, [endEntityCertificate]);
            // } catch (error) {
            //     console.error('Verification failed:', error);
            //     return false;
            // }
        } catch (error) {
            console.error('Verification failed:', error);
            return false;
        }
    }

    verifySignature(msg: string, sgnt: string, endEntityCert: string): boolean {
        const pbKeyPem = pki.publicKeyToPem(pki.certificateFromPem(endEntityCert).publicKey);
        const pbKey = pki.publicKeyFromPem(pbKeyPem);
        let msgMd = md.sha256.create();
        msgMd.update(msg, 'utf8');
        return pbKey.verify(msgMd.digest().bytes(),
            util.decode64(sgnt));
    }
}

export default new ConfigsServices();
