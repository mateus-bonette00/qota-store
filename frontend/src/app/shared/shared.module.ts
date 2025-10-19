import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';

@NgModule({
  declarations: [
    KanbanBoardComponent
  ],
  imports: [
    CommonModule,
    DragDropModule
  ],
  exports: [
    KanbanBoardComponent
  ]
})
export class SharedModule { }
