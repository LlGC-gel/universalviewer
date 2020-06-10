import { BaseEvents } from "../../modules/uv-shared-module/BaseEvents";
import { BaseExtension } from "../../modules/uv-shared-module/BaseExtension";
import { Bookmark } from "../../modules/uv-shared-module/Bookmark";
import { ContentLeftPanel } from "../../modules/uv-contentleftpanel-module/ContentLeftPanel";
import { DownloadDialogue } from "./DownloadDialogue";
import { FooterPanel } from "../../modules/uv-shared-module/FooterPanel";
import { FooterPanel as MobileFooterPanel } from "../../modules/uv-modelviewermobilefooterpanel-module/MobileFooter";
import { HeaderPanel } from "../../modules/uv-shared-module/HeaderPanel";
import { HelpDialogue } from "../../modules/uv-dialogues-module/HelpDialogue";
import { IModelViewerExtension } from "./IModelViewerExtension";
import { MoreInfoDialogue } from "../../modules/uv-dialogues-module/MoreInfoDialogue";
import { MoreInfoRightPanel } from "../../modules/uv-moreinforightpanel-module/MoreInfoRightPanel";
import { SettingsDialogue } from "./SettingsDialogue";
import { ShareDialogue } from "./ShareDialogue";
import { ModelViewerCenterPanel } from "../../modules/uv-modelviewercenterpanel-module/ModelViewerCenterPanel";
import { ExternalResourceType } from "@iiif/vocabulary";
import { Strings } from "@edsilv/utils";
import { Canvas, LanguageMap } from "manifesto.js";

export default class Extension extends BaseExtension
  implements IModelViewerExtension {
  $downloadDialogue: JQuery;
  $shareDialogue: JQuery;
  $helpDialogue: JQuery;
  $moreInfoDialogue: JQuery;
  $settingsDialogue: JQuery;
  centerPanel: ModelViewerCenterPanel;
  downloadDialogue: DownloadDialogue;
  footerPanel: FooterPanel;
  headerPanel: HeaderPanel;
  helpDialogue: HelpDialogue;
  leftPanel: ContentLeftPanel;
  mobileFooterPanel: FooterPanel;
  moreInfoDialogue: MoreInfoDialogue;
  rightPanel: MoreInfoRightPanel;
  settingsDialogue: SettingsDialogue;
  shareDialogue: ShareDialogue;

  create(): void {
    super.create();

    this.component.subscribe(
      BaseEvents.CANVAS_INDEX_CHANGED,
      (canvasIndex: number) => {
        this.viewCanvas(canvasIndex);
      }
    );

    this.component.subscribe(
      BaseEvents.THUMB_SELECTED,
      (canvasIndex: number) => {
        this.component.publish(BaseEvents.CANVAS_INDEX_CHANGED, canvasIndex);
      }
    );
  }

  createModules(): void {
    super.createModules();

    if (this.isHeaderPanelEnabled()) {
      this.headerPanel = new HeaderPanel(this.shell.$headerPanel);
    } else {
      this.shell.$headerPanel.hide();
    }

    if (this.isLeftPanelEnabled()) {
      this.leftPanel = new ContentLeftPanel(this.shell.$leftPanel);
    }

    this.centerPanel = new ModelViewerCenterPanel(this.shell.$centerPanel);

    if (this.isRightPanelEnabled()) {
      this.rightPanel = new MoreInfoRightPanel(this.shell.$rightPanel);
    }

    if (this.isFooterPanelEnabled()) {
      this.footerPanel = new FooterPanel(this.shell.$footerPanel);
      this.mobileFooterPanel = new MobileFooterPanel(
        this.shell.$mobileFooterPanel
      );
    } else {
      this.shell.$footerPanel.hide();
    }

    this.$moreInfoDialogue = $(
      '<div class="overlay moreInfo" aria-hidden="true"></div>'
    );
    this.shell.$overlays.append(this.$moreInfoDialogue);
    this.moreInfoDialogue = new MoreInfoDialogue(this.$moreInfoDialogue);

    this.$downloadDialogue = $(
      '<div class="overlay download" aria-hidden="true"></div>'
    );
    this.shell.$overlays.append(this.$downloadDialogue);
    this.downloadDialogue = new DownloadDialogue(this.$downloadDialogue);

    this.$shareDialogue = $(
      '<div class="overlay share" aria-hidden="true"></div>'
    );
    this.shell.$overlays.append(this.$shareDialogue);
    this.shareDialogue = new ShareDialogue(this.$shareDialogue);

    this.$settingsDialogue = $(
      '<div class="overlay settings" aria-hidden="true"></div>'
    );
    this.shell.$overlays.append(this.$settingsDialogue);
    this.settingsDialogue = new SettingsDialogue(this.$settingsDialogue);

    if (this.isLeftPanelEnabled()) {
      this.leftPanel.init();
    } else {
      this.shell.$leftPanel.hide();
    }

    if (this.isRightPanelEnabled()) {
      this.rightPanel.init();
    } else {
      this.shell.$rightPanel.hide();
    }
  }

  render(): void {
    super.render();
  }

  isLeftPanelEnabled(): boolean {
    return false;
    // return (
    //   Bools.getBool(this.data.config.options.leftPanelEnabled, true) &&
    //   (this.helper.isMultiCanvas() || this.helper.isMultiSequence())
    // );
  }

  bookmark(): void {
    super.bookmark();

    const canvas: Canvas = this.helper.getCurrentCanvas();
    const bookmark: Bookmark = new Bookmark();

    bookmark.index = this.helper.canvasIndex;
    bookmark.label = <string>LanguageMap.getValue(canvas.getLabel());
    bookmark.thumb = canvas.getProperty("thumbnail");
    bookmark.title = this.helper.getLabel();
    bookmark.trackingLabel = window.trackingLabel;
    bookmark.type = ExternalResourceType.PHYSICAL_OBJECT;

    this.fire(BaseEvents.BOOKMARK, bookmark);
  }

  getEmbedScript(template: string, width: number, height: number): string {
    //const configUri: string = this.data.config.uri || '';
    //const script: string = String.format(template, this.getSerializedLocales(), configUri, this.helper.manifestUri, this.helper.collectionIndex, this.helper.manifestIndex, this.helper.sequenceIndex, this.helper.canvasIndex, width, height, this.data.embedScriptUri);
    const appUri: string = this.getAppUri();
    const iframeSrc: string = `${appUri}#?manifest=${this.helper.manifestUri}&c=${this.helper.collectionIndex}&m=${this.helper.manifestIndex}&s=${this.helper.sequenceIndex}&cv=${this.helper.canvasIndex}`;
    const script: string = Strings.format(
      template,
      iframeSrc,
      width.toString(),
      height.toString()
    );
    return script;
  }
}