// Angular
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app.routing';

// Extentions
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome'
import { ToastrModule } from 'ngx-toastr';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';
import { NgxMaskModule } from 'ngx-mask';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgSelectModule } from '@ng-select/ng-select';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { RatingModule } from 'ngx-bootstrap/rating';
import { NgxCurrencyModule } from "ngx-currency";
import { TreeNgxModule } from './tree-ngx';
import { ImageCropperModule } from 'ngx-image-cropper';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { InViewportModule } from 'ng-in-viewport';

// Components
import { AppComponent } from './app.component';
import { NewComp } from '../comp/new/new.comp';
import { AppAbout } from '../comp/general/about/about.comp';
import { AppSiteMapComp } from '../comp/general/site-map/site-map.comp';

import { DashBoardComp } from '../comp/dashboard/dashboard.comp';
import { DashboardSliderComp } from '../comp/dashboard/slider/slider.comp';

import { PersonMyProfileComp } from '../comp/person/my-profile/my-profile.comp';
import { PersonMyProfileGeneralComp } from '../comp/person/my-profile/general/general.comp';

import { PersonProfileComp } from '../comp/person/profile/profile.comp';
import { PersonProfileImageSelectComp } from '../comp/person/profile/image-select/image-select.comp';

import { PersonProfileProductListItemComp } from '../comp/person/profile/product/list/item/item.comp';
import { PersonProfileProductListIndexComp } from '../comp/person/profile/product/list/index.comp';

import { PersonSettingShopGeneralComp } from '../comp/person/setting/shop/general/general.comp';
import { PersonSettingShopOrderGeneralComp } from '../comp/person/setting/shop/order/general/general.comp';
import { PersonSettingShopOrderWorkingHoursComp } from '../comp/person/setting/shop/order/working-hour/working-hours.comp';
import { PersonSettingShopOrderWorkingHoursDayComp } from '../comp/person/setting/shop/order/working-hour/day.comp';

import { PersonSettingShopOrderAreaListIndexComp } from '../comp/person/setting/shop/order/area/list/index.comp';
import { PersonSettingShopOrderAreaListItemComp } from '../comp/person/setting/shop/order/area/list/item/item.comp';

import { PersonSettingShopOrderAreaNewComp } from '../comp/person/setting/shop/order/area/new/new.comp';
import { PersonSettingShopOrderAreaCrudComp } from '../comp/person/setting/shop/order/area/crud/crud.comp';

import { PersonNewShopCrudComp } from '../comp/person/new/shop/shop.comp';

import { PersonMineSelectComp } from '../comp/person/mine/select/select.comp';
import { PersonMineCurrencyComp } from '../comp/person/mine/currency/currency.comp';

import { PersonAddressListIndexComp } from '../comp/person/address/list/index.comp';
import { PersonAddressListItemComp } from '../comp/person/address/list/item/item.comp';
import { PersonAddressListViewComp } from '../comp/person/address/list/view/view.comp';
import { PersonAddressListCriteriaComp } from '../comp/person/address/list/criteria/criteria.comp';
import { PersonAddressCrudComp } from '../comp/person/address/crud/crud.comp';

import { PersonAccountListIndexComp } from '../comp/person/account/list/index.comp';
import { PersonAccountListItemComp } from '../comp/person/account/list/item/item.comp';
import { PersonAccountListCriteriaComp } from '../comp/person/account/list/criteria/criteria.comp';
import { PersonAccountCrudComp } from '../comp/person/account/crud/crud.comp';

import { PersonProductListIndexComp } from '../comp/person/product/list/index.comp';
import { PersonProductListItemComp } from '../comp/person/product/list/item/item.comp';
import { PersonProductListCriteriaComp } from '../comp/person/product/list/criteria/criteria.comp';
import { PersonProductProfileComp } from '../comp/person/product/profile/profile.comp';

import { PersonAccountActivityListIndexComp } from '../comp/person/account/activity/list/index.comp';
import { PersonAccountActivityListCriteriaComp } from '../comp/person/account/activity/list/criteria/criteria.comp';
import { PersonAccountActivityListItemComp } from '../comp/person/account/activity/list/item/item.comp';

import { PersonProductActivityListIndexComp } from '../comp/person/product/activity/list/index.comp';
import { PersonProductActivityListCriteriaComp } from '../comp/person/product/activity/list/criteria/criteria.comp';
import { PersonProductActivityListItemComp } from '../comp/person/product/activity/list/item/item.comp';

