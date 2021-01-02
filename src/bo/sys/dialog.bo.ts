/**import { EventEmitter } from '@angular/core';
import { DialogButtons } from "../../enum/sys/dialog/dialog-buttons.enum";
import { DialogIcons } from '../../enum/sys/dialog/dialog-icons.enum';

export class DialogBo {
    title: string;
    text: string;
    btns: DialogButtons;
    icon?: DialogIcons;
    width?: number; // undefined means auto.

    okEvent?: EventEmitter<any>;
    ok?: Function;

    cancelEvent?: EventEmitter<any>;
    cancel?: Function;

    yesEvent?: EventEmitter<any>;
    yes?: Function;

    noEvent?: EventEmitter<any>;
    no?: Function;

    retryEvent?: EventEmitter<any>;
    retry?: Function;
}

export class DialogSimpleBo {
    title: string;
    text: string;
    icon?: DialogIcons;
    width?: number; // undefined means auto.
} */

import { EventEmitter } from '@angular/core';
import { DialogIcons } from '../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../enum/sys/dialog/dialog-buttons.enum';

export class DialogBo {
    constructor() {
        this.text = '';
        this.icon = DialogIcons.None;
        this.buttons = DialogButtons.YesNo;

        this.ignoreBackdropClick = true;
        this.closeIconVisible = true;
    }
    text: string;
    icon: DialogIcons;
    buttons: DialogButtons;
    ignoreBackdropClick?: boolean;
    closeIconVisible?: boolean;

    okEvent?: EventEmitter<any>;
    ok?: Function;

    cancelEvent?: EventEmitter<any>;
    cancel?: Function;

    yesEvent?: EventEmitter<any>;
    yes?: Function;

    noEvent?: EventEmitter<any>;
    no?: Function;

    retryEvent?: EventEmitter<any>;
    retry?: Function;
}