import { Injectable } from '@angular/core';
import { WorkspaceService } from 'src/app/shared/services/workspace.service';
import { AuthenticationService } from './authentication.service';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { UserService } from './user.service';
import { Channel } from 'src/app/models/channel';
import { Message } from 'src/app/models/message';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root',
})
export class DefaultDataService {
  defaultChannelData = [
    {
      name: 'Join',
      description: 'Canban Projekt',
      sendMessages: [
        {
          userId: 'P9SIuIe2MNcDzp4yJX5RgOFZ7pG2', //Laura
          message: 'lelele',
        },
        {
          userId: '7ddJZBGgkQd60XZoQshl3SAKfVs2', //Erika Musterfrau
          message: 'Hi',
        },
      ],
    },
    {
      name: 'El Pollo Loco',
      description: 'Game Project',
      sendMessages: [
        {
          userId: 'P9SIuIe2MNcDzp4yJX5RgOFZ7pG2', //Laura
          message: 'lelel',
        },
        {
          userId: 'P9SIuIe2MNcDzp4yJX5RgOFZ7pG2', //Max Mustermann
          message: 'was geht',
        },
        {
          userId: 'KvB7soOGc1fnyF8K3xjLvHHQy2N2', //John Doe
          message: 'was geht',
        },
      ],
    },
  ];

  defaultChannel: Channel | null = null;

  constructor(
    private channelService: ChannelService,
    private userService: UserService,
    private auth: AuthenticationService,
    private workspaceService: WorkspaceService
  ) {}

  /**
   * Asynchronously creates default channels.
   * For each channel in defaultChannelData, creates members based on sendMessages,
   * sets up a new Channel object, and sends it to the database.
   * @async
   */
  async createDefaultChannels() {
    this.defaultChannelData.forEach(async (channel) => {
      const members = await this.setMembers(channel.sendMessages);
      const newChannel = this.setChannel(channel, members);
      await this.channelService.sendDocToDB(newChannel);
    });
  }

  /**
   * Asynchronously creates members based on sendMessages.
   * @async
   * @param {any} sendMessages - Array of sendMessages.
   * @returns {Promise<Array<User>>} Array of members.
   */
  async setMembers(sendMessages: any) {
    const members: Array<User> = [];
    members.push(await this.userService.userLoggedIn());
    sendMessages.forEach(async (message: any) => {
      const currentMember = await this.userService.getUserBasedOnId(
        message.userId
      );
      if (this.membersDoenstExists(members, currentMember)) {
        members.push(currentMember);
      }
    });
    return members;
  }

  /**
   * Sets up a new Channel object based on provided channel data and members.
   * @param {any} channel - Channel data.
   * @param {Array<User>} members - Array of members.
   * @returns {Channel} New Channel object.
   */
  setChannel(channel: any, members: Array<User>) {
    return new Channel(
      '',
      channel.name,
      channel.description,
      members,
      this.channelService.todaysDate(),
      this.userService.userLoggedIn()
    );
  }

  /**
   * Checks if a member exists in the provided array of members.
   * @param {Array<User>} members - Array of members.
   * @param {User} currentMember - Member to check.
   * @returns {boolean} True if the member doesn't exist, otherwise false.
   */
  membersDoenstExists(members: Array<User>, currentMember: User) {
    return !members.includes(currentMember);
  }

  /*
  createDefaultChannelMessages(sendMessages): void {
    let newMessage: Message = {
      userCustomId: sendMessages.userId,
      messageId: Date.now(),
      message: this.workspaceService.separateLongWords(sendMessages.message),
      createdTime: this.channelService.getCleanMessageTimeJson(
        new MessageTime(
          new Date().getDate(),
          this.channelService.todaysDate(),
          this.channelService.getTime()
        )
      ),
      emojis: [{ path: '', amount: 0, setByUser: [''] }],
      threads: [],
    };
  }
  */
}
