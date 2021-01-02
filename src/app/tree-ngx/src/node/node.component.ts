import { Component, OnChanges, ElementRef, ViewChild, Input, TemplateRef, SimpleChanges, AfterViewInit, OnInit, HostListener, Host } from '@angular/core';
import { NodeState } from '../model/node-state';
import { NodeSelectedState } from '../model/node-selected-state';
import { TreeService } from '../service/tree-service';

@Component({
  selector: 'node',
  templateUrl: './node.component.html'
})
export class NodeComponent implements OnChanges, AfterViewInit, OnInit {

  @ViewChild('nodeCheckbox', { static: false }) nodeCheckbox: ElementRef;

  @Input() state: NodeState;
  @Input() selectedState: NodeSelectedState;
  @Input() nodeNameTemplate: TemplateRef<any>;
  @Input() nodeCollapsibleTemplate: TemplateRef<any>;

  public _this = this;
  isNarrow: boolean = true;

  constructor(public treeService: TreeService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedState) {
      this.selectedStateChanged();
    }
  }

  ngAfterViewInit() {
    this.selectedStateChanged();
  }

  ngOnInit(): void {
    this.isNarrow = window.innerWidth <= 768; // md
  }

  private selectedStateChanged() {
    if (this.nodeCheckbox) {
      if (this.selectedState === NodeSelectedState.indeterminate) {
        this.nodeCheckbox.nativeElement.indeterminate = true;
      } else {
        this.nodeCheckbox.nativeElement.indeterminate = false;
      }
    }
  }

  public checkBoxClick() {
    this.treeService.checkBoxClick(this.state);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.isNarrow = window.innerWidth <= 768;
  }
}