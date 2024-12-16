# @iuveccert

## The all-in-one tooling for scalable certificate issuance using Verkle Tree.

<p align="center">
<a href="https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert/issues/new?labels=bug&template=bug-report---.md"         target="_blank"
          rel="noopener noreferrer">Report Bug</a>
- <a href="https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert/issues/new?labels=enhancement&template=feature-request---.md"         target="_blank"
          rel="noopener noreferrer">Request Feature</a>
</p>

<a id="readme-top" ></a>

### Built With

#### CLIENT

- [![React][React.js]][React-url]
- [![nvm][nvm]][nvm-url]
- [![pnpm][pnpm]][pnpm-url]
- [![Vite][Vite]][Vite-url]
- [![ChakraUI][ChakraUI]][ChakraUI-url]
- [![TypeScript][TypeScript]][TypeScript-url]

#### GENERATOR + ISSUER

- [![Deno][Deno]][Deno-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![Express][Express]][Express-url]

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- INSTALLATION -->

### Installation

1. Install [Deno](https://deno.com) and [Node.js](https://nodejs.org/en) via
   [nvm](https://github.com/nvm-sh/nvm) to your machine.

   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   nvm install 20
   ```

2. Clone the repo:
   ```bash
   git clone https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert.git
   cd BLOCKCHAIN_iuVerCert
   ```
3. Change git remote url to avoid accidental pushes to base project:
   ```bash
   git remote set-url origin https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert.git
   git remote -v
   ```
4. **OPTIONAL** To jump to the latest commit of the project:
   ```bash
   git fetch
   git reset --hard @{u}
   ```

<!-- FEATURES -->

### Features

- [x] **All-in-one tooling for certificate issuance**: A unified platform for
      generating, issuing, and verifying certificates, streamlining the process
      and reducing manual effort.
- [x] **Certificate validator**: Ensures the authenticity and integrity of
      merged certificates, enhancing trust and reducing fraud risks.
- [x] **Merge certificates in seconds**: Seamlessly generates multiple
      certificates from a single template document, saving time and ensuring
      professional presentation.
- [x] **Verkle Tree**: Optimizes certificate proof storage and computational
      time, enhancing scalability and performance.
- [x] **Embedded receipt**: Integrates proof certificates directly into a single
      PDF file for convenient sharing and storage.
- [x] **Revocation**: Enables revoking invalid certificates, ensuring
      reliability and control over credentials.
- [x] **Security from blockchain**: Secures certificates with blockchain
      technology for tamper-proof and transparent validation.
- [x] **Selective disclosure**: Allows selective sharing of certificate details,
      preserving privacy and control.
- [x] **Scientifically proven**: The underlying technology is validated by
      prestigious scientific research and conferences.
- [x] **Non-interactive verification**: Supports verification without
      interaction with the issuer, simplifying the process for verifiers.
- [x] **Zero-cost verification**: Enables certificate verification without
      additional costs through efficient cryptographic techniques.
- [x] **Scalable design**: Ensures smooth performance even with a growing number
      of users and certificates.

See the [open issues](https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert/issues)
for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- CONTRIBUTING -->

### Contributing

Contributions are what make the open source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

**For more details on how to contribute, please refer to the `README.md` of each
respective IUVecCert components**

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- LICENSE -->

### License

Distributed under the GPLv3 License. See `LICENSE` page for more information.

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

### Acknowledgments

- [Dr. Tran Thanh Tung](mailto:tttung@hcmiu.edu.vn) for his support
- [Wei Jie Koh's KZG library](https://github.com/weijiekoh/libkzg) for the
  ground-up tool.

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- PUBLISHED PAPER -->

### Published Paper

- [FDSE 2024](https://link.springer.com/chapter/10.1007/978-981-96-0434-0_8)
  > Nguyen, QD., Tran, TT. (2024). IU-VecCert: A Scalable Credentials Issuance
  > Protocol Using Non-interactive Vector Commitment Scheme. In: Dang, T.K.,
  > Küng, J., Chung, T.M. (eds) Future Data and Security Engineering. Big Data,
  > Security and Privacy, Smart City and Industry 4.0 Applications. FDSE 2024.
  > Communications in Computer and Information Science, vol 2309. Springer,
  > Singapore. https://doi.org/10.1007/978-981-96-0434-0_8

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/itzmealvin/BLOCKCHAIN_iuVerCert.svg?style=for-the-badge
[contributors-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/itzmealvin/BLOCKCHAIN_iuVerCert.svg?style=for-the-badge
[forks-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert/network/members
[stars-shield]: https://img.shields.io/github/stars/itzmealvin/BLOCKCHAIN_iuVerCert.svg?style=for-the-badge
[stars-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert/stargazers
[issues-shield]: https://img.shields.io/github/issues/itzmealvin/BLOCKCHAIN_iuVerCert.svg?style=for-the-badge
[issues-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert/issues
[license-shield]: https://img.shields.io/github/license/itzmealvin/BLOCKCHAIN_iuVerCert.svg?style=for-the-badge
[license-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVerCert/blob/master/LICENSE.txt
[product-screenshot]: images/mainpage.png
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
[Deno]: https://img.shields.io/badge/deno-000000?style=for-the-badge&logo=deno&logoColor=white
[Deno-url]: https://deno.com/
[TypeScript]: https://img.shields.io/badge/typescript-000000?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Express]: https://img.shields.io/badge/express.js-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
