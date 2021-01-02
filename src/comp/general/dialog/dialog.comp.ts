import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Service
import { DialogService } from '../../../service/sys/dialog.service';
import { UtilService } from '../../../service/sys/util.service';

// Bo
import { DialogBo } from '../../../bo/sys/dialog.bo';

// Enum
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.comp.html'
})
export class AppDialogComp implements OnInit {
    dialogBo: DialogBo;

    vBtnOk: boolean = false;
    vBtnCancel: boolean = false;
    vBtnYes: boolean = false;
    vBtnNo: boolean = false;
    vBtnRetry: boolean = false;

    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;

    config = {
        backdrop: true,
        ignoreBackdropClick: false
    };

    constructor(
        private dialogService: DialogService,
        private utils: UtilService) {
        this.dialogBo = new DialogBo();

        this.dialogService.getBaby().subscribe(
            x => {
                //subscribeBaby.unsubscribe();

                this.dialogBo = x;

                this.hideAllButtons();
                switch (this.dialogBo.buttons) {
                    case DialogButtons.OK:
                        this.vBtnOk = true;
                        break;
                    case DialogButtons.OKCancel:
                        this.vBtnOk = true;
                        this.vBtnCancel = true;
                        break;
                    case DialogButtons.RetryCancel:
                        this.vBtnRetry = true;
                        this.vBtnCancel = true;
                        break;
                    case DialogButtons.YesNo:
                        this.vBtnYes = true;
                        this.vBtnNo = true;
                        break;
                    case DialogButtons.YesNoCancel:
                        this.vBtnYes = true;
                        this.vBtnNo = true;
                        this.vBtnCancel = true;
                        break;
                    default:
                        this.vBtnOk = true;
                        break;
                }

                // callbacks
                if (this.dialogBo.ok) {
                    this.dialogBo.okEvent = new EventEmitter();
                    this.dialogBo.okEvent.subscribe(this.dialogBo.ok);
                }
                if (this.dialogBo.cancel) {
                    this.dialogBo.cancelEvent = new EventEmitter();
                    this.dialogBo.cancelEvent.subscribe(this.dialogBo.cancel);
                }
                if (this.dialogBo.yes) {
                    this.dialogBo.yesEvent = new EventEmitter();
                    this.dialogBo.yesEvent.subscribe(this.dialogBo.yes);
                }
                if (this.dialogBo.no) {
                    this.dialogBo.noEvent = new EventEmitter();
                    this.dialogBo.noEvent.subscribe(this.dialogBo.no);
                }
                if (this.dialogBo.retry) {
                    this.dialogBo.retryEvent = new EventEmitter();
                    this.dialogBo.retryEvent.subscribe(this.dialogBo.retry);
                }

                let subsOnHide = this.modal.onHide.subscribe(
                    () => {
                        this.utils.unsubs(subsOnHide);

                        if (this.utils.isNotNull(this.dialogBo)) {
                            this.utils.unsubsEvent(this.dialogBo.okEvent);
                            this.utils.unsubsEvent(this.dialogBo.cancelEvent);
                            this.utils.unsubsEvent(this.dialogBo.yesEvent);
                            this.utils.unsubsEvent(this.dialogBo.noEvent);
                            this.utils.unsubsEvent(this.dialogBo.retryEvent);
                        }
                    }
                );

                this.config.ignoreBackdropClick = x.ignoreBackdropClick;
                this.modal.config = this.config;
                this.modal.show();
            }
        );
    }

    ngOnInit(): void {


    }

    close(): void {

    }
    clicked(deger: number): void {
        if (this.utils.isNotNull(this.dialogBo)) {
            if (this.utils.isNotNull(this.dialogBo.okEvent) && !this.dialogBo.okEvent.closed) {
                if (deger == 0) this.dialogBo.okEvent.emit();
            }
            if (this.utils.isNotNull(this.dialogBo.cancelEvent) && !this.dialogBo.cancelEvent.closed) {
                if (deger == 1) this.dialogBo.cancelEvent.emit();
            }
            if (this.utils.isNotNull(this.dialogBo.yesEvent) && !this.dialogBo.yesEvent.closed) {
                if (deger == 2) this.dialogBo.yesEvent.emit();
            }
            if (this.utils.isNotNull(this.dialogBo.noEvent) && !this.dialogBo.noEvent.closed) {
                if (deger == 3) this.dialogBo.noEvent.emit();
            }
            if (this.utils.isNotNull(this.dialogBo.retryEvent) && !this.dialogBo.retryEvent.closed) {
                if (deger == 4) this.dialogBo.retryEvent.emit();
            }
        }

        this.modal.hide();
    }

    private hideAllButtons(): void {
        this.vBtnOk = false;
        this.vBtnCancel = false;
        this.vBtnYes = false;
        this.vBtnNo = false;
        this.vBtnRetry = false;
    }
}


