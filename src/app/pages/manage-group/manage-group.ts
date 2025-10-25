import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Observable, firstValueFrom } from 'rxjs';
import { IGroupRole } from '../../models/group.model';
import { GroupItemComponent } from '../../components/group-item/group-item.component';
import { GroupFormComponent } from '../../components/group-form/group-form.component';
import { APP_CONSTANTS } from '../../constants/app.constants';

@Component({
  selector: 'app-manage-group',
  imports: [CommonModule, GroupItemComponent, GroupFormComponent, RouterLink],
  templateUrl: './manage-group.html',
  styleUrl: './manage-group.scss',
})
export class ManageGroup {
  private router = inject(Router);
  private groupService = inject(GroupService);
  private userService = inject(UserService);
  private loader = inject(LoaderService);
  private confirmationModal = inject(ConfirmationModalService);
  
  user$ = this.userService.user$;
  groups$: Observable<IGroupRole[]>;
  editingId: string | null = null;
  groups: IGroupRole[] = [];

  constructor() {
    const allGroups$ = this.groupService.getGroups();
    this.groups$ = this.userService.getUserGroups(allGroups$);
    this.groups$.subscribe((groups) => (this.groups = groups));
  }
  async add(name: string, email: string) {
    const validation = this.groupService.validateGroupName(name, this.groups);
    if (!validation.isValid) {
      this.confirmationModal.confirm(
        'Invalid Group Name',
        validation.error!,
        true
      );
      return;
    }
    
    const id = this.loader.show();
    try {
      await this.groupService.createGroup(name, email);
    } catch (error) {
      this.confirmationModal.confirm(
        'Error',
        APP_CONSTANTS.MESSAGES.ERRORS.CREATE_GROUP_FAILED,
        true
      );
    } finally {
      this.loader.hide(id);
    }
  }
  async delete(group: IGroupRole) {
    if (!group.id) return;
    const confirmed = await this.confirmationModal.confirm(
      '<i class="bi bi-trash3-fill"></i> Delete Group',
      `${APP_CONSTANTS.MESSAGES.CONFIRMATIONS.DELETE_GROUP} "${group.name}"?`
    );
    if (!confirmed) return;
    
    const id = this.loader.show();
    try {
      await this.groupService.deleteGroup(group.id);
    } catch (error) {
      this.confirmationModal.confirm(
        'Error',
        APP_CONSTANTS.MESSAGES.ERRORS.DELETE_GROUP_FAILED,
        true
      );
    } finally {
      this.loader.hide(id);
    }
  }
  async edit(group: IGroupRole, newName: string) {
    if (!group.id) return;
    
    const validation = this.groupService.validateGroupName(newName, this.groups, group.id);
    if (!validation.isValid) {
      this.confirmationModal.confirm(
        'Invalid Group Name',
        validation.error!,
        true
      );
      return;
    }
    
    const user = await firstValueFrom(this.user$);
    if (!user?.email) return;
    
    const id = this.loader.show();
    try {
      await this.groupService.updateGroup(group.id, newName, user.email);
      this.editingId = null;
    } catch (error) {
      this.confirmationModal.confirm(
        'Error',
        APP_CONSTANTS.MESSAGES.ERRORS.UPDATE_GROUP_FAILED,
        true
      );
    } finally {
      this.loader.hide(id);
    }
  }

  startEdit(groupId: string) {
    this.editingId = groupId;
  }

  cancelEdit() {
    this.editingId = null;
  }

  navigateToTournaments(groupId: string) {
    this.router.navigate(['/manage-tournaments', groupId]);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
