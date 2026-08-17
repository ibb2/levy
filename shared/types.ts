export type Element = {
  type: string;
  level: number;
  nodeName: string | undefined;
  text: string | undefined | null;
};

export type ArticleDocument = {
  title: string;
  content: string; // HTML string of processed article content;
  textContent: string; // text content of the article, with all the HTML tags removed;
  length: number; // length of an article, in characters;
  excerpt: string; // article description, or short excerpt from the content;
  byline: string; // author metadata;
  dir: string; //content direction;
  siteName: string; // name of the site;
  lang: string; // content language;
  publishedTime: string; // published time;
  html: string; //  Raw html, sanitized
  segments: Array<{ id: string; text: string }>;
};

export type PlayerMessage =
  | { type: "TOGGLE_PLAYER" }
  | { type: "PAUSE_AUDIO" }
  | { type: "PLAY_AUDIO"; audio: string; contentType: string };
