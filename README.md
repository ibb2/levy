<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/ibb2/levy">
    <img src="public/icon/128.png" alt="Levy icon" width="80" height="80">
  </a>

<h3 align="center">Levy</h3>

  <p align="center">
    <b>A focused reading mode for the browser side panel.</b>
    <br />
    <!-- <a href="https://github.com/ibb2/levy"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/ibb2/levy">View Demo</a>
    &middot;
    <a href="https://github.com/ibb2/levy/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/ibb2/levy/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a> -->
  </p>
  <span>Chrome, Firefox</span>
</div>

<!-- TABLE OF CONTENTS -->
<!-- <details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about">About</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details> -->

<!-- ABOUT THE PROJECT -->
## About

Levy is a cross-browser reading mode extension that presents article content in the browser side panel rather than opening a separate custom reading window. It is designed to keep reading focused by removing unrelated page chrome while preserving the structure that makes an article readable.

The current prototype automatically extracts the active page's best-available article content and renders its headings and paragraphs in the side panel. The planned initial release expands this into a complete reading experience with semantic formatting, article metadata, image visibility controls, and private local AI narration.

Levy only reads content already accessible to the browser. It does not bypass paywalls or provide unrestricted access to protected content.

### Built With

- [WXT](https://wxt.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

### Current prototype

- Automatically responds to active-tab changes.
- Finds the best available article-like content on the page.
- Extracts headings and paragraphs from the accessible page content.
- Renders heading hierarchy and readable typography in the side panel.
- Uses Chrome's Side Panel API and Firefox's Sidebar Action API.

### Planned MVP

#### Reading view

- Remove obvious page clutter, including ads, navigation, recommendations, newsletter prompts, comments, footers, and unrelated widgets.
- Preserve readable semantic markup such as headings, font weights, lists, tables, links, emphasis, block quotes, code blocks, figures, captions, and footnotes.
- Show the article author and publication date from visible content, with trustworthy page metadata as a fallback.
- Hide images by default on first use and remember the user's image visibility preference.
- Keep reading available when no article can be extracted by showing a clear, friendly empty state.

#### Access and privacy

- Use only content already available to the browser.
- Leave paywalls and access restrictions untouched.
- Keep initial-release narration local-runtime-first, without sending article text to a hosted AI service.
- Keep the article readable when the local voice service is unavailable.

#### AI narration

- Connect to a user-managed local voice runtime.
- Provide a voice picker in Levy.
- Require the user to press Play; narration does not autoplay.
- Stream narration by sentence for responsive playback.
- Support Play, Pause, Previous Sentence, Next Sentence, and 15-second Rewind.

### Deferred roadmap

- TL;DR and article summaries.
- Guided installation and model setup for local voice runtimes.
- Optional paid cloud narration for users who do not want to run local models.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Levy currently targets Chrome and Firefox.

### Prerequisites

- Node.js
- npm

### Installation

Install the project dependencies:

```sh
npm install
```

### Development

Start the default WXT development build:

```sh
npm run dev
```

For Firefox, use:

```sh
npm run dev:firefox
```

Local narration expects LocalAI at `http://127.0.0.1:8080` with a streaming
TTS model available as `omnivoice-cpp`. To use a different model name,
start Levy with:

```sh
VITE_LOCALAI_TTS_MODEL=your-model-name npm run dev
```

Levy requests streamed PCM WAV audio from LocalAI's `/tts` endpoint. If the
backend explicitly reports that streaming is not implemented, Levy retries
ordinary LocalAI TTS before using the browser's built-in text-to-speech voice.

Click the Levy toolbar icon to open the reading panel. Chrome uses the Side Panel API; Firefox uses the Sidebar Action API.

### Production builds

```sh
npm run build
npm run build:firefox
```

To create distributable archives:

```sh
npm run zip
npm run zip:firefox
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

1. Open a page containing an article.
2. Click the Levy toolbar icon.
3. Read the accessible article content in the side panel.
4. Move to another tab or page and Levy will refresh its extracted content automatically.

If a page does not contain a readable article, Levy keeps the side panel available and shows an empty state rather than attempting to bypass access restrictions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Automatic active-page article extraction prototype
- [x] Side-panel article rendering prototype
- [ ] Semantic reading cleanup and article-only presentation
- [ ] Heading, list, table, link, quote, figure, caption, and footnote preservation
- [ ] Author and publication-date extraction
- [ ] Image visibility toggle with remembered preference
- [ ] Paywall-safe content boundaries
- [ ] Local AI voice runtime integration
- [ ] Voice selection and sentence-based streaming playback
- [ ] Play, pause, sentence navigation, and 15-second rewind
- [ ] Local voice runtime setup assistance
- [ ] TL;DR summaries
- [ ] Optional paid cloud narration

See the [open issues](https://github.com/ibb2/levy/issues) for proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss the proposed behavior, and update or add tests for the affected feature.

Before opening a pull request, run the relevant checks:

```sh
npm run compile
npm run build
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

A license has not yet been specified for this project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
