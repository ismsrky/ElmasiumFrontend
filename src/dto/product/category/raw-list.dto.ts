export class ProductCategoryRawListDto {
    constructor() {
        this.Id = null;
        this.Name = null;

        this.UrlName = null;

        this.ParentId = null;
    }

    Id: number; // not null
    Name: string; // not null

    UrlName: string; // not null. Comes value of field 'Id' if not specified.

    ParentId: number; // not null

    copy(dto: ProductCategoryRawListDto) {
        this.Id = dto.Id;
        this.Name = dto.Name;

        this.UrlName = dto.UrlName;

        this.ParentId = dto.ParentId;
    }
}