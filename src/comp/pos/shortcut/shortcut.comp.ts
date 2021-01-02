import { Component, OnInit, OnDestroy, Host, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { PosComp } from '../pos.comp';
import { PosShortCutGroupComp } from './group/group.comp';

// Service
import { PosService } from '../../../service/pos/pos.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { UtilService } from '../../../service/sys/util.service';


// Dto
import { PosProductShortCutGroupListDto } from '../../../dto/pos/product-shortcut-group-list.dto';
import { PosProductShortCutListDto } from '../../../dto/pos/product-shortcut-list.dto';
import { PosProductShortCutGroupDto } from '../../../dto/pos/product-shortcut-group.dto';
import { PosProductShortCutDto } from '../../../dto/pos/product-shortcut.dto';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { LogExceptionService } from '../../../service/log/exception.service';

@Component({
    selector: 'pos-shortcut',
    templateUrl: './shortcut.comp.html'
})
export class PosShortCutcomp implements OnInit, OnDestroy {
    host: PosComp;

    shortcutList: PosProductShortCutGroupListDto[];
    selectedGroup: PosProductShortCutGroupListDto;
    tabPageIndex: number = 0;

    subsNeedRefresh: Subscription;
    subsItemAdded: Subscription;
    subsModalClosed: Subscription;

    @ViewChild(PosShortCutGroupComp, { static: false }) groupComp: PosShortCutGroupComp;

    busy: boolean = false;
    isGroupModalOpen: boolean = false;

    constructor(
        @Host() host: PosComp,
        private posService: PosService,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.host = host;

        this.shortcutList = [];
        this.selectedGroup = null;

        this.loadData();
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            message => {
                if (message == 'ProfileChanged') {
                    this.loadData();
                }
            });

        this.subsModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'PosProductShortCutGroup') {
                    this.isGroupModalOpen = false;
                }
            });

        this.addShortcut();
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
        this.utils.unsubs(this.subsItemAdded);
        this.utils.unsubs(this.subsModalClosed);
    }

    saveGroup(groupListDto: PosProductShortCutGroupListDto): void {
        const groupDto: PosProductShortCutGroupDto = new PosProductShortCutGroupDto()

        if (this.utils.isNull(groupListDto)) {
            groupDto.Id = null;
            groupDto.Name = null;
        } else {
            groupDto.Id = this.selectedGroup.Id;
            groupDto.Name = this.selectedGroup.Name;
        }
        groupDto.ShopId = this.host.ficheDto.CreditPersonId;

        this.openModal(groupDto);
    }

    openModal(groupDto: PosProductShortCutGroupDto) {
        this.isGroupModalOpen = true;
        let isNew: boolean = this.utils.isNull(groupDto.Id) || groupDto.Id <= 0;
        /**
         * const groupDto: PosProductShortCutGroupDto = new PosProductShortCutGroupDto();
        if (this.utils.isNull(this.selectedGroup)) {
            groupDto.Id = null;
            groupDto.Name = null;
        } else {
            groupDto.Id = this.selectedGroup.Id;
            groupDto.Name = this.selectedGroup.Name;
        }
        groupDto.ShopId = this.host.ficheDto.CreditPersonId;
         */

        setTimeout(() => this.groupComp.showModal(groupDto).subscribe(
            x => {
                if (isNew) {
                    const newGroupList: PosProductShortCutGroupListDto = new PosProductShortCutGroupListDto();
                    newGroupList.Id = groupDto.Id;
                    newGroupList.Name = groupDto.Name;
                    newGroupList.ProductList = [];

                    this.shortcutList.push(newGroupList);

                    this.tabPageSelected(newGroupList);
                } else {
                    this.shortcutList.find(y => y.Id == groupDto.Id).Name = groupDto.Name;
                }
            }
        ));
    }

    loadData(): void {
        this.busy = true;
        this.selectedGroup = null;
        let subs = this.posService.getShortCutList(this.localStorageService.personProfile.PersonId).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess && x.Dto) {
                    this.shortcutList = x.Dto;

                    if (x.Dto.length > 0) {
                        this.tabPageSelected(this.shortcutList[0]);
                    }
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    tabPageSelected(shortcutGroup: PosProductShortCutGroupListDto): void {
        this.shortcutList.forEach(element => {
            element.Selected = element.Id == shortcutGroup.Id;

            if (element.Selected) {
                this.selectedGroup = element;
            }
        });
    }

    productTapped(shortcut: PosProductShortCutListDto): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, JSON.stringify({ 'PosProductShortcut': shortcut.ProductId }));
    }

    productPress(shortcut: PosProductShortCutListDto): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.deleteShortcut(shortcut);
            }
        });
    }

    groupPress(shortcutGroup: PosProductShortCutGroupListDto): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.deleteShortcutGroup(shortcutGroup);
            }
        });
    }

    addShortcut(): void {
        this.subsItemAdded = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ItemAdded).subscribe(
            message => {
                if (this.utils.isNotNull(message) && this.utils.isString(message) && message.includes('PosProductShortcut')) {
                    if (this.utils.isNull(this.shortcutList) || this.shortcutList.length == 0) {
                        this.toastr.warning('Lütfen bir grup ekleyiniz.');
                        return;
                    }
                    if (this.utils.isNull(this.selectedGroup)) {
                        this.toastr.warning('Lütfen bir grup seçiniz.');
                        return;
                    }
                    const productId: number = JSON.parse(message).PosProductShortcut.productId;
                    const productName: string = JSON.parse(message).PosProductShortcut.productName;

                    if (this.utils.isNull(this.selectedGroup.ProductList)) {
                        this.selectedGroup.ProductList = [];
                    }
                    // No need to go to serve to understand this.
                    // Despite this, the server will check again inside.
                    if (this.utils.isNull(this.selectedGroup.ProductList.find(x => x.ProductId == productId))) {
                        const posProductShortCutDto: PosProductShortCutDto = new PosProductShortCutDto();
                        posProductShortCutDto.ProductId = productId;
                        posProductShortCutDto.ShopId = this.host.ficheDto.CreditPersonId;
                        posProductShortCutDto.GroupId = this.selectedGroup.Id;
                        this.busy = true;
                        let subs = this.posService.saveShortCut(posProductShortCutDto).subscribe(
                            x => {
                                this.utils.unsubs(subs);
                this.busy = false;

                                if (x.IsSuccess) {
                                    const t_product: PosProductShortCutListDto = new PosProductShortCutListDto();
                                    t_product.Id = x.ReturnedId;
                                    t_product.ProductId = productId;
                                    t_product.ProductName = productName;
                                    this.selectedGroup.ProductList.push(t_product);

                                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                                } else {
                                    this.dialogService.showError(x.Message);
                                }
                            },
                            err => {
                                this.logExService.saveObservableEx(err, this.constructor.name, 'addShortcut', subs);
                this.busy = false;
                            }
                        );
                    } else { // This product already added to selected group.
                        this.toastr.warning(this.dicService.getValue('xPosProductShortCutExist'));
                    }
                }
            });
    }

    deleteShortcut(shortcut: PosProductShortCutListDto) {
        this.busy = true;

        const deleteDto = new PosProductShortCutDto();
        deleteDto.Id = shortcut.Id;
        deleteDto.ProductId = shortcut.ProductId;
        deleteDto.ShopId = this.host.ficheDto.CreditPersonId;
        deleteDto.GroupId = this.selectedGroup.Id;

        let subs = this.posService.deleteShortCut(deleteDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    const ind: number = this.selectedGroup.ProductList.findIndex(y => y.Id == shortcut.Id);
                    this.selectedGroup.ProductList.splice(ind, 1);

                    this.toastr.success(this.dicService.getValue('xDeletedSuccess'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'deleteShortcut', subs);
                this.busy = false;
            }
        );
    }

    deleteShortcutGroup(shortcutGroup: PosProductShortCutGroupListDto) {
        this.busy = true;

        const posProductShortCutGroupDto: PosProductShortCutGroupDto = new PosProductShortCutGroupDto();
        posProductShortCutGroupDto.Id = shortcutGroup.Id;
        posProductShortCutGroupDto.Name = shortcutGroup.Name;
        posProductShortCutGroupDto.ShopId = this.host.ficheDto.CreditPersonId;

        let subs = this.posService.deleteShortCutGroup(posProductShortCutGroupDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    const ind: number = this.shortcutList.findIndex(y => y.Id == shortcutGroup.Id);
                    this.shortcutList.splice(ind, 1);

                    if (this.shortcutList.length > 0) {
                        this.tabPageSelected(this.shortcutList[0]);
                    } else {
                        this.selectedGroup = null;
                    }

                    this.toastr.success(this.dicService.getValue('xDeletedSuccess'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'deleteShortcut', subs);
                this.busy = false;
            }
        );
    }
}