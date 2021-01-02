import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// Comp
import { PersonProfileComp } from '../../person/profile/profile.comp';
import { PersonProductProfileComp } from '../../person/product/profile/profile.comp';

// Service
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { UtilService } from '../../../service/sys/util.service';

// Dto

// Enum

@Component({
    selector: 'app-comp-selector',
    templateUrl: './comp-selector.comp.html'
})
export class AppCompSelectorComp {
    showPersonProfile: boolean = false;
    showProductProfile: boolean = false;
    showProductFilter: boolean = false;
    showAppNoPage: boolean = false;

    productCategoryUrlNameList: string[] = ['shopping', 'service', 'food-beverage'];

    @ViewChild(PersonProfileComp, { static: false }) childPersonProfileComp: PersonProfileComp;
    @ViewChild(PersonProductProfileComp, { static: false }) childPersonProductProfileComp: PersonProductProfileComp;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService) {
        const urlParsedList = this.router.url.split('/');

        if (this.utils.isNull(urlParsedList)) {
            this.showAppNoPage = true;
            return;
        }
        const length = this.activatedRoute.snapshot.url.length;

        const firstSegment: string = length > 0 ? this.activatedRoute.snapshot.url[0].path : null;
        const secondSegment: string = length > 1 ? this.activatedRoute.snapshot.url[1].path : null;

        if (this.utils.isNotNull(this.productCategoryUrlNameList.find(f => f == firstSegment))) {
            this.showProductFilter = true;
        } else if (length == 1) {
            this.navigatePerson(firstSegment);
        } else if (length == 2) {
            this.navigatePersonProduct(firstSegment, secondSegment);
        }
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    navigatePerson(firstSegment: string): void {
        this.showPersonProfile = true;

        setTimeout(() => {
            this.childPersonProfileComp.show(firstSegment);
        });
    }

    navigatePersonProduct(firstSegment: string, secondSegment: string): void {
        //let productCode: string = secondSegment;
        /**
         * if (this.utils.isPositiveInteger(secondSegment)) {
            productId = Number(secondSegment);
        }
         */

        if (this.utils.isNull(secondSegment)) {
            this.showAppNoPage = true;
        } else {
            this.showProductProfile = true;

            setTimeout(() => {
                this.childPersonProductProfileComp.show(firstSegment, secondSegment);
            });
        }
    }
}