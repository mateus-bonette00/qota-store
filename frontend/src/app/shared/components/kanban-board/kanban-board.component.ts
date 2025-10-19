import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayBetween Arrays } from '@angular/cdk/drag-drop';

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
  styleUrls: ['./kanban-board.component.css']
})
export class KanbanBoardComponent {
  @Input() columns: KanbanColumn[] = [];
  @Input() cardTemplate: any; // Template reference for card content
  @Output() cardMoved = new EventEmitter<KanbanCardMoveEvent>();
  @Output() cardClicked = new EventEmitter<any>();

  drop(event: CdkDragDrop<any[]>, columnId: string, previousColumnId: string) {
    if (event.previousContainer === event.container) {
      // Moved within same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moved to different column
      transferArrayBetweenArrays(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Emit event
      const item = event.container.data[event.currentIndex];
      this.cardMoved.emit({
        item,
        previousColumnId,
        currentColumnId: columnId,
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex
      });
    }
  }

  onCardClick(item: any) {
    this.cardClicked.emit(item);
  }

  getConnectedLists(): string[] {
    return this.columns.map(col => col.id);
  }
}