/**
// System
import { Component, OnInit, EventEmitter } from '@angular/core';

// Service
import { DialogService } from '../../../service/sys/dialog.service';

// Enum
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogBo } from '../../../bo/sys/dialog.bo';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.comp.html',
    styleUrls: ['./dialog.comp.css']
})
export class AppDialogComp implements OnInit {
    confirmation: DialogBo;

    display: boolean = false;
    text: string = '';
    title: string = '';
    iconClass: string = 'check';
    showIcon: boolean = false;

    closeOnEscape: boolean = false;
    closable: boolean = false;
    width?: number;

    vBtnOk: boolean = false;
    vBtnCancel: boolean = false;
    vBtnYes: boolean = false;
    vBtnNo: boolean = false;
    vBtnRetry: boolean = false;

    private _status: number;//0 closed, 1 normal open, 2 async show
    private set Status(value: number) {
        this._status = value;

        this.display = value == 0 ? false : true;
    }
    private get Status(): number {
        return this._status;
    }

    constructor(private dialogService: DialogService) {

    }
    ngOnInit() {
        this.dialogService.getBaby().subscribe(
            message => {
                this.closeOnEscape = true;
                this.closable = true;

                this.hideAllButtons();

                this.Status = 1;
                this.text = message.text;
                this.title = message.title;

                this.width = message.width;

                this.vBtnOk = true;

                this.handleIcon(message.icon);
            });

        this.dialogService.getNaber().subscribe(
            x => {
                if (x) {

                    //we don't want that dialog box to be closed without select anything.
                    this.closeOnEscape = false;
                    this.closable = false;

                    this.confirmation = x;
                    this.width = x.width;

                    // buttons
                    this.hideAllButtons();
                    switch (this.confirmation.btns) {
                        case DialogButtons.OK:
                            this.vBtnOk = true;
                            break;
                        case DialogButtons.OKCancel:
                            this.vBtnOk = true;
                            this.vBtnCancel = true;
                            break;
                        case DialogButtons.RetryCancel:
                            this.vBtnRetry = true;
                            this.vBtnCancel = true;
                            break;
                        case DialogButtons.YesNo:
                            this.vBtnYes = true;
                            this.vBtnNo = true;
                            break;
                        case DialogButtons.YesNoCancel:
                            this.vBtnYes = true;
                            this.vBtnNo = true;
                            this.vBtnCancel = true;
                            break;
                        default:
                            this.vBtnOk = true;
                            break;
                    }

                    // icon
                    this.handleIcon(this.confirmation.icon);

                    // callbacks
                    if (this.confirmation.ok) {
                        this.confirmation.okEvent = new EventEmitter();
                        this.confirmation.okEvent.subscribe(this.confirmation.ok);
                    }
                    if (this.confirmation.cancel) {
                        this.confirmation.cancelEvent = new EventEmitter();
                        this.confirmation.cancelEvent.subscribe(this.confirmation.cancel);
                    }
                    if (this.confirmation.yes) {
                        this.confirmation.yesEvent = new EventEmitter();
                        this.confirmation.yesEvent.subscribe(this.confirmation.yes);
                    }
                    if (this.confirmation.no) {
                        this.confirmation.noEvent = new EventEmitter();
                        this.confirmation.noEvent.subscribe(this.confirmation.no);
                    }
                    if (this.confirmation.retry) {
                        this.confirmation.retryEvent = new EventEmitter();
                        this.confirmation.retryEvent.subscribe(this.confirmation.retry);
                    }
                    this.Status = 2;

                    this.text = x.text;
                    this.title = x.title;
                }
            });
    }

    ngOnDestroy() {
        this.confirmation = undefined;
    }

    private hideAllButtons(): void {
        this.vBtnOk = this.vBtnCancel
            = this.vBtnYes = this.vBtnNo
            = this.vBtnRetry = false;
    }
    private handleIcon(icon?: DialogIcons): void {
        if (icon == undefined || icon == DialogIcons.None) {
            this.showIcon = false;
            return;
        }

        this.showIcon = true;
        switch (icon) {
            case DialogIcons.Info:
                this.iconClass = 'info';
                break;
            case DialogIcons.Warning:
                this.iconClass = 'exclamation';
                break;
            case DialogIcons.Error:
                this.iconClass = 'times';
                break;
            case DialogIcons.Question:
                this.iconClass = 'question';
                break;
        }
    }

    private Clicked(deger: number): void {
        if (this.confirmation) {
            if (this.confirmation.okEvent && this.confirmation.okEvent.closed == false) {
                if (deger == 0) this.confirmation.okEvent.emit();
                this.confirmation.okEvent.unsubscribe();
                this.confirmation.okEvent = undefined;
            }
            if (this.confirmation.cancelEvent && this.confirmation.cancelEvent.closed == false) {
                if (deger == 1) this.confirmation.cancelEvent.emit();
                this.confirmation.cancelEvent.unsubscribe();
                this.confirmation.cancelEvent = undefined;
            }
            if (this.confirmation.yesEvent && this.confirmation.yesEvent.closed == false) {
                if (deger == 2) this.confirmation.yesEvent.emit();
                this.confirmation.yesEvent.unsubscribe();
                this.confirmation.yesEvent = undefined;
            }
            if (this.confirmation.noEvent && this.confirmation.noEvent.closed == false) {
                if (deger == 3) this.confirmation.noEvent.emit();
                this.confirmation.noEvent.unsubscribe();
                this.confirmation.noEvent = undefined;
            }
            if (this.confirmation.retryEvent && this.confirmation.retryEvent.closed == false) {
                if (deger == 4) this.confirmation.retryEvent.emit();
                this.confirmation.retryEvent.unsubscribe();
                this.confirmation.retryEvent = undefined;
            }
        }

        this.Status = 0;
    }
}

// 25.03.2018
// ismail sarıkaya
 */