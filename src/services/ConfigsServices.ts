import forge from "node-forge";
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

  extractCertChain(certChain: string): forge.pki.Certificate {
    return forge.pki.certificateFromPem(certChain);
  }

  checkValidityDate(cert: forge.pki.Certificate): boolean {
    const now = new Date();
    const notBefore = new Date(cert.validity.notBefore);
    const notAfter = new Date(cert.validity.notAfter);
    return now >= notBefore && now <= notAfter;
  }

  getField(cert: forge.pki.Certificate, fieldName: "CN" | "O"): string {
    return cert.subject?.getField(fieldName)?.value;
  }
}

export default new ConfigsServices();
