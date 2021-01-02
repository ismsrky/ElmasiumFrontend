import { PersonProfileProductListDto } from "../../person/product/profile-list.dto";

export class ProductCategoryListDto {
    constructor() {
        this.Id = null;
        this.Name = null;

        this.UrlName = null;

        this.IsLast = false;

        this.ParentId = null;

        this.SubCategoryList = null;
        this.UpperCategoryList = null;
        this.IsSelected = false;
        this.FullUrl = null;
        this.IsOpen = false;

        this.UpperCategoryName = null;
        this.FinishGetUpperList = false;

        this.GotProductList = false;
        this.ProductList = null;
        this.ProductListWaitTill = false;
        this.ProductListBusy = false;
    }

    Id: number; // not null
    Name: string; // not null. No need to be translated.

    UrlName: string; // not null. Comes value of field 'Id' if not specified.

    IsLast: boolean; // not null

    ParentId: number; // not null

    SubCategoryList: ProductCategoryListDto[]; // shadow property
    UpperCategoryList: ProductCategoryListDto[]; // shadow property
    IsSelected: boolean; // shadow property
    FullUrl: string; // shadow property
    IsOpen: boolean; // shadow property

    UpperCategoryName: string; // shadow property
    FinishGetUpperList: boolean; // shadow property

    GotProductList: boolean; // shadow property
    ProductList: PersonProfileProductListDto[]; // shadow property
    ProductListWaitTill: boolean; // shadow property
    ProductListBusy: boolean; // shadow property
}