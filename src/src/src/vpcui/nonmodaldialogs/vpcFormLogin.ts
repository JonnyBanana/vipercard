
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512BeginAsync, UI512BeginAsyncIsBusy } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { VpcSession, vpcUsersCheckLogin, vpcUsersEnterEmailVerifyCode } from '../../vpc/request/vpcrequest.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcappli.js';
/* auto */ import { VpcFormNonModalDialogFormBase } from '../../vpcui/nonmodaldialogs/vpcnonmodalcommon.js';
/* auto */ import { VpcFormNonModalDialogLogInInterface, VpcFormNonModalDialogNewUser } from '../../vpcui/nonmodaldialogs/vpcformnewuser.js';

export class VpcFormNonModalDialogLogIn extends VpcFormNonModalDialogFormBase
    implements VpcFormNonModalDialogLogInInterface {
    fnCbWhenSignedIn: () => void = () => {};
    showHeader = true;
    captionText = 'lngLog In';
    hasCloseBtn = true;
    compositeType = 'VpcFormNonModalDialogLogIn';
    autoFillUsername: O<string>;
    autoShowNeedEmailCode = false;

    fields: [string, string, number][] = [
        ['username', 'lngUsername:', 1],
        ['pw', 'lngPassword:', 1],
        ['code_email_verify', 'lngE-mail verif-\nication code:', 2],
    ];
    btns: [string, string][] = [['ok', 'lngOK'], ['close', 'lngClose'], ['newaccount', 'lngNew User']];

    constructor(protected appli: IVpcStateInterface, public newUserOk: boolean) {
        super('vpcFormNonModalDialogLogIn' + Math.random());
    }

    waitingForVerifyCode: O<ArrayBuffer>;
    onClickBtn(short: string, el: UI512Element, appli: IVpcStateInterface): void {
        if (short === 'btnok') {
            if (this.waitingForVerifyCode) {
                this.setStatus(appli.lang(), 'lngInitial account verification...');
                this.doLoginVerifyCode(appli, this.waitingForVerifyCode);
            } else {
                this.setStatus(appli.lang(), 'lngLogging in...');
                this.doLogin(appli);
            }
        } else if (short === 'btnclose') {
            this.appli.setNonModalDialog(undefined);
            this.children = [];
        } else if (short === 'btnnewaccount') {
            if (UI512BeginAsyncIsBusy()) {
                this.setStatus(appli.lang(), 'lngOperation still in progress...');
            } else {
                this.appli.setNonModalDialog(undefined);
                this.children = [];
                let newuserform = new VpcFormNonModalDialogNewUser(this.appli, VpcFormNonModalDialogLogIn);
                newuserform.fnCbWhenSignedIn = this.fnCbWhenSignedIn;
                this.appli.setNonModalDialog(newuserform);
            }
        }
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        super.createSpecific(app, lang);
        let grp = app.getGroup(this.grpid);
        let fldPw = grp.getEl(this.getElId('fldpw'));
        fldPw.set('asteriskonly', true);
        let fldEmailVerify = grp.getEl(this.getElId('fldcode_email_verify'));
        fldEmailVerify.set('h', fldPw.h);
        fldEmailVerify.set('visible', false);
        let lblEmailVerify = grp.getEl(this.getElId('lblForcode_email_verify'));
        lblEmailVerify.set('visible', false);

        // this.autoShowNeedEmailCode
        // doesn't help since it wouldn't have the right state yet, needs keybuffer.
        if (this.autoShowNeedEmailCode) {
            this.setStatus(this.appli.lang(), 'lngAn e-mail has been sent to verify.');
        }

        let btnNewAccount = grp.getEl(this.getElId('btnnewaccount'));
        btnNewAccount.setDimensions(btnNewAccount.x - 10, btnNewAccount.y, btnNewAccount.w + 10, btnNewAccount.h);

        if (this.autoFillUsername) {
            grp.getEl(this.getElId('fldusername')).setftxt(FormattedText.newFromUnformatted(this.autoFillUsername));
        }

        if (!this.newUserOk) {
            grp.getEl(this.getElId('btnnewaccount')).set('visible', false);
        }
    }

    doLogin(appli: IVpcStateInterface) {
        let paramFields = this.readFields(appli.UI512App());
        UI512BeginAsync(
            () => vpcUsersCheckLogin(paramFields['username'], paramFields['pw']),
            (result: Error | any | VpcSession) => {
                if (this.children.length === 0) {
                    // someone hit cancel
                    return;
                } else if (result instanceof VpcSession) {
                    // login was successful!
                    getRoot().setSession(result);
                    this.setStatus(appli.lang(), 'lngLogged in.');
                    this.appli.setNonModalDialog(undefined);
                    this.children = [];
                    this.fnCbWhenSignedIn();
                } else if (result instanceof Error) {
                    // login was not successful -- prob missing user or wrong password
                    this.setStatus(appli.lang(), 'lngDid not log in, ' + result.toString());
                } else if (result[0] === 'need_email_verify' && result.length === 3) {
                    // login needs email verification
                    this.setStatus(appli.lang(), 'lngPlease enter the verification code sent via e-mail.');
                    let grp = appli.UI512App().getGroup(this.grpid);
                    let fldEmailVerify = grp.getEl(this.getElId('fldcode_email_verify'));
                    fldEmailVerify.set('visible', true);
                    let lblEmailVerify = grp.getEl(this.getElId('lblForcode_email_verify'));
                    lblEmailVerify.set('visible', true);
                    this.waitingForVerifyCode = result[2];
                } else {
                    this.setStatus(appli.lang(), 'lngDid not log in, unknown.');
                }
            }
        );
    }

    doLoginVerifyCode(appli: IVpcStateInterface, keybuffer: ArrayBuffer) {
        let paramFields = this.readFields(appli.UI512App());
        UI512BeginAsync(
            () => vpcUsersEnterEmailVerifyCode(paramFields['username'], keybuffer, paramFields['code_email_verify']),
            (result: Error | VpcSession) => {
                if (this.children.length === 0) {
                    // someone hit cancel
                    return;
                } else if (result instanceof VpcSession) {
                    // login was successful!
                    getRoot().setSession(result);
                    this.setStatus(appli.lang(), 'lngLogged in.');
                    this.appli.setNonModalDialog(undefined);
                    this.children = [];
                    this.fnCbWhenSignedIn();
                } else {
                    // login was not successful -- prob wrong password
                    this.setStatus(appli.lang(), 'lng ' + result.toString());
                }
            }
        );
    }
}