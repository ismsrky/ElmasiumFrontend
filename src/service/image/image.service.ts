import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';
import { ImageUploadBo } from '../../bo/image/upload.bo';
import { Stc } from '../../stc';
import { UtilService } from '../sys/util.service';

@Injectable()
export class ImageService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Image');
    }

    upload(imageUploadBo: ImageUploadBo): Observable<ResponseDto> {
        const formData = new FormData();
        formData.append('uploadFile', imageUploadBo.ImageFile, imageUploadBo.ImageFile.name);

        formData.append('imageTypeId', imageUploadBo.ImageTypeId.toString());

        if (this.utils.isNotNull(imageUploadBo.ProductId)) {
            formData.append('productId', imageUploadBo.ProductId.toString());
        }
        if (this.utils.isNotNull(imageUploadBo.PersonId)) {
            formData.append('personId', imageUploadBo.PersonId.toString());
        }
        if (this.utils.isNotNull(imageUploadBo.PersonProductId)) {
            formData.append('personProductId', imageUploadBo.PersonProductId.toString());
        }

        return super.postFile('Upload', formData);
    }
}