
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcAppPropPanel } from '../../vpcui/panels/vpcLyrPanels.js';
/* auto */ import { VpcAppUIToolResponseBase } from '../../vpcui/tools/vpcToolBase.js';

class EditToolDragStatus {
    constructor(
        public whichHandle: number,
        public vel: VpcElBase,
        public el: UI512Element,
        public distanceFromHandleCenterX: number,
        public distanceFromHandleCenterY: number,
        public distanceFromFirstHandleCenterX: number,
        public distanceFromFirstHandleCenterY: number
    ) {}
}

export class VpcAppUIToolEdit extends VpcAppUIToolResponseBase {
    dragStatus: O<EditToolDragStatus>;
    propPanel: VpcAppPropPanel;

    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        this.propPanel.respondMouseDown(d);
        if (d.el && d.el.id === 'VpcModelRender$$renderbg') {
            // click on the screen but on no item: deselect all
            this.appli.setOption('selectedVelId', '');
        } else if (d.el && d.el.id.startsWith('VpcModelRender$$')) {
            // click on an item to select it
            let velid = this.cbModelRender().elIdToVelId(d.el.id) || '';
            if (velid.length && d.el.typeName === 'UI512ElTextField') {
                this.appli.setTool(VpcTool.Field);
                this.appli.setOption('selectedVelId', velid);
            } else if (velid.length && d.el.typeName === 'UI512ElementButtonGeneral') {
                this.appli.setTool(VpcTool.Button);
                this.appli.setOption('selectedVelId', velid);
            } else {
                this.appli.setOption('selectedVelId', '');
            }
        } else {
            // drag a handle to resize a vel
            let handle = this.propPanel.handles.whichHandle(d.el ? d.el.id : '');
            if (handle !== undefined && !this.dragStatus) {
                let vel = this.propPanel.getAndValidateSelectedVel('selectedVelId');
                if (vel && (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld)) {
                    let targetEl = this.appli.UI512App().findElemById('VpcModelRender$$' + vel.id);
                    if (targetEl) {
                        // distance from initial click to center of handle
                        let distanceFromHandleCenterX =
                            d.mouseX -
                            this.propPanel.handles.sizeHandles[handle].get_n('x') -
                            this.propPanel.handles.sizeHandles[0].w / 2;
                        let distanceFromHandleCenterY =
                            d.mouseY -
                            this.propPanel.handles.sizeHandles[handle].get_n('y') -
                            this.propPanel.handles.sizeHandles[0].h / 2;
                        let distanceFromFirstHandleCenterX =
                            d.mouseX -
                            this.propPanel.handles.sizeHandles[0].get_n('x') -
                            this.propPanel.handles.sizeHandles[0].w / 2;
                        let distanceFromFirstHandleCenterY =
                            d.mouseY -
                            this.propPanel.handles.sizeHandles[0].get_n('y') -
                            this.propPanel.handles.sizeHandles[0].h / 2;
                        this.dragStatus = new EditToolDragStatus(
                            handle,
                            vel,
                            targetEl,
                            distanceFromHandleCenterX,
                            distanceFromHandleCenterY,
                            distanceFromFirstHandleCenterX,
                            distanceFromFirstHandleCenterY
                        );
                    }
                }
            }
        }
    }

    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        if (this.dragStatus) {
            if (this.dragStatus.whichHandle === 3) {
                // for the bottom right handle, set the size+width.
                let centerX = d.mouseX - this.dragStatus.distanceFromHandleCenterX;
                let centerY = d.mouseY - this.dragStatus.distanceFromHandleCenterY;
                this.dragStatus.el.setDimensions(
                    this.dragStatus.el.x,
                    this.dragStatus.el.y,
                    Math.max(5, centerX - this.dragStatus.el.x),
                    Math.max(5, centerY - this.dragStatus.el.y)
                );
            } else {
                // for the other handles, set the location
                let newx = d.mouseX - this.dragStatus.distanceFromFirstHandleCenterX;
                let newy = d.mouseY - this.dragStatus.distanceFromFirstHandleCenterY;
                this.dragStatus.el.setDimensions(newx, newy, this.dragStatus.el.w, this.dragStatus.el.h);
            }

            this.propPanel.handles.updateUI512Els();
        }
    }

    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        this.propPanel.respondMouseUp(d);
        if (this.dragStatus) {
            // cancel the resize if we're on a different card now or if selected vel was changed
            let validatedVel = this.propPanel.getAndValidateSelectedVel('selectedVelId');
            if (
                validatedVel &&
                validatedVel.id === this.dragStatus.vel.id &&
                (validatedVel.getType() === VpcElType.Btn || validatedVel.getType() === VpcElType.Fld)
            ) {
                let targetVel = this.dragStatus.vel;
                targetVel.set('x', this.dragStatus.el.x - this.appli.userBounds()[0]);
                targetVel.set('y', this.dragStatus.el.y - this.appli.userBounds()[1]);
                targetVel.set('w', this.dragStatus.el.w);
                targetVel.set('h', this.dragStatus.el.h);
            }

            this.dragStatus = undefined;
        }
    }

    cancelCurrentToolAction() {
        this.dragStatus = undefined;
    }

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.Arrow;
    }

    onOpenTool() {
        this.cancelCurrentToolAction();
    }

    onLeaveTool() {
        this.cancelCurrentToolAction();
        this.propPanel.editor.saveChangesToModel(this.appli.UI512App(), false);
        if (this.propPanel.active) {
            this.propPanel.active.saveChangesToModel(this.appli.UI512App(), false);
        }
    }

    onDeleteSelection() {
        let seled = this.propPanel.getEditToolSelectedFldOrBtn();
        if (seled) {
            this.appli.setOption('selectedVelId', '');
            this.appli.removeElem(seled);
        }
    }
}
