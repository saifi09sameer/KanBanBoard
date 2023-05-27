import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/Model/Project';
import { ITask } from 'src/app/Model/task';
import { ProjectService } from 'src/app/Services/Project/project.service';
import { CreateTaskComponent } from '../create-task/create-task.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TasksService } from 'src/app/Services/Task/tasks.service';
import { SnackbarsService } from 'src/app/Snackbars/snackbars.service';
import { ViewTaskComponent } from '../view-task/view-task.component';
import { AssignTaskComponent } from '../assign-task/assign-task.component';
import { ViewProjectComponent } from '../view-project/view-project.component';
@Component({
  selector: 'app-task-dash-board',
  templateUrl: './task-dash-board.component.html',
  styleUrls: ['./task-dash-board.component.css']
})

export class TaskDashBoardComponent implements OnInit {
  loginEmployeeEmail: any;
  projectID: any;
  projectName: string = "";
  projectCreatedBy: string = "";
  showFooter: boolean[] = [];
  employeeList: string[] = [];
  task: ITask[] = [];
  inprogress: ITask[] = [];
  review: ITask[] = [];
  done: ITask[] = [];

  project!: Project;


  constructor(private actRoute: ActivatedRoute, private fb: FormBuilder,
    private taskService: TasksService,
    private projectService: ProjectService,
    private msg: SnackbarsService,
    private dialog: MatDialog,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.loginEmployeeEmail = localStorage.getItem("employeeEmail");
    this.storePerameterProjectID();
    this.getProject();


  }
  viewProject(){
    this.dialog.open(ViewProjectComponent);
  }
  navigateToWinDashboard() {
    const data = {
      projectID: this.projectID,
      projectCreatedBy: this.projectCreatedBy
    };
    this.router.navigate(['/recycleBin', data]);
  }

  storePerameterProjectID() {
    this.actRoute.paramMap.subscribe(params => {
      this.projectID = params.get('projectId');
    });

  }
  getProject() {
    this.projectService.getProjectBasedOnID(this.projectID).subscribe(
      (response) => {
        this.project = response;
        this.employeeList = this.project.employeeList;
        // this.task = this.project.taskList;
        this.projectCreatedBy = this.project.createdBY;
        this.projectName = this.project.projectName;
        console.log(JSON.stringify(this.project.taskList.length));
        this.task = [];
        this.inprogress = [];
        this.review = [];
        this.done = [];
        for (let i = 0; i < this.project.taskList.length; i++) {
          if (this.project.taskList[i].taskStage === "To Do") {
            this.task.push(this.project.taskList[i]);
            console.log(this.project.taskList[i].taskStage);
          } else if (this.project.taskList[i].taskStage === "In Progress") {
            this.inprogress.push(this.project.taskList[i]);
          } else if (this.project.taskList[i].taskStage === "Review") {
            this.review.push(this.project.taskList[i]);
          } else if (this.project.taskList[i].taskStage === "Done") {
            this.done.push(this.project.taskList[i]);
          }
        }

      },
      (error) => {
        if (error.status == 404) {
          this.msg.showError("Project Not Found....");
        } else {
          this.msg.showError("Server Error....");
        }
      }
    );
  }

  viewTask(task: ITask) {
    this.dialog.open(ViewTaskComponent, {
      data: {
        task: task,
        projectId: this.projectID,
        projectName: this.projectName,
        createdBy: this.projectCreatedBy
      }
    });
  }

  // deleteByTaskId(taskId: number) {
  //   this.taskService.deleteTask(this.projectCreatedBy, this.projectID, taskId).subscribe(
  //     (response) => {
  //       if (response == true) {
  //         this.msg.showSuccess("Delete Task Successfully....");
  //         this.task = [];
  //         this.inprogress = [];
  //         this.review = [];
  //         this.done = [];
  //         this.getProject();
  //       } else {
  //         this.msg.showError("Task Not Deleted....");
  //       }
  //     },
  //     (error) => {
  //       this.msg.showError("Server Error....");
  //     }
  //   )
  // }

