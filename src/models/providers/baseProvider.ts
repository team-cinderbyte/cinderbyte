import type {
  ExtensionTypeEnum,
  ProviderInfo,
} from "../../utils/types/provider";

abstract class BaseProvider {
  /**
   *  provider info
   */
  protected abstract readonly data: ProviderInfo;
  cachePath?: string;

  protected generateIdentifier(
    name: string,
    isNSFW: boolean,
    type: ExtensionTypeEnum,
  ) {
    return `${type.toLowerCase()}.${isNSFW ? "nsfw" : "sfw"}.${name}`.replaceAll(
      "/[^0-9a-zA-Z]+/gm",
      "-",
    );
  }

  getInfo() {
    return {
      ...this.data,
      identifier: this.generateIdentifier(
        this.data.name,
        this.data.isNSFW,
        this.data.type,
      ),
    };
  }
}

export default BaseProvider;
