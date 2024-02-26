import { Component, ElementRef, ViewChild } from '@angular/core';
import { getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { Channel } from 'src/app/models/channel';
import { Message } from 'src/app/models/message';
import { MessageTime } from 'src/app/models/message-time';

import { ChannelService } from 'src/app/shared/services/channel.service';
import { InputService } from 'src/app/shared/services/input.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { UserService } from 'src/app/shared/services/user.service';
import { WorkspaceService } from 'src/app/shared/services/workspace.service';

@Component({
  selector: 'app-input-field-channel',
  templateUrl: './input-field-channel.component.html',
  styleUrls: ['./input-field-channel.component.scss'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class InputFieldChannelComponent {
  @ViewChild('fileInput') fileInput!: any;
  private fileInputRef: HTMLInputElement | undefined;
  showEmojis: boolean = false;
  showUserList: boolean = false;
  allMembers: any = [];
  clickedChannel!: Channel;
  allMessages: any = [];
  input: any = '';
  isInputSelected: boolean = false;
  selectedFile: File | null = null;
  imageUrls: string[] = [];
  url: any;
  loader: boolean = false;

  constructor(
    public service: InputService,
    public cs: ChannelService,
    private us: UserService,
    private _eref: ElementRef,
    public storService: StorageService,
    private ws: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.getCurrentChannel();
    this.ws.getEnterKeyPress().subscribe((event) => {
      this.sendMessage();
    });
  }

  ngAfterViewInit() {
    this.ws.setAutofocus('inputChannel');
  }

  fileExplorer(event: any): void {
    this.fileInputRef = event.target as HTMLInputElement;
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const selectedFile = inputElement.files[0];
      this.selectedFile = selectedFile;
      this.btnVisible();
      this.storService.uploadToStorage(this.selectedFile);
      this.endLoading();
    }
  }

  endLoading() {
    this.loader = true;
    setTimeout(() => {
      this.loader = false;
    }, 1200);
  }

  sendMessage(): void {
    if (this.input !== '' || this.selectedFile) {
      let newMessage: Message = {
        userCustomId: this.us.userLoggedIn().customId,
        messageId: Date.now(),
        message: this.ws.separateLongWords(this.input),
        createdTime: this.cs.getCleanMessageTimeJson(
          new MessageTime(
            new Date().getDate(),
            this.cs.todaysDate(),
            this.cs.getTime()
          )
        ),
        emojis: [{ path: '', amount: 0, setByUser: [''] }],
        threads: [],
        // ↓ file already uploaded
        file: this.storService.getUrlFromStorage(),
      };

      this.cs.sendMessageToDB(newMessage, this.clickedChannel.customId);
      this.ws.scrollToBottom('scrollChannelMessages');
    }

    this.addMemberToChannel(this.cs.clickedChannel.value);
    this.clearAll();
  }

  clearAll() {
    this.clearFileInput();
    this.clearSelectedFile();
    this.btnNotVisible();
    this.clearInput();
    this.clearUrl();
    this.service.inputFilled = false;
  }
  clearUrl() {
    this.storService.channelCurrentUrl = '';
  }

  clearFileInput() {
    if (this.fileInputRef) {
      this.fileInputRef.value = '';
    }
  }

  clearSelectedFile() {
    this.selectedFile = null;
  }

  inputIsFilled() {
    if (this.input !== '') {
      this.service.inputFilled = true;
    } else {
      this.service.inputFilled = false;
    }
  }

  // fills allMembers array with all users in the current channel
  getCurrentChannel() {
    this.cs.clickedChannel.subscribe((ch: Channel) => {
      this.clickedChannel = ch;
      this.allMembers = [];
      this.allMembers.push(this.clickedChannel.members);
    });
  }

  // adds a new member from current channel to the current input field
  collectMemberFromList(item: any) {
    this.input += '@' + item;
    this.closeShowUserList();
  }

  closeShowUserList() {
    this.showUserList = false;
  }

  clearInput() {
    this.input = '';
  }

  getFileName(): string | null {
    if (this.selectedFile) {
      return this.selectedFile.name;
    }
    return null;
  }

  addMemberToChannel(clickedChannel: Channel) {
    this.cs.updateChannel(
      { members: this.getAllMembersOfChannel(clickedChannel) },
      clickedChannel
    );
  }

  getAllMembersOfChannel(forChannel: Channel) {
    let allMembers = [];
    let alreadyMember = false;
    for (let index = 0; index < forChannel.members!.length; index++) {
      const member = forChannel.members![index];
      allMembers.push(member);
      if (member.customId === this.us.userLoggedIn().customId) {
        alreadyMember = true;
      }
    }
    // logged User nur als Member im Channel eintragen, wenn er noch nicht Member ist
    if (!alreadyMember) {
      allMembers.push(this.us.getCleanUserJson(this.us.userLoggedIn()));
    }

    return allMembers;
  }

  addEmoji($event: any) {
    this.input += $event.emoji.native;
    this.showEmojis = !this.showEmojis;
  }

  toggleBtn(target: string) {
    this.showEmojis = target === 'emojis' ? !this.showEmojis : false;
    this.showUserList = target === 'userList' ? !this.showUserList : false;
  }

  onClick(event: { target: any }) {
    if (!this._eref.nativeElement.contains(event.target)) this.closeAllDivs();
  }

  closeAllDivs() {
    this.showEmojis = false;
    this.showUserList = false;
  }

  btnVisible(): void {
    this.service.isWritingChannel = true;
  }
  btnNotVisible(): void {
    this.service.isWritingChannel = false;
  }
}
