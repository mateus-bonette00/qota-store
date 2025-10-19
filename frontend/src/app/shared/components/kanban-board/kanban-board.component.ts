import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

export interface KanbanColumn {
  id: string;
  title: string;
  items: any[];
  color?: string;
}

export interface KanbanCardMoveEvent {
  item: any;
  previousColumnId: string;
  currentColumnId: string;
  previousIndex: number;
  currentIndex: number;
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
})
export class KanbanBoardComponent {
  /** Colunas do Kanban */
  @Input() columns: KanbanColumn[] = [];

  /** Template do cartão (opcional) */
  @Input() cardTemplate?: TemplateRef<any>;

  /** Eventos */
  @Output() cardMoved = new EventEmitter<KanbanCardMoveEvent>();
  @Output() cardClicked = new EventEmitter<any>();

  /** Conectividade entre as listas (ids dos cdkDropList) */
  getConnectedLists(): string[] {
    return this.columns.map((c) => c.id);
  }

  onCardClick(item: any): void {
    this.cardClicked.emit(item);
  }

  drop(event: CdkDragDrop<any[]>, columnId: string, previousColumnId: string) {
    // Move dentro da mesma coluna
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move entre colunas diferentes
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const movedItem = event.container.data[event.currentIndex];
    this.cardMoved.emit({
      item: movedItem,
      previousColumnId,
      currentColumnId: columnId,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }
}
