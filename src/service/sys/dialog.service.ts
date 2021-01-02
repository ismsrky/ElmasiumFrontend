import { Injectable, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { DialogBo } from '../../bo/sys/dialog.bo';
import { DialogIcons } from '../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../enum/sys/dialog/dialog-buttons.enum';

@Injectable()
export class DialogService {
    private _eventBus: Subject<DialogBo>;
    constructor() {
        this._eventBus = new Subject<DialogBo>();
    }

    getBaby(): Observable<DialogBo> {
        return this._eventBus.asObservable();
    }

    show(dialogBo: DialogBo) {
        //const dialogBo = new DialogBo();
        //dialogBo.text = text;

        setTimeout(() => {
            this._eventBus.next(dialogBo);

            this.requireConfirmationSource.next(dialogBo);
            return this;
        }, 400);
    }
    showError(msg: string): void {
        this.show({
            text: msg,
            icon: DialogIcons.Error,
            buttons: DialogButtons.OK,
            closeIconVisible: true
        });
    }
    private requireConfirmationSource = new Subject<DialogBo>();
}

/**
import { Injectable, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { DialogBo, DialogSimpleBo } from '../../bo/sys/dialog.bo';
import { DialogButtons } from '../../enum/sys/dialog/dialog-buttons.enum';
import { DialogIcons } from '../../enum/sys/dialog/dialog-icons.enum';
import { Dialog } from 'primeng/dialog';

@Injectable()
export class DialogService {
    private _eventBus: Subject<DialogSimpleBo>;

    private requireConfirmationSource = new Subject<DialogBo>();
    private resultConfirmationSource = new Subject<DialogBo>();

    requireConfirmation$ = this.requireConfirmationSource.asObservable();
    //result = this.resultConfirmationSource.asObservable();

    constructor() {
        this._eventBus = new Subject<DialogBo>();
    }
    show(text: string, title: string, icon = DialogIcons.None) {
        const dialogBo = new DialogSimpleBo();
        dialogBo.text = text;
        dialogBo.title = title;
        dialogBo.icon = icon;
        dialogBo.width=undefined;
        /**
         * if (text.length <= 23) {
            dialogBo.width = 350;
        } else if (text.length > 23) {
            dialogBo.width = 450;
        } else {
            dialogBo.width = undefined;
        }

        this._eventBus.next(dialogBo);
    }
    showAsync(confirmation: DialogBo) {
        this.requireConfirmationSource.next(confirmation);
        return this;
    }

    getBaby(): Observable<DialogSimpleBo> {
        return this._eventBus.asObservable();
    }

    getNaber(): Observable<DialogBo> {
        return this.requireConfirmationSource.asObservable();
    }
} */