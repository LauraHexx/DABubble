import { Component, inject } from '@angular/core';
// import { Channel } from 'src/app/interfaces/channel';
import { Channel } from 'src/app/models/channel';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { UserService } from 'src/app/shared/services/user.service';

import { Firestore } from '@angular/fire/firestore';
import { User } from 'src/app/models/user';
import { Message } from 'src/app/models/message';
import { ResponsiveService } from 'src/app/shared/services/responsive.service';
import { WorkspaceService } from 'src/app/shared/services/workspace.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-side-left',
  templateUrl: './side-left.component.html',
  styleUrls: ['./side-left.component.scss'],
})
export class SideLeftComponent {
  firestore: Firestore = inject(Firestore);
  arrowClickedChannels: boolean = false;
  arrowClickedContacts: boolean = true;
  rightArrowChannels: boolean = false;
  rightArrowContacts: boolean = false;
  notExpired: boolean = true;

  myUserId: any = [];

  constructor(
    public us: UserService,
    public ws: WorkspaceService,
    public cs: ChannelService,
    public respService: ResponsiveService,
    public auth: AuthenticationService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.notExpired = false;
    }, 10000);
  }

  showHints() {
    return this.notExpired && this.ws.getUsers().length === 1;
  }

  clickDownArrowChannels() {
    this.arrowClickedChannels = this.rightArrowChannels =
      !this.arrowClickedChannels;

    if (this.arrowClickedContacts) {
      this.arrowClickedContacts = !this.arrowClickedChannels; // Direktnachrichten-Ansicht schließen, wenn Channels-Ansicht geöffnet
    }
  }

  clickDownArrowContacts() {
    this.arrowClickedContacts = this.rightArrowContacts =
      !this.arrowClickedContacts;
    if (this.arrowClickedChannels) {
      this.arrowClickedChannels = !this.arrowClickedContacts; // Channels-Ansicht schließen, wenn Direktnachrichten-Ansicht geöffnet
    }
  }

  setChannel(cn: Channel) {
    this.cs.setChannelView(cn.customId);
    this.cs.getAllMessagesFromChannel(cn.customId);
    this.ws.scrollToBottom('scrollChannelMessages');
    this.ws.setAutofocus('inputChannel');
  }

  async setContact(user: User) {
    this.us.setContactView(user.customId);
    this.ws.scrollToBottom('scrollDirectMessages');
  }
}
