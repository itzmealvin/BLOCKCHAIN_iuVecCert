# @iuveccert/client (v1.0.0)

## The client website for IUVecCert scalable issuance protocol, for verify,revoke and selective disclosure.

<a id="readme-top"></a>

<!-- ABOUT THE PROJECT -->

### About The Project

**@iuveccert/client** is the client for IUVecCert protocol. It enables
organizations to verify, revoke, and disclose certificates with precision and
scalability, all at zero-cost with an intuitive UI for the end users.

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

### Built with

- [![React][React.js]][React-url]
- [![nvm][nvm]][nvm-url]
- [![pnpm][pnpm]][pnpm-url]
- [![Vite][Vite]][Vite-url]
- [![ChakraUI][ChakraUI]][ChakraUI-url]
- [![TypeScript][TypeScript]][TypeScript-url]

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- INSTALLATION -->

### Installation

1. Install [NodeJS](https://nodejs.org/en) via
   [nvm](https://github.com/nvm-sh/nvm) to your machine.

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   nvm install 20
   ```

2. Clone the repo:
   ```bash
   git clone --branch @iuveccert/client https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert.git
   cd BLOCKCHAIN_iuVerCert
   ```
3. Change git remote url to avoid accidental pushes to base project:
   ```bash
   git remote set-url origin https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert.git
   git remote -v
   ```
4. Run the program by using the given commands below. Vite should expose a
   localhost web server for development at
   [http://localhost:5173/](http://localhost:5173/)

   ```bash
   corepack use pnpm@latest
   pnpm i
   pnpm run dev
   ```

5. **OPTIONAL** To jump to the latest commit of the project:
   ```bash
   git fetch
   git reset --hard @{u}
   ```

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- USAGE -->

### Usage

The client website is publicly accessible on
[https://iuveccert.vercel.app](https://iuveccert.vercel.com)

<!-- FEATURES -->

### Features

- [x] **Easy UX/UI**: Provides an intuitive and user-friendly interface,
      ensuring a seamless experience for end users while simplifying
      interactions with the platform.
- [x] **Revocation**: Enables revoking invalid certificates, ensuring
      reliability and control over credentials.
- [x] **Security from blockchain**: Secures certificates with blockchain
      technology for tamper-proof and transparent validation.
- [x] **Selective disclosure**: Allows selective sharing of certificate details,
      preserving privacy and control.
- [x] **Non-interactive verification**: Supports verification without
      interaction with the issuer, simplifying the process for verifiers.
- [x] **Zero-cost verification**: Enables certificate verification without
      additional costs through efficient cryptographic techniques.
- [x] **Scalable design**: Ensures smooth performance even with a growing number
      of users and certificates.

See the [open issues](https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert/issues)
for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- CONTRIBUTING -->

### Contributing

Contributions are the lifeblood of the open-source community, fostering
learning, inspiration, and innovation. Any contributions you make are **greatly
appreciated**.

#### How to Contribute

Here are the steps to contribute:

**1. Fork the Project**: Initiate the process of forking the repository to your
GitHub account.

**2. Create a Feature Branch**: Generate a descriptive name for your branch, for
instance, `@iuveccert/client-your-feature`

```bash
git checkout -b @iuveccert/client-your-feature
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
git push origin @iuveccert/client-your-feature
```

**7. Submit a Pull Request**:

- Open a pull request to the main repository.
- Clearly articulate the nature of your addition, its purpose, and provide any
  pertinent usage instructions (installed packages, etc…).

  <p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

#### Additional Guidelines

- Please ensure that your contributions are thoroughly documented.
- Feel free to engage in discussions within the **Discussions** tab prior to
  commencing substantial work.

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

### License

Distributed under the GPLv3 License. See `LICENSE` page for more information.

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[TypeScript]: https://img.shields.io/badge/typescript-000000?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[React.js]: https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=white
[React-url]: https://reactjs.org/
[Vite]: https://img.shields.io/badge/Vite-000000?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[ChakraUI]: https://img.shields.io/badge/chakraui-000000?style=for-the-badge&logo=chakraui&logoColor=white
[ChakraUI-url]: https://www.chakra-ui.com/
[nvm]: https://img.shields.io/badge/nvm-000000?style=for-the-badge&logo=nvm&logoColor=white
[nvm-url]: https://github.com/nvm-sh/nvm
[pnpm]: https://img.shields.io/badge/pnpm-000000?style=for-the-badge&logo=pnpm&logoColor=white
[pnpm-url]: https://pnpm.io/
