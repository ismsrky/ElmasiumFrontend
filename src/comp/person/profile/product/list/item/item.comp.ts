import { Component, OnInit, OnDestroy, Host, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Comp
import { PersonProfileProductListIndexComp } from '../index.comp';
import { PersonProductSettingComp } from '../../../../product/setting/setting.comp';

// Service
import { CompBroadCastService } from '../../../../../../service/sys/comp-broadcast-service';
import { UtilService } from '../../../../../../service/sys/util.service';

// Dto
import { PersonProfileProductListDto } from '../../../../../../dto/person/product/profile-list.dto';

// Enum
import { Currencies } from '../../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../../enum/sys/stats.enum';
import { ProductTypes } from '../../../../../../enum/product/types.enum';
import { ProductCodeTypes } from '../../../../../../enum/product/code-types.enum';
import { environment } from '../../../../../../environments/environment';
import { expandCollapse } from '../../../../../../stc';

@Component({
    selector: 'person-profile-product-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class PersonProfileProductListItemComp implements OnInit, OnDestroy {
    host: PersonProfileProductListIndexComp;

    isSettingsOpen: boolean = false;

    @ViewChild(PersonProductSettingComp, { static: false }) childPersonProductSettingComp: PersonProductSettingComp;

    @Input('listItem') listItem: PersonProfileProductListDto;

    subsSaved: Subscription;
    subscriptionModalClosed: Subscription;

    currencies = Currencies;
    stats = Stats;
    productTypes = ProductTypes;
    productCodeTypes = ProductCodeTypes;
    environment = environment;

    isShowActivity: boolean = false;
    busy: boolean = false;

    constructor(@Host() host: PersonProfileProductListIndexComp,
        private router: Router,
        private utils: UtilService) {
        this.host = host;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showSettingGeneral(): void {
        this.isSettingsOpen = !this.isSettingsOpen;

        if (!this.isSettingsOpen) return;

        setTimeout(() => {
            this.childPersonProductSettingComp.showById(this.listItem.Id);
        });
    }

    goToProductProfile(): void {
        this.router.navigateByUrl(this.listItem.ProductProfileUrl);
    }
}