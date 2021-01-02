import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { ImageService } from '../../../service/image/image.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto

// Bo
import { ImageUploadBo } from '../../../bo/image/upload.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { environment } from '../../../environments/environment';
import { ImageTypes } from '../../../enum/image/types.enum';
import { expandCollapseHidden, expandCollapse } from '../../../stc';

@Component({
    selector: 'image-upload',
    templateUrl: './upload.comp.html',
    animations: [expandCollapseHidden, expandCollapse]
})
export class ImageUploadComp implements OnInit, OnDestroy {
    relatedId: number; // personId, productId or personProductId.
    imageTypeId: ImageTypes;
    isCircle: boolean = false;

    selectedImageFile: File = null;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;
    @ViewChild('inputFile', { static: false }) inputFile: ElementRef;

    environment = environment;

    croppedImage: any;

    busy: boolean = false;

    imageUrl: any = null;

    isModalOpen: boolean = false;
    constructor(
        private imageService: ImageService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private dicService: DictionaryService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    show(relatedId: number, imageTypeId: ImageTypes): void {
        this.relatedId = relatedId;
        this.imageTypeId = imageTypeId;

        if (this.imageTypeId == ImageTypes.Profile) {
            this.isCircle = true;
        } else {
            this.isCircle = false;
        }
    }

    fileChange(event: any) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.isModalOpen = true;

            setTimeout(() => {
                this.selectedImageFile = fileList[0];

                this.handleImage();

                this.modal.onHide.subscribe(
                    x => {
                        this.isModalOpen = false;
                    }
                );

                this.modal.show();
            });
        }
    }

    handleImage(): void {
        if (this.utils.isNull(this.selectedImageFile)) {
            this.imageUrl = null;
        } else {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                this.imageUrl = event.target.result;
            };
            reader.readAsDataURL(this.selectedImageFile);
        }
    }
    uploadImage(): void {
        const imageUploadBo = new ImageUploadBo();
        imageUploadBo.ImageTypeId = this.imageTypeId;

        if (this.isCircle) {
            imageUploadBo.ImageFile = this.croppedImage;
        } else {
            imageUploadBo.ImageFile = this.selectedImageFile;
        }

        imageUploadBo.PersonId = this.imageTypeId == ImageTypes.Profile ? this.relatedId : null;
        imageUploadBo.ProductId = this.imageTypeId == ImageTypes.Product ? this.relatedId : null;
        imageUploadBo.PersonProductId = this.imageTypeId == ImageTypes.PersonProduct ? this.relatedId : null;;

        this.busy = true;
        let subs = this.imageService.upload(imageUploadBo).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                this.imageUrl = null;
                if (x.IsSuccess) {
                    //this.getProfile();

                    this.toastr.success(this.dicService.getValue('xImageUploadSuccessfully'));

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({ 'ImageUploadComp': { 'relatedId': this.relatedId, 'imageTypeId': this.imageTypeId, 'imageUrl': x.Message } }));

                    this.modal.hide();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'uploadImage', subs);
                this.busy = false;
            }
        );
    }
    cancel(): void {
        this.inputFile.nativeElement.value = '';
        this.modal.hide();
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.file;
    }
    imageLoaded() {
        // show cropper
    }
    cropperReady() {
        // cropper ready
    }
    loadImageFailed() {
        // show message
    }
}