import { PersonProductSettingComp } from '../comp/person/product/setting/setting.comp';
import { PersonProductSettingGeneralComp } from '../comp/person/product/setting/general/general.comp';

import { PersonRelationListIndexComp } from '../comp/person/relation/list/index.comp';
import { PersonRelationListCriteriaComp } from '../comp/person/relation/list/criteria/criteria.comp';
import { PersonRelationListItemComp } from '../comp/person/relation/list/item/item.comp';

import { PersonRelationFindListIndexComp } from '../comp/person/relation/find/list/index.comp';
import { PersonRelationFindListCriteriaComp } from '../comp/person/relation/find/list/criteria/criteria.comp';
import { PersonRelationFindListItemComp } from '../comp/person/relation/find/list/item/item.comp';

import { PersonAloneCrudComp } from '../comp/person/alone/crud/crud.comp';

import { PersonVerifyPhoneComp } from '../comp/person/verify-phone/verify-phone.comp';

import { FicheListIndexComp } from '../comp/fiche/list/index.comp';
import { FicheListItemComp } from '../comp/fiche/list/item/item.comp';
import { FicheListItemModalComp } from '../comp/fiche/list/item/modal/modal.comp';
import { FicheListItemProductListComp } from '../comp/fiche/list/item/product-list/product-list.comp';
import { FicheListItemMoneyListComp } from '../comp/fiche/list/item/money-list/money-list.comp';
import { FicheListCriteriaComp } from '../comp/fiche/list/criteria/criteria.comp';

import { FicheCrudComp } from '../comp/fiche/crud/crud.comp';
import { FicheCrudHeaderComp } from '../comp/fiche/crud/header/header.comp';
import { FicheMoneyOneComp } from '../comp/fiche/crud/money/one/one.comp';
import { FicheProductListItemComp } from '../comp/fiche/crud/product/list/item/item.comp';
import { FicheProductListIndexComp } from '../comp/fiche/crud/product/list/index.comp';
import { FicheRelationListItemComp } from '../comp/fiche/crud/relation/list/item/item.comp';
import { FicheRelationListIndexComp } from '../comp/fiche/crud/relation/list/index.comp';

import { FicheSearchCriteriaComp } from '../comp/fiche/search/criteria/criteria.comp';
import { FicheSearchListItemComp } from '../comp/fiche/search/list/item/item.comp';
import { FicheSearchListIndexComp } from '../comp/fiche/search/list/index.comp';
import { FicheSearchIndexComp } from '../comp/fiche/search/index.comp';

import { FicheApprovalHistoryListComp } from '../comp/fiche/approval-history/approval-history.comp';

import { PosComp } from '../comp/pos/pos.comp';
import { PosProductListIndexComp } from '../comp/pos/product/index.comp';
import { PosProductListItemComp } from '../comp/pos/product/item/item.comp';
import { PosShortCutcomp } from '../comp/pos/shortcut/shortcut.comp';
import { PosShortCutGroupComp } from '../comp/pos/shortcut/group/group.comp';
import { PosPaymentComp } from '../comp/pos/payment/payment.comp';
import { PosSeePriceComp } from '../comp/pos/see-price/see-price.comp';

import { TableGroupCrudComp } from '../comp/table/group/crud/crud.comp';
import { TableGroupListComp } from '../comp/table/group/list/list.comp';

import { TableCrudComp } from '../comp/table/crud/crud.comp';
import { TableListItemComp } from '../comp/table/list/item/item.comp';
import { TableListComp } from '../comp/table/list/list.comp';

import { TableComp } from '../comp/table/table.comp';

import { LayoutNavbarTopComp } from '../comp/layout/navbar/top/top.comp';
import { LayoutNavbarBottomComp } from '../comp/layout/navbar/bottom/bottom.comp';
import { LayoutFooterComp } from '../comp/layout/footer/footer.comp';

import { AuthLoginComp } from "../comp/auth/login/login.comp";
import { AuthRegisterComp } from "../comp/auth/register/register.comp";
import { AuthForgotPassComp } from "../comp/auth/forgot-password/forgot-password.comp";
import { AuthVerifyEmailComp } from '../comp/auth/verify-email/verify-email.comp';

