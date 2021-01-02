import { RouterStateSnapshot, ActivatedRouteSnapshot, CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PosComp } from './pos.comp';
import { DialogService } from '../../service/sys/dialog.service';
import { DialogIcons } from '../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../enum/sys/dialog/dialog-buttons.enum';
import { DictionaryService } from '../../service/dictionary/dictionary.service';
import { Subject } from 'rxjs';

@Injectable()
export class PosGuard implements CanDeactivate<PosComp> {
    private resultcanDeactivate = new Subject<boolean>();

    constructor(private dialogService: DialogService,
        private dicService: DictionaryService) {

    }

    canDeactivate(component: PosComp,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> {
        let canDe = component.canDeactivate();
        setTimeout(() => {
            if (canDe) {
                this.resultcanDeactivate.next(true);
            } else {
                this.dialogService.show({
                    text: this.dicService.getValue('xConfirmCancelPos'),
                    icon: DialogIcons.Warning,
                    buttons: DialogButtons.YesNo,
                    closeIconVisible: true,
                    yes: () => {
                        this.resultcanDeactivate.next(true);
                    },
                    no: () => {
                        this.resultcanDeactivate.next(false);
                    }
                });
            }
        });
        
        return this.resultcanDeactivate.asObservable();
    }
}