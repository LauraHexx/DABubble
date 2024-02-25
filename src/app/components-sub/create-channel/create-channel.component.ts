import { Component, ElementRef } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';

import { ChannelService } from 'src/app/shared/services/channel.service';
import { SearchInputService } from 'src/app/shared/services/search-input.service';
import { WorkspaceService } from 'src/app/shared/services/workspace.service';
import { ResponsiveService } from 'src/app/shared/services/responsive.service';

@Component({
  selector: 'app-create-channel',
  templateUrl: './create-channel.component.html',
  styleUrls: ['./create-channel.component.scss'],
})
export class CreateChannelComponent {
  showLengthInfo!: boolean;
  maxNameLength: number = 20;

  constructor(
    public ws: WorkspaceService,
    public cs: ChannelService,
    public sis: SearchInputService,
    public us: UserService,
    public rs: ResponsiveService
  ) {
    this.showLengthInfo = false;
  }

  changeRadioButton() {
    return (this.ws.radioButtonFirst = this.ws.radioButtonFirst ? false : true);
  }

  onInput() {
    this.ws.inputName = this.ws.inputName.slice(0, this.maxNameLength); // Begrenzt auf 20 Zeichen
    this.sis.allFieldsFilled(this.us.userLoggedIn());
    this.showLengthInfo = this.ws.inputName.length === this.maxNameLength;

    setTimeout(() => {
      this.showLengthInfo = false;
    }, 10000);
  }

  preventParentClick(event: any) {
    event.stopPropagation();
  }
}