import { PersonSearchCriteriaComp } from '../comp/person/search/criteria/criteria.comp';
import { PersonSearchListItemComp } from '../comp/person/search/list/item/item.comp';
import { PersonSearchListIndexComp } from '../comp/person/search/list/index.comp';
import { PersonSearchIndexComp } from '../comp/person/search/index.comp';

import { PersonAccountSearchCriteriaComp } from '../comp/person/account/search/criteria/criteria.comp';
import { PersonAccountSearchListItemComp } from '../comp/person/account/search/list/item/item.comp';
import { PersonAccountSearchListIndexComp } from '../comp/person/account/search/list/index.comp';
import { PersonAccountSearchIndexComp } from '../comp/person/account/search/index.comp';

import { PersonProductSearchCriteriaComp } from '../comp/person/product/search/criteria/criteria.comp';
import { PersonProductSearchListItemComp } from '../comp/person/product/search/list/item/item.comp';
import { PersonProductSearchListIndexComp } from '../comp/person/product/search/list/index.comp';
import { PersonProductSearchIndexComp } from '../comp/person/product/search/index.comp';

import { NotificationSmallListItemComp } from '../comp/notification/small/list/item/item.comp';
import { NotificationSmallListIndexComp } from '../comp/notification/small/list/index.comp';
import { NotificationPreferenceComp } from '../comp/notification/preference/preference.comp';

import { ApprovalAllComp } from '../comp/approval/all/all.comp';
import { ApprovalFicheSmallListIndexComp } from '../comp/approval/fiche/small/list/index.comp';
import { ApprovalFicheSmallListItemComp } from '../comp/approval/fiche/small/list/item/item.comp';

import { ApprovalRelationSmallListIndexComp } from '../comp/approval/relation/small/list/index.comp';
import { ApprovalRelationSmallListItemComp } from '../comp/approval/relation/small/list/item/item.comp';

import { ApprovalFicheChoiceIndexComp } from '../comp/approval/fiche/choice/index.comp';
import { ApprovalFicheChoiceItemComp } from '../comp/approval/fiche/choice/item/item.comp';

import { ProductOfferComp } from '../comp/product/offer/offer.comp';
import { ProductOfferCriteriaComp } from '../comp/product/offer/criteria/criteria.comp';
import { ProductCodeListComp } from '../comp/product/code/list/list.comp';
import { ProductNewComp } from '../comp/product/new/new.comp';

import { ProductFilterCategoryComp } from '../comp/product/filter/category/category.comp';
import { ProductFilterPropertyComp } from '../comp/product/filter/property/property.comp';
import { ProductFilterOtherComp } from '../comp/product/filter/other/other.comp';
import { ProductFilterSelectedComp } from '../comp/product/filter/selected/selected.comp';
import { ProductFilterListItemComp } from '../comp/product/filter/list/item/item.comp';
import { ProductFilterListIndexComp } from '../comp/product/filter/list/index.comp';
import { ProductFilterIndexComp } from '../comp/product/filter/index.comp';

import { ProductCategorySearchComp } from '../comp/product/category/search/search.comp';
import { ProductCategoryBreadcrumbComp } from '../comp/product/category/breadcrumb/breadcrumb.comp';

import { WarningCrudComp } from '../comp/warning/crud/crud.comp';
import { ImageUploadComp } from '../comp/image/upload/upload.comp';

import { PropertyCrudComp } from '../comp/property/crud/crud.comp';
import { PropertyListComp } from '../comp/property/list/list.comp';

import { OptionCrudComp } from '../comp/option/crud/crud.comp';
import { OptionListComp } from '../comp/option/list/list.comp';
import { OptionSelectComp } from '../comp/option/select/select.comp';

import { IncludeExcludeCrudComp } from '../comp/include-exclude/crud/crud.comp';
import { IncludeExcludeFindComp } from '../comp/include-exclude/find/find.comp';
import { IncludeExcludeListComp } from '../comp/include-exclude/list/list.comp';
import { IncludeExcludeSelectComp } from '../comp/include-exclude/select/select.comp';

import { CommentCrudComp } from '../comp/comment/crud/crud.comp';
import { CommentListItemComp } from '../comp/comment/list/item/item.comp';
import { CommentListIndexComp } from '../comp/comment/list/index.comp';

import { BasketListItemComp } from '../comp/basket/list/item/item.comp';
import { BasketListIndexComp } from '../comp/basket/list/index.comp';

