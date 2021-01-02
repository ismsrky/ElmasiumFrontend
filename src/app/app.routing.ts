import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Comp
import { PersonMyProfileComp } from '../comp/person/my-profile/my-profile.comp';
import { PersonAddressListIndexComp } from '../comp/person/address/list/index.comp';
import { PersonAccountListIndexComp } from '../comp/person/account/list/index.comp';
import { PersonRelationListIndexComp } from '../comp/person/relation/list/index.comp';
import { FicheListIndexComp } from '../comp/fiche/list/index.comp';
import { PosComp } from '../comp/pos/pos.comp';
import { PersonAccountActivityListIndexComp } from '../comp/person/account/activity/list/index.comp';
import { PersonProductActivityListIndexComp } from '../comp/person/product/activity/list/index.comp';
import { PersonProductListIndexComp } from '../comp/person/product/list/index.comp';
import { NewComp } from '../comp/new/new.comp';
import { AppAbout } from '../comp/general/about/about.comp';
import { PersonRelationFindListIndexComp } from '../comp/person/relation/find/list/index.comp';
import { PosGuard } from '../comp/pos/pos.guard';
import { AuthLoginComp } from '../comp/auth/login/login.comp';
import { AuthRegisterComp } from '../comp/auth/register/register.comp';
import { AuthForgotPassComp } from '../comp/auth/forgot-password/forgot-password.comp';
import { AppCompSelectorComp } from '../comp/general/comp-selector/comp-selector.comp';
import { DashBoardComp } from '../comp/dashboard/dashboard.comp';

import { AppLoginGuard } from './app-login.guard';

// Enum
import { AppRoutes } from '../enum/sys/routes.enum';
import { BasketListIndexComp } from '../comp/basket/list/index.comp';
import { OrderCreateComp } from '../comp/order/create/create.comp';
import { OrderListIndexComp } from '../comp/order/list/index.comp';
import { AppSiteMapComp } from '../comp/general/site-map/site-map.comp';
import { TableComp } from '../comp/table/table.comp';

const appRoutes: Routes = [
    /**
     * {
        path: '',
        redirectTo: AppRoutes.dashboard,
        pathMatch: 'full'
        // loadChildren: '../../component/login/login.module#LoginModule'
    },
     */
    {
        path: 'Dashboard',
        redirectTo: '',
        pathMatch: 'full'
        // loadChildren: '../../component/login/login.module#LoginModule'
    },
    {
        path: AppRoutes.homepage,
        component: DashBoardComp
    },
    {
        path: AppRoutes.generalNew,
        component: NewComp
    },
    {
        path: AppRoutes.generalFind,
        component: PersonRelationFindListIndexComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.about,
        component: AppAbout
    },
    {
        path: AppRoutes.siteMap,
        component: AppSiteMapComp
    },
    {
        path: AppRoutes.accounting,
        component: AppSiteMapComp
    },
    {
        path: AppRoutes.myProfile,
        component: PersonMyProfileComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.myBaskets,
        component: BasketListIndexComp
    },
    {
        path: AppRoutes.createOrder,
        component: OrderCreateComp
    },

    {
        path: AppRoutes.incomingOrders,
        component: OrderListIndexComp,
        canActivate: [AppLoginGuard],
        data: { getIncomings: true, getReturns: false }
    },
    {
        path: AppRoutes.outgoingOrders,
        component: OrderListIndexComp,
        canActivate: [AppLoginGuard],
        data: { getIncomings: false, getReturns: false }
    },
    {
        path: AppRoutes.incomingOrderReturns,
        component: OrderListIndexComp,
        canActivate: [AppLoginGuard],
        data: { getIncomings: true, getReturns: true }
    },
    {
        path: AppRoutes.outgoingOrderReturns,
        component: OrderListIndexComp,
        canActivate: [AppLoginGuard],
        data: { getIncomings: false, getReturns: true }
    },

    {
        path: AppRoutes.myOrders,
        component: OrderListIndexComp,
        canActivate: [AppLoginGuard],
        data: { getIncomings: false, getReturns: false }
    },
    {
        path: AppRoutes.myReturns,
        component: OrderListIndexComp,
        canActivate: [AppLoginGuard],
        data: { getIncomings: false, getReturns: true }
    },

    {
        path: AppRoutes.definitionsAddress,
        component: PersonAddressListIndexComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.definitionsMoneyAccount,
        component: PersonAccountListIndexComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.activitiesFiche,
        component: FicheListIndexComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.generalConnections,
        component: PersonRelationListIndexComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.activitiesMoney,
        component: PersonAccountActivityListIndexComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.activitiesStock,
        component: PersonProductActivityListIndexComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.definitionsInventory,
        component: PersonProductListIndexComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.generalRetail,
        component: PosComp,
        canActivate: [AppLoginGuard],
        canDeactivate: [PosGuard]
    },
    {
        path: AppRoutes.generalTable,
        component: TableComp,
        canActivate: [AppLoginGuard]
    },
    {
        path: AppRoutes.login,
        component: AuthLoginComp
    },
    {
        path: AppRoutes.register,
        component: AuthRegisterComp
    },
    {
        path: AppRoutes.forgotPassword,
        component: AuthForgotPassComp
    },
    {
        path: '**',
        component: AppCompSelectorComp
        //component: NoPageComp
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, { useHash: false, onSameUrlNavigation: 'reload' })],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { 
    
}

// export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { enableTracing: true });
