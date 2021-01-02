import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { ImageService } from '../../../../service/image/image.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { ShopProfileDto } from '../../../../dto/person/shop/profile.dto';

// Bo
import { ImageUploadBo } from '../../../../bo/image/upload.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { environment } from '../../../../environments/environment';
import { ImageTypes } from '../../../../enum/image/types.enum';
import { expandCollapseHidden, expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-profile-image-select',
    templateUrl: './image-select.comp.html',
    animations: [expandCollapseHidden, expandCollapse]
})
export class PersonProfileImageSelectComp implements OnInit, OnDestroy {
    profileDto: ShopProfileDto;
    selectedImageFile: File = null;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    environment = environment;

    croppedImage: any;

    private _eventBus: Subject<string>;

    busy: boolean = false;

    imageUrl: any = null;
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

    showModal(profileDto: ShopProfileDto, selectedImageFile: File): Observable<string> {
        this._eventBus = new Subject<string>();

        this.profileDto = profileDto;
        this.selectedImageFile = selectedImageFile;

        this.handleImage();

        this.modal.onHide.subscribe(
            x => {
                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonProfileImageSelectComp');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    //file upload event  

    /**
     *  fileChange(event) {
         let fileList: FileList = event.target.files;
         if (fileList.length > 0) {
             this.selectedImageFile = fileList[0];
             this.handleImage();
         }
     }
     */

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
        imageUploadBo.ImageFile = this.croppedImage;
        imageUploadBo.ImageTypeId = ImageTypes.Profile;
        imageUploadBo.PersonId = this.profileDto.ShopId;
        this.busy = true;
        let subs = this.imageService.upload(imageUploadBo).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                this.imageUrl = null;
                if (x.IsSuccess) {
                    //this.getProfile();

                    this.toastr.success(this.dicService.getValue('xImageUploadSuccessfully'));

                    this._eventBus.next(x.Message);

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