  deleteByTaskId(taskID: number) {
    var databaseStage = "Deleted";
    this.taskService.changeStageOFTask(taskID, databaseStage, this.projectCreatedBy, this.projectID).subscribe(
      (response) => {
        if(response==true){
          this.msg.showSuccess("Deleted Successfully...");
          this.getProject();
        }
      },
      (response) => {
        this.msg.showError("Server Error...")
      }
    )
  }

  AssignTask(taskID: number) {
    const dialogConfig = new MatDialogConfig();
    
    dialogConfig.data = {
      employeeList: this.employeeList,
      projectCreatedBy: this.projectCreatedBy,
      projectID: this.projectID,
      taskID: taskID
    };
  
    const dialogRef = this.dialog.open(AssignTaskComponent, dialogConfig);
  
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed with result:', result);
    });
  }

  // drop(event: CdkDragDrop<ITask[]>) {
  //   if (event.previousContainer === event.container) {
  //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //   } else {
  //     transferArrayItem(
  //       event.previousContainer.data,
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex,
  //     );
  //     const taskID = event.container.data[event.currentIndex].taskID;
  //     const containerId = event.container.id;
  //           const frontendStage = Number(containerId.split('-')[3]);
  //     const stageMapping: { [key: number]: string } = {
  //       0: 'To Do',
  //       1: 'In Progress',
  //       2: 'Review',
  //       3: 'Done'
  //     };
  //     const databaseStage = stageMapping[frontendStage];
  //     this.taskService.changeStageOFTask(taskID, databaseStage, this.projectCreatedBy, this.projectID).subscribe(
  //       (response) => {
  //         if (response == true) {
  //           this.msg.showSuccess("Successfully...");
  //           this.task = [];
  //           this.inprogress = [];
  //           this.review = [];
  //           this.done = [];
  //           this.getProject();
  //         }
  //       },
  //       (error) => {
  //         if (error.status == 404) {
  //           this.msg.showError("Failed....");
  //         } else {
  //           this.msg.showError("Server Error....");
  //         }
  //       }
  //     )
  //   }
  // }

  drop(event: CdkDragDrop<ITask[]>) {
    const allowedTransitions: { [key: string]: string[] } = {
      'todo': ['inprogress'],
      'inprogress': ['review', 'completed'],
      'review': ['completed'],
      'completed': []
    };
  
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const previousColumnId = event.previousContainer.id;
      const currentColumnId = event.container.id;
  
      const previousColumn = previousColumnId.split('-')[3];
      const currentColumn = currentColumnId.split('-')[3];
  
      if (allowedTransitions[previousColumn] && allowedTransitions[previousColumn].includes(currentColumn)) {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
  
        const taskID = event.container.data[event.currentIndex].taskID;
        const containerId = event.container.id;
        const frontendStage = Number(containerId.split('-')[3]);
        const stageMapping: { [key: number]: string } = {
          0: 'To Do',
          1: 'In Progress',
          2: 'Review',
          3: 'Done'
        };
        const databaseStage = stageMapping[frontendStage];
  
        this.taskService.changeStageOFTask(taskID, databaseStage, this.projectCreatedBy, this.projectID).subscribe(
          (response: boolean) => {
            if (response) {
              this.msg.showSuccess('Successfully...');
              this.task = [];
              this.inprogress = [];
              this.review = [];
              this.done = [];
              this.getProject();
            }
          },
          (error) => {
            if (error.status == 404) {
              this.msg.showError('Failed....');
            } else {
              this.msg.showError('Server Error....');
            }
          }
        );
      } else {
        // Display an error or provide visual feedback indicating the invalid transition
        // For example:
        console.log('Invalid transition. Not allowed to move from', previousColumn, 'to', currentColumn);
      }
    }
  }
  
  
  
  
  
  

  

  createTask() {
    const dialogRef = this.dialog.open(CreateTaskComponent, {
      data: {
        createdBy: this.projectCreatedBy,
        projectID: this.projectID,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.task = [];
      this.done = [];
      this.inprogress = [];
      this.review = [];
      this.getProject();
    });
  }

}
