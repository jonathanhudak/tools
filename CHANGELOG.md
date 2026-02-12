# [1.19.0](https://github.com/jonathanhudak/tools/compare/v1.18.0...v1.19.0) (2026-02-12)


### Bug Fixes

* align RecurringPaymentSummary mapping with type and add chord-scale nav link ([#68](https://github.com/jonathanhudak/tools/issues/68)) ([e833572](https://github.com/jonathanhudak/tools/commit/e83357282d0a0876475a030314d2d94c15791b05))
* **local-finance-ui:** address code review findings across Phase 3 ([f5ef80d](https://github.com/jonathanhudak/tools/commit/f5ef80d5d38db502d2597867b56dea63dc91f865))
* **local-finance-ui:** wire toast notifications into mutation operations ([cab51aa](https://github.com/jonathanhudak/tools/commit/cab51aa1d3f5615abd1c2ddd8dafd81b22c9095c))


### Features

* **local-finance-ui:** Electron + React finance dashboard (Phases 1-2) ([9f4dfc6](https://github.com/jonathanhudak/tools/commit/9f4dfc68723270e1e02290b64e93f474a78345ad))
* **local-finance-ui:** Phase 3 — transaction editing, recurring payments, dark mode, account detail ([6ebbe7e](https://github.com/jonathanhudak/tools/commit/6ebbe7e712bcf84ea43eee3433a9b1e6a67e07de))
* **local-finance-ui:** Phase 4 — CSV import wizard, categorization rules, insights dashboard ([b38c411](https://github.com/jonathanhudak/tools/commit/b38c4118abd5b80c48c9ef6430c594b42310681b))

# [1.18.0](https://github.com/jonathanhudak/tools/compare/v1.17.0...v1.18.0) (2026-02-07)


### Features

* enable experimental agent teams in Claude Code settings ([#67](https://github.com/jonathanhudak/tools/issues/67)) ([1069dab](https://github.com/jonathanhudak/tools/commit/1069dabe540ece07cccf608c37ec637bfb92a132))

# [1.17.0](https://github.com/jonathanhudak/tools/compare/v1.16.0...v1.17.0) (2026-02-06)


### Bug Fixes

* **puzzle-games:** PWA files deployment and CommonJS icon script ([#66](https://github.com/jonathanhudak/tools/issues/66)) ([9b5674c](https://github.com/jonathanhudak/tools/commit/9b5674c53632e2323548978fee3246fe93af4ccd))
* rename generate-icons.js to .cjs for CommonJS compatibility ([#65](https://github.com/jonathanhudak/tools/issues/65)) ([495e9f5](https://github.com/jonathanhudak/tools/commit/495e9f502175a292827e5809b34576dafe89889b))


### Features

* **gap-scanner:** add Phase 1 CLI tool with Finnhub API ([#63](https://github.com/jonathanhudak/tools/issues/63)) ([c1f7c1c](https://github.com/jonathanhudak/tools/commit/c1f7c1cdd1aa838489fb7a71ba646f3e88014b0b)), closes [#22](https://github.com/jonathanhudak/tools/issues/22)
* **puzzle-games:** add PWA support with offline capability ([#62](https://github.com/jonathanhudak/tools/issues/62)) ([cfbf0a9](https://github.com/jonathanhudak/tools/commit/cfbf0a9a7865fec08ddda3761de6b9e37fafd67a)), closes [#61](https://github.com/jonathanhudak/tools/issues/61)

# [1.16.0](https://github.com/jonathanhudak/tools/compare/v1.15.0...v1.16.0) (2026-02-03)


### Bug Fixes

* add DOM lib to audio-viz-core tsconfig ([f1fae29](https://github.com/jonathanhudak/tools/commit/f1fae29aeacdfa7d92725311a366ca93fba4a4ee))
* add missing @hudak/rsvp-core dependency to rsvp-reader ([8155bd8](https://github.com/jonathanhudak/tools/commit/8155bd8f3cc5b06748660ca2e5831300008da05d))
* prefix unused audioContext param with underscore ([d3c433c](https://github.com/jonathanhudak/tools/commit/d3c433c5238b15baf6377a1601450d610988706c))
* **puzzle-games:** Improve Nonogram for 9-year-old players ([#57](https://github.com/jonathanhudak/tools/issues/57)) ([84d5fa1](https://github.com/jonathanhudak/tools/commit/84d5fa199400ed784a2358d00741481500b63fd2)), closes [#54](https://github.com/jonathanhudak/tools/issues/54)
* **puzzle-games:** Word Search touch support for drag selection ([#56](https://github.com/jonathanhudak/tools/issues/56)) ([d50195e](https://github.com/jonathanhudak/tools/commit/d50195ea4e9e78d8c89b8d8535ad749cdf3b5383)), closes [#53](https://github.com/jonathanhudak/tools/issues/53)
* rename chroma import to chromaJs to avoid shadowing ([32e5119](https://github.com/jonathanhudak/tools/commit/32e511903760f57ccb2405c0bf915e7d899c0220))
* rename shadowed variable in audio-viz-core colors.ts ([6eefdf0](https://github.com/jonathanhudak/tools/commit/6eefdf0bb7b4c228d5d77672de718a34af3100ee))
* **rsvp-core:** add DOM lib to tsconfig for browser globals ([#60](https://github.com/jonathanhudak/tools/issues/60)) ([aaa63a7](https://github.com/jonathanhudak/tools/commit/aaa63a7277c16fe8ce401a54644c4a0aba240f70)), closes [#59](https://github.com/jonathanhudak/tools/issues/59)


### Features

* extract core RSVP logic into @hudak/rsvp-core package ([#49](https://github.com/jonathanhudak/tools/issues/49)) ([6f3822e](https://github.com/jonathanhudak/tools/commit/6f3822e6a92b4f95a7cacb402739b96996aca15d))
* Migrate visualize-audio into tools monorepo ([#51](https://github.com/jonathanhudak/tools/issues/51)) ([44ebae8](https://github.com/jonathanhudak/tools/commit/44ebae83009fdc5a5a05dcdf9a678b42ccbd56ab))
* **puzzle-games:** add crossword puzzle with advanced vocabulary ([#58](https://github.com/jonathanhudak/tools/issues/58)) ([501420e](https://github.com/jonathanhudak/tools/commit/501420e64392a36da4821b4edb3c455b2db31a23)), closes [#55](https://github.com/jonathanhudak/tools/issues/55)

# [1.15.0](https://github.com/jonathanhudak/tools/compare/v1.14.2...v1.15.0) (2026-02-03)


### Features

* **puzzle-games:** dark mode, player profiles, and how-to-play ([#46](https://github.com/jonathanhudak/tools/issues/46)) ([df2aff3](https://github.com/jonathanhudak/tools/commit/df2aff331138ab72a37db708dd8f018b2bc34f7c))

## [1.14.2](https://github.com/jonathanhudak/tools/compare/v1.14.1...v1.14.2) (2026-02-03)


### Bug Fixes

* **puzzle-games:** add TanStack Router basepath for GitHub Pages ([#42](https://github.com/jonathanhudak/tools/issues/42)) ([6760ef7](https://github.com/jonathanhudak/tools/commit/6760ef77c6705f51961aaee0ee1e6744c8091a4c)), closes [#41](https://github.com/jonathanhudak/tools/issues/41)

## [1.14.1](https://github.com/jonathanhudak/tools/compare/v1.14.0...v1.14.1) (2026-02-03)


### Bug Fixes

* puzzle-games GitHub Pages deployment config ([#40](https://github.com/jonathanhudak/tools/issues/40)) ([5b97016](https://github.com/jonathanhudak/tools/commit/5b97016308c0c36ffd57a8610bf057e83774014f)), closes [#39](https://github.com/jonathanhudak/tools/issues/39)

# [1.14.0](https://github.com/jonathanhudak/tools/compare/v1.13.0...v1.14.0) (2026-02-03)


### Features

* Puzzle Games App (Sokoban, Word Search, Nonogram) ([#38](https://github.com/jonathanhudak/tools/issues/38)) ([58dfabd](https://github.com/jonathanhudak/tools/commit/58dfabd8e9ef2bd4b148ec2642d591f34f2be3f7)), closes [#35](https://github.com/jonathanhudak/tools/issues/35) [#36](https://github.com/jonathanhudak/tools/issues/36) [#37](https://github.com/jonathanhudak/tools/issues/37)

# [1.13.0](https://github.com/jonathanhudak/tools/compare/v1.12.0...v1.13.0) (2026-02-03)


### Features

* add Chord-Scale Matrix Game Phase 1 (Degree Quiz) ([#32](https://github.com/jonathanhudak/tools/issues/32)) ([aab0c58](https://github.com/jonathanhudak/tools/commit/aab0c585f3652aa865592cce099a11b04c39141c))

# [1.12.0](https://github.com/jonathanhudak/tools/compare/v1.11.1...v1.12.0) (2026-02-02)


### Features

* add trade-journal CLI app ([d455b4b](https://github.com/jonathanhudak/tools/commit/d455b4b2d9c749a48124bf989ee6b762991a8853)), closes [#19](https://github.com/jonathanhudak/tools/issues/19)

## [1.11.1](https://github.com/jonathanhudak/tools/compare/v1.11.0...v1.11.1) (2026-01-25)


### Bug Fixes

* **instrument-tuner:** use new tuning system in routes.tsx ([779e0ec](https://github.com/jonathanhudak/tools/commit/779e0ece389acdb4bada7eb775962e1b1835f541))

# [1.11.0](https://github.com/jonathanhudak/tools/compare/v1.10.0...v1.11.0) (2026-01-25)


### Bug Fixes

* **instrument-tuner:** address code review findings ([f30b939](https://github.com/jonathanhudak/tools/commit/f30b9394d237d4080e25ed9fcfbab02441d1d75a))


### Features

* **instrument-tuner:** add comprehensive multi-instrument tuning support ([1461f85](https://github.com/jonathanhudak/tools/commit/1461f858ce0e0d851e27a99d19485e67a33a1135))

# [1.10.0](https://github.com/jonathanhudak/tools/compare/v1.9.3...v1.10.0) (2026-01-23)


### Features

* add extensible font system with lazy loading to RSVP reader ([e66844c](https://github.com/jonathanhudak/tools/commit/e66844c42a42cbaf73966b4b431ad17f1d42d3c6))
* merge font selector with font size slider in RSVP reader ([9cf8d7e](https://github.com/jonathanhudak/tools/commit/9cf8d7e45291435adbc9dca19b17a37a83570262))

## [1.9.3](https://github.com/jonathanhudak/tools/compare/v1.9.2...v1.9.3) (2026-01-23)


### Bug Fixes

* add required OIDC permissions to Claude Code action ([a6a3882](https://github.com/jonathanhudak/tools/commit/a6a3882f32e2d21c5dbfb5e3378880e1f2f05dc8))

## [1.9.2](https://github.com/jonathanhudak/tools/compare/v1.9.1...v1.9.2) (2026-01-23)


### Bug Fixes

* **rsvp-reader:** prevent mobile text clipping with font size slider ([6c4afd4](https://github.com/jonathanhudak/tools/commit/6c4afd4432b35dcdbd672ca43def96dcf50266d6))

## [1.9.1](https://github.com/jonathanhudak/tools/compare/v1.9.0...v1.9.1) (2026-01-23)


### Bug Fixes

* **rsvp-reader:** improve mobile text sizing and layout ([b90b866](https://github.com/jonathanhudak/tools/commit/b90b86680d5d00ebc2c342b929fcf348ddc4bb3e))

# [1.9.0](https://github.com/jonathanhudak/tools/compare/v1.8.0...v1.9.0) (2026-01-23)


### Features

* add JetBrains Mono ([8ddc21a](https://github.com/jonathanhudak/tools/commit/8ddc21a75405a3f5e72bd060869d89304b85fa7a))

# [1.8.0](https://github.com/jonathanhudak/tools/compare/v1.7.0...v1.8.0) (2026-01-23)


### Features

* add RSVP reader to landing page and document tool index requirements ([55a8d3f](https://github.com/jonathanhudak/tools/commit/55a8d3fa121c27b9e643a9c0bc47da87b8bf7da2))

# [1.7.0](https://github.com/jonathanhudak/tools/compare/v1.6.0...v1.7.0) (2026-01-23)


### Features

* **rsvp-reader:** add URL sharing and improve design ([1b6db63](https://github.com/jonathanhudak/tools/commit/1b6db63c66395f05610286b78b93a11dc87795dd))

# [1.6.0](https://github.com/jonathanhudak/tools/compare/v1.5.0...v1.6.0) (2026-01-23)


### Features

* add RSVP Reader app with zero-jiggle ORP highlighting ([4ed7259](https://github.com/jonathanhudak/tools/commit/4ed7259bafb69a22a9ed6296bf22b4b23176a34d))

# [1.5.0](https://github.com/jonathanhudak/tools/compare/v1.4.0...v1.5.0) (2026-01-23)


### Bug Fixes

* improve text extraction in url-content-extractor ([468bfea](https://github.com/jonathanhudak/tools/commit/468bfea5b595e9ef6429bad35a096e7edda4be12))


### Features

* enhance landing page with comprehensive tool cards ([1460778](https://github.com/jonathanhudak/tools/commit/1460778a5c107b7314ed46e844d6b655369f575b))

# [1.4.0](https://github.com/jonathanhudak/tools/compare/v1.3.0...v1.4.0) (2026-01-23)


### Bug Fixes

* add lucide-react dependency to instrument-tuner ([2aff15e](https://github.com/jonathanhudak/tools/commit/2aff15eb415086661ba5cc829b6e03658a4ce603))
* improve ikigai-tool navigation with larger circles and better zoom ([d80ef69](https://github.com/jonathanhudak/tools/commit/d80ef6918e10acccc6fd66652d097cc6d03c0e62))
* remove pnpm version from workflow to use package.json packageManager ([9f3c76c](https://github.com/jonathanhudak/tools/commit/9f3c76c13288413b8359b83a44ddaba5e7e6d4d9))
* resolve build failures for music-practice and instrument-tuner ([57cd115](https://github.com/jonathanhudak/tools/commit/57cd11545b06b255a1785ad33edc93515117d11c))


### Features

* add Amazon order scraper spec and script ([017f164](https://github.com/jonathanhudak/tools/commit/017f164b7caec67a50473c7be42ca0590af094c1))
* add interactive Ikigai tool with React Flow ([1c3d27c](https://github.com/jonathanhudak/tools/commit/1c3d27c967edc448b943f6e1d1293959b9652241))
* add URL content extractor tool ([ec4dbb8](https://github.com/jonathanhudak/tools/commit/ec4dbb82e89fd54b4ecd8f396c084c8fedacec3b))
* ikigai updates ([5961444](https://github.com/jonathanhudak/tools/commit/5961444eb66fd43b7d4c1ad0f6eb09c25bae92d9))
* local finance scripts ([1705e94](https://github.com/jonathanhudak/tools/commit/1705e94d881d8ec041d28e20da8aa66f4c6e192e))
* sure submodule ([132faf6](https://github.com/jonathanhudak/tools/commit/132faf64476901464b2215890eea8e934f446b60))

# [1.3.0](https://github.com/jonathanhudak/tools/compare/v1.2.0...v1.3.0) (2025-12-28)


### Features

* add local finance analyzer CLI tool ([1f3b9b2](https://github.com/jonathanhudak/tools/commit/1f3b9b2ffefa62b1fd29d9e275b9586ca8181eda))

# [1.2.0](https://github.com/jonathanhudak/tools/compare/v1.1.1...v1.2.0) (2025-12-14)


### Features

* music practice app ([a9a1129](https://github.com/jonathanhudak/tools/commit/a9a11298112c42ed5ea1fecd17670ae4156b830f))

## [1.1.1](https://github.com/jonathanhudak/tools/compare/v1.1.0...v1.1.1) (2025-11-09)


### Bug Fixes

* correct base paths for GitHub Pages deployment ([c1f8be3](https://github.com/jonathanhudak/tools/commit/c1f8be3fa0703d205c427386a0993420910696f1))

# [1.1.0](https://github.com/jonathanhudak/tools/compare/v1.0.3...v1.1.0) (2025-11-08)


### Bug Fixes

* configure TypeScript to output to dist directory ([dc52a09](https://github.com/jonathanhudak/tools/commit/dc52a095a1309c5daf5174524ef8e033dd00a5c9))
* improve audio context lifecycle and VexFlow initialization ([606d428](https://github.com/jonathanhudak/tools/commit/606d4282da9fa1ac33df49d3b39c8c28418fa23a))


### Features

* add instrument tuner app with real-time pitch detection ([adb1b3d](https://github.com/jonathanhudak/tools/commit/adb1b3d2a7b2612785dbaa9afddbe2cb18723857))
* add timed game mode with lives, scoring, and animations ([32191e6](https://github.com/jonathanhudak/tools/commit/32191e68484215719bb2dd6a9c270708166a56ad))
* automate GitHub Pages deployment with landing page generator ([a17d18e](https://github.com/jonathanhudak/tools/commit/a17d18ef2f351d16323689a67c9f010fb3f95c61))
* big old refactor things mostly working! ([3c0ed08](https://github.com/jonathanhudak/tools/commit/3c0ed0871baa8370288838bd574f23138faa7f9f))

## [1.0.3](https://github.com/jonathanhudak/tools/compare/v1.0.2...v1.0.3) (2025-11-05)


### Bug Fixes

* include HTML and CSS files in music-practice deployment ([49e22b5](https://github.com/jonathanhudak/tools/commit/49e22b5bf3ea2556bda813369faaa15577fb3652))

## [1.0.2](https://github.com/jonathanhudak/tools/compare/v1.0.1...v1.0.2) (2025-11-05)


### Bug Fixes

* release ([0f60d6b](https://github.com/jonathanhudak/tools/commit/0f60d6b8d7f439437ab66ff964f4865eeecd8246))

## [1.0.1](https://github.com/jonathanhudak/tools/compare/v1.0.0...v1.0.1) (2025-11-05)


### Bug Fixes

* gh-pages build ([ec18a9e](https://github.com/jonathanhudak/tools/commit/ec18a9e257f36482cb676b628df5e893b4578c37)), closes [#pages](https://github.com/jonathanhudak/tools/issues/pages)

# 1.0.0 (2025-11-05)


### Features

* add automated GitHub Pages deployment ([1536393](https://github.com/jonathanhudak/tools/commit/1536393aa2262e35cc0d7e76815bccb39e1a1bff))
