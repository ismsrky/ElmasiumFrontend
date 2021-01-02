/**
 * 
 * 
// System
import { Component, OnInit, Input } from '@angular/core';

// Enum
import { AlertTypes } from '../../../enum/sys/alert-types.enums';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.comp.html'
})
export class AppAlertComp implements OnInit {
    constructor() {
    }

    imgSrc: string = '';
    isShowAlert: boolean = false;
    Msg: string = '';
    AlertTypeClas: string = '';
    Closable: boolean = true;

    private doScroll: boolean = false;
    private scrollX: number = 0;
    private scrollY: number = 0;

    ngOnInit() {
        this.reset();
    }

    ngOnDestroy() {
    }

    show(msg: string, type: AlertTypes, closable: boolean = true): void {
        if (window.scrollX > 0 || window.scrollY > 0) {
            this.doScroll = true;
            this.scrollX = window.scrollX;
            this.scrollY = window.scrollY;

            scroll(0, 0);
        } else {
            this.doScroll = false;
        }

        this.isShowAlert = true;

        this.Msg = msg;

        switch (type) {
            case AlertTypes.Success:
                this.AlertTypeClas = 'alert-success';
                this.imgSrc = '../../../assets/success.png';
                break;
            case AlertTypes.Info:
                this.AlertTypeClas = 'alert-info';
                this.imgSrc = '../../../assets/info.png';
                break;
            case AlertTypes.Warning:
                this.AlertTypeClas = 'alert-warning';
                this.imgSrc = '../../../assets/warning.png';
                break;
            case AlertTypes.Danger:
                this.AlertTypeClas = 'alert-danger';
                this.imgSrc = '../../../assets/danger.png';
                break;
            default:
                this.AlertTypeClas = 'alert-info';
                this.imgSrc = '../../../assets/info.png';
                break;
        }
    }

    close(): void {
        if (this.doScroll) {
            scroll(this.scrollX, this.scrollY + 65);
        }
        this.reset();
    }

    private reset() {
        this.isShowAlert = false;
        this.Msg = '';
        this.Closable = true;
        this.AlertTypeClas = '';
        this.imgSrc = '';
    }
}
 */