import { BasketAddComp } from '../comp/basket/add/add.comp';

import { OrderCreateComp } from '../comp/order/create/create.comp';
import { OrderListItemComp } from '../comp/order/list/item/item.comp';
import { OrderListIndexComp } from '../comp/order/list/index.comp';

import { OrderStatHistoryCrudComp } from '../comp/order/stat/history/crud/crud.comp';

import { AddressBreadcrumbComp } from '../comp/address/breadcrumb/breadcrumb.comp';

// General Components
import { LangSelectComp } from '../comp/general/lang-select/lang-select.comp';
import { PageTitleComp } from '../comp/general/page-title/page-title.comp';
import { NoPageComp } from '../comp/general/nopage/nopage.comp';
import { AppDialogComp } from '../comp/general/dialog/dialog.comp';
import { CurrencyIconComp } from '../comp/general/currency-icon/currency-icon.comp';
import { AppStarComp } from '../comp/general/star/star.comp';
import { AppCompSelectorComp } from '../comp/general/comp-selector/comp-selector.comp';
import { AppModalComp } from '../comp/general/modal/modal.comp';
import { AppPagerComp } from '../comp/general/pager/pager.comp';

// Outside Service
import { WsService } from '../service/sys/ws.service';
import { AuthService } from '../service/auth/auth.service';
import { LanguageService } from '../service/dictionary/language.service';
import { DictionaryService } from '../service/dictionary/dictionary.service';

import { PersonService } from '../service/person/person.service';
import { RealPersonService } from '../service/person/real.service';
import { PersonRelationService } from '../service/person/relation.service';
import { PersonRelationRuleService } from '../service/person/relation-rule.service';
import { PersonAddressService } from '../service/person/address.service';
import { PersonAccountService } from '../service/person/account.service';
import { PersonProductService } from '../service/person/product.service';
import { PersonTableService } from '../service/person/table.service';
import { PersonVerifyPhoneService } from '../service/person/verify-phone.service';
import { ShopPersonService } from '../service/person/shop.service';
import { AlonePersonService } from '../service/person/alone.service';

import { AddressService } from '../service/address/address.service';
import { EnumsOpService } from '../service/enumsop/enumsop.service';

import { FicheService } from '../service/fiche/fiche.service';
import { FicheProductService } from '../service/fiche/product.service';
import { FicheMoneyService } from '../service/fiche/money.service';
import { FicheRelationService } from '../service/fiche/relation.service';

import { ApprovalFicheService } from '../service/approval/fiche.service';
import { ApprovalRelationService } from '../service/approval/relation.service';

import { NotificationService } from '../service/notification/notification.service';
import { NotificationPreferenceService } from '../service/notification/preference.service';

import { ProductService } from '../service/product/product.service';
import { ProductFilterService } from '../service/product/filter.service';
import { ProductCodeService } from '../service/product/code.service';
import { ProductCategoryService } from '../service/product/category.service';

import { ImageService } from '../service/image/image.service';
import { CommentService } from '../service/comment/comment.service';
import { PropertyService } from '../service/property/property.service';
import { OptionService } from '../service/option/option.service';
import { IncludeExcludeService } from '../service/include-exclude/include-exclude.service';

import { BasketService } from '../service/basket/basket.service';
import { BasketProductService } from '../service/basket/product.service';

import { OrderService } from '../service/order/order.service';
import { OrderStatHistoryService } from '../service/order/stat-history.service';

import { PosService } from '../service/pos/pos.service';

import { ReportPersonService } from '../service/report/person.service';

import { DashboardSliderService } from '../service/dashboard/slider.service';

import { WarningService } from '../service/warning/warning.service';
import { LogExceptionService } from '../service/log/exception.service';
import { HelpService } from '../service/help/help.service';
import { SysService } from '../service/sys/sys.service';

// Inside Service
import { LocalStorageService } from '../service/sys/local-storage.service';
import { CompBroadCastService } from '../service/sys/comp-broadcast-service';
import { DialogService } from '../service/sys/dialog.service';
import { AppRouterService } from '../service/sys/router.service';
import { UtilService } from '../service/sys/util.service';
import { EssentialService } from '../service/sys/essential.service';

// Helpers
import { TranslatePipe } from '../helper/translate.pipe';
import { EnumsPipe } from '../helper/enums.pipe';
import { AutofocusDirective } from "../helper/auto-focus.direc";

