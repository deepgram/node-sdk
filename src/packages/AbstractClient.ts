import { DEFAULT_OPTIONS, DEFAULT_URL } from "../lib/constants";
import { applySettingDefaults, stripTrailingSlash } from "../lib/helpers";
import { DeepgramClientOptions } from "../lib/types";

/**
 * Deepgram Client.
 *
 * An isomorphic Javascript client for interacting with the Deepgram API.
 * @see https://developers.deepgram.com
 */
export abstract class AbstractClient {
  protected baseUrl: URL;

  constructor(protected key: string, protected options: DeepgramClientOptions) {
    this.key = key;

    if (!key) {
      this.key = process.env.DEEPGRAM_API_KEY as string;
    }

    if (!this.key) {
      throw new Error("A deepgram API key is required");
    }

    this.options = applySettingDefaults(options, DEFAULT_OPTIONS);

    if (!this.options.global?.url) {
      throw new Error(
        `An API URL is required. It should be set to ${DEFAULT_URL} by default. No idea what happened!`
      );
    }

    if (this.willProxy()) {
      this.baseUrl = this.resolveBaseUrl(this.options.restProxy?.url as string);

      if (this.options.global.headers) {
        this.options.global.headers["X-Deepgram-Proxy"] = this.options.global.url;
      }
    } else {
      this.baseUrl = this.resolveBaseUrl(this.options.global.url);
    }
  }

  protected resolveBaseUrl(url: string) {
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    return new URL(stripTrailingSlash(url));
  }

  protected willProxy() {
    const proxyUrl = this.options.restProxy?.url;

    return !!proxyUrl;
  }
}
