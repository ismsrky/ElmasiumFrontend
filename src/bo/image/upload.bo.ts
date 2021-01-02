import { ImageTypes } from "../../enum/image/types.enum";

export class ImageUploadBo {
    constructor() {
        this.ImageFile = null;

        this.ImageTypeId = null;

        this.ProductId = null;
        this.PersonId = null;
        this.PersonProductId = null;
    }
    ImageFile: File;

    ImageTypeId: ImageTypes;

    ProductId: number;
    PersonId: number;
    PersonProductId: number;
}