// Defining locales for ngx-bootstrap
import { defineLocale } from 'ngx-bootstrap/chronos';
import { trLocale } from 'ngx-bootstrap/locale';
import { enGbLocale } from 'ngx-bootstrap/locale';

import { PosGuard } from '../comp/pos/pos.guard';
import { AppLoginGuard } from './app-login.guard';
import { SysErrorHandler } from '../service/sys/error.handler';

defineLocale('tr', trLocale);
defineLocale('en', enGbLocale);

@NgModule({
  declarations: [
    // Components
    AppComponent,
    NewComp,
    AppAbout,
    AppSiteMapComp,

    DashBoardComp,
    DashboardSliderComp,

    PersonMyProfileComp,
    PersonMyProfileGeneralComp,

    PersonProfileComp,
    PersonProfileImageSelectComp,

    PersonProfileProductListItemComp,
    PersonProfileProductListIndexComp,

    PersonSettingShopGeneralComp,
    PersonSettingShopOrderGeneralComp,
    PersonSettingShopOrderWorkingHoursComp,
    PersonSettingShopOrderWorkingHoursDayComp,

    PersonSettingShopOrderAreaListIndexComp,
    PersonSettingShopOrderAreaListItemComp,

    PersonSettingShopOrderAreaNewComp,
    PersonSettingShopOrderAreaCrudComp,

    PersonNewShopCrudComp,

    PersonMineSelectComp,
    PersonMineCurrencyComp,

    PersonAddressListIndexComp,
    PersonAddressListItemComp,
    PersonAddressListViewComp,
    PersonAddressListCriteriaComp,
    PersonAddressCrudComp,

    PersonAccountListIndexComp,
    PersonAccountListItemComp,
    PersonAccountListCriteriaComp,
    PersonAccountCrudComp,

    PersonProductListIndexComp,
    PersonProductListItemComp,
    PersonProductListCriteriaComp,
    PersonProductProfileComp,

    PersonAccountActivityListIndexComp,
    PersonAccountActivityListCriteriaComp,
    PersonAccountActivityListItemComp,

    PersonProductActivityListIndexComp,
    PersonProductActivityListCriteriaComp,
    PersonProductActivityListItemComp,

    PersonProductSettingComp,
    PersonProductSettingGeneralComp,

    PersonRelationListIndexComp,
    PersonRelationListCriteriaComp,
    PersonRelationListItemComp,

    PersonRelationFindListIndexComp,
    PersonRelationFindListCriteriaComp,
    PersonRelationFindListItemComp,

    PersonAloneCrudComp,

    PersonVerifyPhoneComp,

    FicheListIndexComp,
    FicheListItemComp,
    FicheListItemModalComp,
    FicheListItemProductListComp,
    FicheListItemMoneyListComp,
    FicheListCriteriaComp,

    FicheCrudComp,
    FicheCrudHeaderComp,
    FicheMoneyOneComp,
    FicheProductListItemComp,
    FicheProductListIndexComp,
    FicheRelationListItemComp,
    FicheRelationListIndexComp,

    FicheSearchCriteriaComp,
    FicheSearchListItemComp,
    FicheSearchListIndexComp,
    FicheSearchIndexComp,

    FicheApprovalHistoryListComp,

    PosComp,
    PosProductListIndexComp,
    PosProductListItemComp,
    PosShortCutcomp,
    PosShortCutGroupComp,
    PosPaymentComp,
    PosSeePriceComp,

    TableGroupCrudComp,
    TableGroupListComp,

    TableCrudComp,
    TableListItemComp,
    TableListComp,

    TableComp,

    LayoutNavbarTopComp,
    LayoutNavbarBottomComp,
    LayoutFooterComp,

    AuthLoginComp,
    AuthRegisterComp,
    AuthForgotPassComp,
    AuthVerifyEmailComp,

    PersonSearchCriteriaComp,
    PersonSearchListItemComp,
    PersonSearchListIndexComp,
    PersonSearchIndexComp,

    PersonAccountSearchCriteriaComp,
    PersonAccountSearchListItemComp,
    PersonAccountSearchListIndexComp,
    PersonAccountSearchIndexComp,

    PersonProductSearchCriteriaComp,
    PersonProductSearchListItemComp,
    PersonProductSearchListIndexComp,
    PersonProductSearchIndexComp,

    NotificationSmallListItemComp,
    NotificationSmallListIndexComp,
    NotificationPreferenceComp,

    ApprovalAllComp,
    ApprovalFicheSmallListIndexComp,
    ApprovalFicheSmallListItemComp,

    ApprovalRelationSmallListIndexComp,
    ApprovalRelationSmallListItemComp,

    ApprovalFicheChoiceIndexComp,
    ApprovalFicheChoiceItemComp,

    ProductOfferComp,
    ProductOfferCriteriaComp,
    ProductCodeListComp,
    ProductNewComp,

    ProductFilterCategoryComp,
    ProductFilterPropertyComp,
    ProductFilterOtherComp,
    ProductFilterSelectedComp,
    ProductFilterListItemComp,
    ProductFilterListIndexComp,
    ProductFilterIndexComp,

    ProductCategorySearchComp,
    ProductCategoryBreadcrumbComp,

    WarningCrudComp,

    ImageUploadComp,

    PropertyCrudComp,
    PropertyListComp,

    OptionCrudComp,
    OptionListComp,
    OptionSelectComp,

    IncludeExcludeCrudComp,
    IncludeExcludeFindComp,
    IncludeExcludeListComp,
    IncludeExcludeSelectComp,

    CommentCrudComp,
    CommentListItemComp,
    CommentListIndexComp,

    BasketListItemComp,
    BasketListIndexComp,

    BasketAddComp,

    OrderCreateComp,
    OrderListItemComp,
    OrderListIndexComp,

    OrderStatHistoryCrudComp,

    AddressBreadcrumbComp,

    //General components
    LangSelectComp,
    PageTitleComp,
    NoPageComp,
    AppDialogComp,
    CurrencyIconComp,
    AppStarComp,
    AppCompSelectorComp,
    AppModalComp,
    AppPagerComp,

    // Helpers
    TranslatePipe,
    EnumsPipe,
    AutofocusDirective
  ],
  imports: [
    // Angular imports
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule, // remove this later, added just for 'PersonSearchCriteriaComp' because of debounceTime.
    BrowserModule,
    BrowserAnimationsModule,

    // Extentions
    Angular2FontawesomeModule,
    NgxMaskModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: false,
      //countDuplicates: true,
      progressBar: true,
      closeButton: true,
      toastClass: 'ngx-toastr'
    }),
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.threeBounce,
      backdropBackgroundColour: 'rgba(0,0,0,0.1)',
      backdropBorderRadius: '4px',
      primaryColour: '#349ff4',
      secondaryColour: '#349ff4',
      tertiaryColour: '#349ff4'
    }),
    NgSelectModule,
    PopoverModule.forRoot(),
    BsDropdownModule.forRoot(),
    RatingModule.forRoot(),
    NgxCurrencyModule, // there is an error event 'change' and 'input'. Keep in touch with new updates. I used 'NgModelChange' as a workaorund.
    TreeNgxModule,
    ImageCropperModule,
    InfiniteScrollModule,
    InViewportModule
  ],
  providers: [
    // Outside Service
    WsService,
    AuthService,
    LanguageService,
    DictionaryService,

    PersonService,
    RealPersonService,
    PersonRelationService,
    PersonRelationRuleService,
    PersonAddressService,
    PersonAccountService,
    PersonProductService,
    PersonTableService,
    PersonVerifyPhoneService,
    ShopPersonService,
    AlonePersonService,

    AddressService,
    EnumsOpService,

    FicheService,
    FicheProductService,
    FicheMoneyService,
    FicheRelationService,

    ApprovalFicheService,
    ApprovalRelationService,

    NotificationService,
    NotificationPreferenceService,

    ProductService,
    ProductFilterService,
    ProductCodeService,
    ProductCategoryService,

    ImageService,
    CommentService,
    PropertyService,
    OptionService,
    IncludeExcludeService,

    BasketService,
    BasketProductService,

    OrderService,
    OrderStatHistoryService,

    PosService,

    ReportPersonService,

    DashboardSliderService,

    WarningService,
    LogExceptionService,
    HelpService,
    SysService,

    // Inside Service
    LocalStorageService,
    CompBroadCastService,
    DialogService,
    AppRouterService,
    UtilService,
    EssentialService,

    // Guard
    PosGuard,
    AppLoginGuard,

    { provide: ErrorHandler, useClass: SysErrorHandler } 
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}