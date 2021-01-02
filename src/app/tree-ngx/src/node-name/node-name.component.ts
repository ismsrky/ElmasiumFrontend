import { Component, OnInit, Input, TemplateRef, SimpleChanges, OnChanges, Host } from '@angular/core';
import { NodeState } from '../model/node-state';
import { TreeService } from '../service/tree-service';

@Component({
  selector: 'node-name',
  templateUrl: './node-name.component.html'
})
export class NodeNameComponent implements OnChanges {
  @Input() state: NodeState;
  @Input() nodeNameTemplate: TemplateRef<any>;

  public _this = this;
  public active = false;
  constructor(private treeService: TreeService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.state) {
      this.active = this.treeService.canToggleChildrenOnName(this.state);
    }
  }

  public nameClick() {
    this.treeService.nameClick(this.state);
  }

  public delete() {
    this.treeService.deleteByState(this.state);
  }

  public toggleExpand() {
    this.state.expanded = !this.state.expanded;
  }

  newItemClick(): void {
    this.treeService.newItem(this.state.nodeItem);
  }
  editItemClick(): void {
    this.treeService.editItem(this.state.nodeItem);
  }
  deleteItemClick(): void {
    this.treeService.deleteItem(this.state.nodeItem);
  }

  buttonShow:boolean=false;
}