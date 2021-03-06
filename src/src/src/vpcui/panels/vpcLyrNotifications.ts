
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { TextFontSpec } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementsLabel.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppInterfaceLayer } from '../../vpcui/modelrender/vpcPaintRender.js';
/* auto */ import { VpcAppResizeHandles } from '../../vpcui/panels/vpcLyrDragHandles.js';

export class VpcAppCoverArea extends VpcAppInterfaceLayer {
    elems: { [key: string]: UI512Element } = {};

    init() {
        let grpHelperElems = VpcAppResizeHandles.getGrpHelperElems(this.appli.UI512App());

        // create a white opaque rectangle to cover up user elements that leave the user area
        this.elems.cover = new UI512ElButton('grpAppHelperElemsCover');
        grpHelperElems.addElement(this.appli.UI512App(), this.elems.cover);
        this.elems.cover.set('style', UI512BtnStyle.Opaque);
        this.elems.cover.set('autohighlight', false);
        let coverx = this.appli.bounds()[0] + ScreenConsts.xAreaWidth;
        let covery = this.appli.bounds()[1];
        let coverw = 10 + this.appli.bounds()[2] - ScreenConsts.xAreaWidth;
        let coverh = 10 + this.appli.bounds()[3];
        this.elems.cover.setDimensions(coverx, covery, coverw, coverh);

        // a message to the user saying "nyi"
        const margin = 45;
        let msg = lng('lng(This feature is not yet supported.)');
        let font = new TextFontSpec('geneva', 0, 10);
        msg = UI512DrawText.setFont(msg, font.toSpecString());
        this.elems.nyiMsg = new UI512ElLabel('grpAppHelperElemsNyiMsg');
        grpHelperElems.addElement(this.appli.UI512App(), this.elems.nyiMsg);
        this.elems.nyiMsg.set('visible', false);
        this.elems.nyiMsg.set('labeltext', msg);
        this.elems.nyiMsg.set('labelwrap', true);
        this.elems.nyiMsg.set('labelhalign', true);
        this.elems.nyiMsg.set('labelvalign', true);
        this.elems.nyiMsg.setDimensions(this.elems.cover.x, this.elems.cover.y, this.elems.cover.w, this.elems.cover.h);

        // a message to the user saying where tutorials are.
        let s = lng('lngNew? Click here to see how to use ViperCard. (Close).');
        let style = 'biuosdce';
        s = UI512DrawText.setFont(s, `chicago_10_${style}`);
        let lbl = new UI512ElLabel('grpAppHelperElemsShowTutorial');
        grpHelperElems.addElement(this.appli.UI512App(), lbl);
        lbl.set('labelhalign', false);
        lbl.set('labeltext', s);
        lbl.set('w', 318);
        lbl.set('h', 20);
        lbl.set('x', this.appli.bounds()[0] + this.appli.bounds()[2] - lbl.w);
        lbl.set('y', this.appli.bounds()[1] + this.appli.bounds()[3] - lbl.h);
    }

    updateUI512Els() {
        let currentTool = this.appli.getOption_n('currentTool');
        let showNyi = getToolCategory(currentTool) === VpcToolCtg.CtgNyi;
        this.elems.nyiMsg.set('visible', showNyi);
    }

    hideMyMessage() {
        let grpHelperElems = VpcAppResizeHandles.getGrpHelperElems(this.appli.UI512App());
        let lbl = grpHelperElems.findEl('grpAppHelperElemsShowTutorial');
        if (lbl) {
            lbl.set('visible', false);
        }
    }

    setMyMessage(s: string) {
        let grpHelperElems = VpcAppResizeHandles.getGrpHelperElems(this.appli.UI512App());
        let lbl = grpHelperElems.findEl('grpAppHelperElemsShowTutorial');
        if (lbl) {
            lbl.set('labeltext', s);
            lbl.set('visible', true);
        }
    }

    respondMouseUp(d: MouseUpEventDetails) {
        if (d.elClick) {
            if (d.elClick.id === 'grpAppHelperElemsShowTutorial') {
                let grpHelperElems = VpcAppResizeHandles.getGrpHelperElems(this.appli.UI512App());
                let lbl = grpHelperElems.findEl('grpAppHelperElemsShowTutorial');
                if (lbl) {
                    if (this.appli.bounds()[0] + this.appli.bounds()[2] - d.mouseX < 55) {
                        lbl.set('visible', false);
                    } else {
                        this.appli.performMenuAction('mnuDlgHelpScreenshots');
                    }
                }
            }
        }
    }
}
