import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

// Service
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { RealPersonService } from '../../../service/person/real.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { UtilService } from '../../../service/sys/util.service';
import { LogExceptionService } from '../../../service/log/exception.service';

// Dto
import { DictionaryGetListCriteriaDto } from '../../../dto/dictionary/getlist-criteria.dto';
import { LanguageDto } from '../../../dto/dictionary/language.dto';

// Enum
import { Languages } from '../../../enum/sys/languages.enum';
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { Stc } from '../../../stc';

@Component({
    selector: 'lang-select',
    templateUrl: './lang-select.comp.html'
})
export class LangSelectComp {
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    selectedLang: Languages;
    langList = Languages;

    busy: boolean = false;

    constructor(
        private localStorageService: LocalStorageService,
        private realPersonService: RealPersonService,
        private _localeService: BsLocaleService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.selectedLang = localStorageService.LangId;
    }

    showModal(): void {
        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'LangSelect');
            }
        );

        this.modal.show();
    }

    langChanged(): void {
        let lang: LanguageDto = Stc.languagesDto.find(x => x.Id == this.selectedLang);
        this._localeService.use(lang.CultureCode);

        const criteriaDto = new DictionaryGetListCriteriaDto();
        criteriaDto.LanguageId = this.selectedLang;
        criteriaDto.ChangeSetID = this.localStorageService.getDicChangeSetId(this.selectedLang);

        this.busy = true;
        let subs = this.realPersonService.changeLanguage(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.localStorageService.LangId = this.selectedLang;

                    if (this.utils.isNotNull(x.Dto)) {
                        this.localStorageService.setDics(this.selectedLang, x.Dto);
                    }

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'LanguageChanged');
                    this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'PersonMenu');
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'langChanged', subs);
                this.busy = false;
            }
        );

        this.modal.hide();
    }
}