# ui-security-incident

This software is distributed under the terms of the Apache License, Version 2.0. See the source [LICENSE](https://www.apache.org/licenses/LICENSE-2.0.txt) for more information.

## Introduction

The Track UI Module (`ui-security-incident`) is a FOLIO Stripes UI Module for managing and tracking security incidents in libraries. It enables staff to record, organize, and follow up on incidents such as disturbances, thefts, or trespass events. The module provides a centralized, searchable, and updatable record system, with robust configuration and document generation features. See the administrator-documentation folder for precise breakdowns, features, and use of the application. 

## Installation & local set up

1. **Clone the repository:**
 ```sh
 git clone <your-fork-or-repo-url>
 cd ui-secinci
 ```
2. **Install dependencies:**
 ```sh
 yarn install
 ```
3. **Install Stripes CLI if it is not already installed**
 ```sh
 yarn global add @folio/stripes-cli
 ```

## Run locally

Start the app in development mode:

```sh
stripes serve
```

## Tests

For the application modules, tests are written using Jest and are colocated with the relevant source files.
If you modify or add code, please update and run the corresponding test(s) for that file.


## Contributing

If you plan to modify the code or submit pull requests, please read [CONTRIBUTING.md](CONTRIBUTING.md) before starting.


## Additional Information

- **FOLIO Documentation:** [https://dev.folio.org/](https://dev.folio.org/)
- **Admin Guide:** See `administrator-documentation/using-the-application.md` for detailed usage and admin instructions.

---

## Questions and support

For general questions about the UI Track project, please open an issue in this repository.
