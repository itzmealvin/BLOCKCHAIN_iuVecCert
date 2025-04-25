# @iuveccert+/issuer (v1.0.0)

> CLI to issue embedded credentials securely by vector commitment.

<a id="readme-top"></a>

<!-- ABOUT THE PROJECT -->

## About The Project

**@iuveccert+/issuer** is a Command-Line Interface (CLI) tool designed to issue
credentials utilizing the vector commitment structure. This tool facilitates the
efficient generation and organization of credentials while integrating smart
contract compatibility with CertCommitment descriptions.

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

## Built with

- [![Deno][Deno]][Deno-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![Express][Express]][Express-url]

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- INSTALLATION -->

## Installation

1. Install [Deno](https://deno.com) to your machine.

   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. Clone the repo:
   ```bash
   git clone --branch @iuveccert+/issuer https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert.git
   cd BLOCKCHAIN_iuVecCert
   ```
3. Change git remote url to avoid accidental pushes to base project:
   ```bash
   git remote set-url origin https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert.git
   git remote -v
   ```
4. Run the program by using the given commands below.
5. **OPTIONAL** To jump to the latest commit of the project:
   ```bash
   git fetch
   git reset --hard @{u}
   ```

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- USAGE -->

## Usage

### Build Vector Commitment Deployment Request (VCDR) file for later deployment and Saved Vector Commitment Data (SVCD) for later embedment

**Command syntax:**

```bash
deno run build [options]
```

Alternatively, you can execute the command with all permissions:

```bash
deno run force-build [options]
```

_Options:_

- `-p, —-permission [file]`: The name of the input PDF permission file (default:
  "issuerPermission.pdf").
- `-c, —-cred <directory>`: The path name of the input original PDF
  credential(s) directory (required). Before processing, the command will locate
  this file from the `credentials` folder.
- `-i, —-index <number>`: The index to slice the PDF credential group(s) to be
  processed. It must be larger than 2.
- `-d, —-description <message>`: The name of the input CertCommitment smart
  contract description (required). It must be in the form `[S{1-3}AY{2425}]`.
- `-f, —-fields [name…]`: The field(s) to be used as ID for each PDF
  credential(s) (default: ["serial"]).
- `-h, —-help`: Displays help information for the command.

_Example usage:_

```bash
deno run force-build -c 5000 -d S1AY2223 -i 100
```

This will build from the first 100 PDF credential grouped by the `serial` field
(credential + appendix(s)) inside `credentials/5000` folder with
`issuerPermission.pdf` permission file check for issuer common name and
description for `Semester 1 Academic
Year 2022-2023`, then saves the output VCDR
file that containing smart contract parameters to the
`requests/1734401217_S1AY2223.vcdr` path and SVCD file to the
`requests/1734401217_S1AY2223.svcd` path.

**NOTICE:** You must ensure the input **field** is presented on the PDF
credential form, otherwise the command will throw field not found error.

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

### Deploy using Vector Commitment Deployment Request (VCDR) file for later embedment

**NOTICE:** You must have a **GUI BROWSER** with an **EVM-compatible wallet
Extension** that matches the address in the permission file in given VCDR to
continue. During the process, ensure that the 4 emojis on the browser match on
the console window for secure connection.

**Command syntax:**

```bash
deno run deploy [options]
```

Or you can forcibly run with all permissions:

```bash
deno run force-deploy [options]
```

_Options:_

- `-v, --vcdr <file>`: Input the Vector Commitment Deployment Request (VCDR)
  file name (required). Before processing, the command will locate this file
  from the `requests` folder.
- `-h, —-help`: Displays help information for the command.

_Example usage:_

```bash
deno run force-deploy -v 1734401217_S1AY2223.vcdr
```

This will use the `requests/1734401217_S1AY2223.vcdr` vector commitment
Deployment Request (VCDR) smart contract parameters and perform address
checking, expose an internal server to transmit between the wallet extension and
the program to receive the smart contract deployment receipt, and append it to
the original `requests/1734401217_S1AY2223.vcdr` Vector Commitment Deployment
Request (VCDR) file.

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

### Embed credentials securely from a Vector Commitment Deployment Response (VCDRe) file and Saved Vector Commitment Data (SVCD)

**Command syntax:**

```bash
deno run embed [options]
```

Alternatively, you can execute the command with all permissions:

```bash
deno run force-embed [options]
```

_Options:_

- `-p, —-permission [file]`: The name of the input PDF permission file (default:
  "issuerPermission.pdf").
- `-v, -—vcdre <file>`: The name of the input vector commitment Deployment
  Response (VCDRe) file name (required). Before processing, the command will
  locate this file from the `requests` folder.
- `-s, —-svcd <file>`: The name of the input saved Secret Verkle Data (SVCD)
  file name (required). Before processing, the command will locate this file
  from the `requests` folder.
- `-o, —-output [directory]`: The path to the output ZIP result directory
  (default: "../../embedded/").
- `-d, --delete`: Delete the VCDRe and SVCD files for security (default: true).
- `-h, —-help`: Displays help information for the command.

_Example usage:_

```bash
deno run force-embed -v 1734401217_S1AY2223.vcdr -s 1734401217_S1AY2223.svcd
```

This will perform checks on the Vector Commitment Deployment Response (VCDRe)
file `/requests/1734401217_S1AY2223.vcdr` together with `issuerPermission.pdf`
permission file, then reload the PDF credential group(s) from the Saved Vector
Commitment Data (SVCD) file `/requests/1734401217_S1AY2223.svcd`, then embed the
information to each PDF credentials and appendix(s), saves the output ZIP file
to the `embedded/embedded_100_0x58b6C0c2BAbBd1c6926B26C5E8e4636d476CEdD4.zip`
and then delete the VCDRe and SVCD files.

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- FEATURES -->

## Features

- [x] **Credential Issuance**: Facilitates the issuance of credentials through
      smart contract descriptions, facilitating seamless integration with
      CertCommitment.
- [x] **Vector Commitment Integration**: Supports vector commitment for constant
      proof size and non-interactive verification process.
- [x] **Batch Processing**: Enables the selective processing of multiple
      credentials using index slicing.
- [x] **Strict Issuer Verification**: Implements stringent verification through
      external PDF permission files.
- [x] **Lightweight and Fast**: Designed for optimal performance and
      scalability.

See the [open issues](https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/issues)
for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are the lifeblood of the open-source community, fostering
learning, inspiration, and innovation. Any contributions you make are **greatly
appreciated**.

### How to Contribute

Here are the steps to contribute:

**1. Fork the Project**: Initiate the process of forking the repository to your
GitHub account.

**2. Create a Feature Branch**: Generate a descriptive name for your branch, for
instance, `@iuveccert+/issuer-your-feature`.

```bash
git checkout -b @iuveccert+/issuer-your-feature
```

**3. Develop your Contribution**

**4. Final Check**: Execute the following command to verify the absence of any
errors:

```bash
deno run check
```

**5. Commit Your Changes**: Compose a concise commit message that encapsulates
the essence of your modifications:

```bash
git commit -m "add: New feature"
```

**6. Push to Your Branch**: Merge your branch into your forked repository:

```bash
git push origin @iuveccert+/issuer-your-feature
```

**7. Submit a Pull Request**:

- Open a pull request to the main repository.
- Clearly articulate the nature of your addition, its purpose, and provide any
  pertinent usage instructions (installed packages, etc…).

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

### Additional Guidelines

- Please ensure that your contributions are thoroughly documented.
- Feel free to engage in discussions within the **Discussions** tab prior to
  commencing substantial work.

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

## License

Distributed under the GPLv3 License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[Deno]: https://img.shields.io/badge/deno-000000?style=for-the-badge&logo=deno&logoColor=white
[Deno-url]: https://deno.com/
[TypeScript]: https://img.shields.io/badge/typescript-000000?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Express]: https://img.shields.io/badge/express.js-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
