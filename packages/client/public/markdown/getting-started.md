# @iuveccert

> The all-in-one tooling for scalable credentials issuance using Vector
> Commitment.

<p align="center">
<a href="https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/issues/new?labels=bug&template=bug-report---.md"         target="_blank"
          rel="noopener noreferrer">Report Bug</a>
· <a href="https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/issues/new?labels=enhancement&template=feature-request---.md"         target="_blank"
          rel="noopener noreferrer">Request Feature</a>
</p>

<a id="readme-top" ></a>

<!-- ABOUT THE PROJECT -->

## About The Project

### Verified smart contract address:

[CONSTANTS](https://sepolia.etherscan.io/address/0xab8591067f6f97297ba9151fc21a0b2384e0e06e)
·
[PAIRING](https://sepolia.etherscan.io/address/0x1E2577574d12DAb53c5a7432d191AdA98e9F5F6c)
·[VERIFIER](https://sepolia.etherscan.io/address/0xF98cbFAf6C804cD3928d4B575C050B1E72314c3D)

### CLIENT

- [![React][React.js]][React-url]
- [![nvm][nvm]][nvm-url]
- [![pnpm][pnpm]][pnpm-url]
- [![Vite][Vite]][Vite-url]
- [![ChakraUI][ChakraUI]][ChakraUI-url]
- [![TypeScript][TypeScript]][TypeScript-url]

### GENERATOR + ISSUER

- [![Deno][Deno]][Deno-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![Express][Express]][Express-url]

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

**For more details on how to installation/usage/examples, please refer to the
`README.md` of each respective IUVecCert components**

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- INSTALLATION -->

## Installation

1. Install [Deno](https://deno.com) and [Node.js](https://nodejs.org/en) via
   [nvm](https://github.com/nvm-sh/nvm) to your machine.

   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   nvm install 20
   ```

2. Clone the repo:
   ```bash
   git clone https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert.git
   cd BLOCKCHAIN_iuVecCert
   ```
3. Change git remote url to avoid accidental pushes to base project:
   ```bash
   git remote set-url origin https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert.git
   git remote -v
   ```
4. **OPTIONAL** To jump to the latest commit of the project:
   ```bash
   git fetch
   git reset --hard @{u}
   ```

<!-- FEATURES -->

## Features

- [x] **All-in-one tooling for credentials issuance**: A unified platform for
      generating, issuing, and verifying credentials, streamlining the process
      and reducing manual effort.
- [x] **Constant size proof**: IUVecCert delivers constant-size proofs
      regardless of the number of credentials issued, ensuring minimal overhead
      for issuers and seamless verification for users. This approach enhances
      scalability and performance
- [x] **Revocation**: Enables revoking invalid credentials, ensuring reliability
      and control over credentials.
- [x] **Vector Commitment**: IUVecCert leverages Verkle Tree-based vector
      commitments to optimize proof storage and computational efficiency. This
      ensures secure, fast, and scalable issuance and verification of
      credentials.
- [x] **Embedded receipt**: Integrates proof credentials directly into a single
      PDF file for convenient sharing and storage.
- [x] **Security from blockchain**: Secures credentials with blockchain
      technology for tamper-proof and transparent validation.
- [x] **Scientifically proven**: The underlying technology is validated by
      prestigious scientific research and conferences.
- [x] **Non-interactive verification**: Supports verification without
      interaction with the issuer, simplifying the process for verifiers.
- [x] **Zero-cost verification**: Enables credential verification without
      additional costs through efficient cryptographic techniques.
- [x] **Scalable design**: Ensures smooth performance even with a growing number
      of users and credentials.
- [x] **Easy to use**: IUVecCert simplifies the credentials issuance process,
      ensuring that issuers and users can interact seamlessly without requiring
      extensive technical knowledge. The intuitive design guarantees ease of use
      for all end users.
- [ ] **Selective disclosure**: Allows selective sharing of credential details,
      preserving privacy and control.

See the [open issues](https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/issues)
for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

**For more details on how to contribute, please refer to the `README.md` of each
respective IUVecCert components**

<p align="right">(<a href="#readme-top" target="_blank" rel="noopener noreferrer">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the GPLv3 License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Quang-Dieu Nguyen (@itzmealvin) -
[@itzmeclone](https://twitter.com/@itzmeclone) - nqdieu@proton.me

Project Link:
[https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert](https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert)

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Dr. Tran Thanh Tung](mailto:tttung@hcmiu.edu.vn) for his support
- [Wei Jie Koh's KZG library](https://github.com/weijiekoh/libkzg) for the
  ground-up tool.

<p align="right">(<a href="#readme-top"         target="_blank"
          rel="noopener noreferrer">back to top</a>)</p>

<!-- PUBLISHED PAPER -->

## Published Paper

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

[contributors-shield]: https://img.shields.io/github/contributors/itzmealvin/BLOCKCHAIN_iuVecCert.svg?style=for-the-badge
[contributors-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/itzmealvin/BLOCKCHAIN_iuVecCert.svg?style=for-the-badge
[forks-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/network/members
[stars-shield]: https://img.shields.io/github/stars/itzmealvin/BLOCKCHAIN_iuVecCert.svg?style=for-the-badge
[stars-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/stargazers
[issues-shield]: https://img.shields.io/github/issues/itzmealvin/BLOCKCHAIN_iuVecCert.svg?style=for-the-badge
[issues-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/issues
[license-shield]: https://img.shields.io/github/license/itzmealvin/BLOCKCHAIN_iuVecCert.svg?style=for-the-badge
[license-url]: https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/blob/master/LICENSE.txt
[product-screenshot]: images/mainpage.png
[React.js]: https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=white
[React-url]: https://reactjs.org/
[Vite]: https://img.shields.io/badge/Vite-000000?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[ChakraUI]: https://img.shields.io/badge/chakraui-000000?style=for-the-badge&logo=chakraui&logoColor=white
[ChakraUI-url]: https://www.chakra-ui.com/
[Deno]: https://img.shields.io/badge/deno-000000?style=for-the-badge&logo=deno&logoColor=white
[Deno-url]: https://deno.com/
[TypeScript]: https://img.shields.io/badge/typescript-000000?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Express]: https://img.shields.io/badge/express.js-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[nvm]: https://img.shields.io/badge/nvm-000000?style=for-the-badge&logo=nvm&logoColor=white
[nvm-url]: https://github.com/nvm-sh/nvm
[pnpm]: https://img.shields.io/badge/pnpm-000000?style=for-the-badge&logo=pnpm&logoColor=white
[pnpm-url]: https://pnpm.io/
