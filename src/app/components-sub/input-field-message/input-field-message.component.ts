import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from 'src/app/models/message';
import { MessageTime } from 'src/app/models/message-time';
import { User } from 'src/app/models/user';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { InputService } from 'src/app/shared/services/input.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { UserService } from 'src/app/shared/services/user.service';
import { WorkspaceService } from 'src/app/shared/services/workspace.service';

@Component({
  selector: 'app-input-field-message',
  templateUrl: './input-field-message.component.html',
  styleUrls: ['./input-field-message.component.scss'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class InputFieldMessageComponent {
  clickedContact!: User;
  input: string = '';
  isInputSelected: boolean = false;
  showEmojis: boolean = false;
  showUserList: boolean = false;
  private fileInputRef: HTMLInputElement | undefined;
  selectedFile: File | null = null;
  loader: boolean = false;

  constructor(
    private router: Router,
    public service: InputService,
    public us: UserService,
    private cs: ChannelService,
    public ws: WorkspaceService,
    private _eref: ElementRef,
    public storService: StorageService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();

    this.ws.getEnterKeyPress().subscribe((event) => {
      // sendDirectMessage aufrufen, wenn die Enter-Taste gedrückt wird
      if (this.router.url === '/dashboard/new-message') {
        this.router.navigate(['dashboard', 'message']);
      }
      this.sendDirectMessage();
    });
  }

  ngAfterViewInit() {
    this.ws.setAutofocus('inputMessage');
  }

  getCurrentUser() {
    this.us.clickedContact.subscribe((user: User) => {
      this.clickedContact = user;
    });
  }

  sendDirectMessage() {
    if (this.input !== '' || this.selectedFile) {
      let messageId = Date.now();
      // Nachricht bei Empfänger hinterlegen
      this.us.updateUser(
        { chats: this.getAllChatsOfUser(this.clickedContact, messageId) },
        this.clickedContact
      );
      // Nachricht bei Sender hinterlegen
      this.us.updateUser(
        { chats: this.getAllChatsOfUser(this.us.userLoggedIn(), messageId) },
        this.us.userLoggedIn()
      );
      this.clearAll();
      this.ws.scrollToBottom('scrollDirectMessages');
    }
  }

  getAllChatsOfUser(forUser: User, messageId: number) {
    let allChats = [];

    for (let index = 0; index < forUser.chats!.length; index++) {
      const chat = forUser.chats![index];
      allChats.push(chat);
    }
    allChats.push(this.addNewMessage(messageId));

    return allChats;
  }

  clearAll() {
    this.clearFileInput();
    this.clearSelectedFile();
    this.btnNotVisible();
    this.clearInput();
    this.clearUrl();
    this.service.inputFilled = false;
  }

  // clean help-functions
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

  clearInput() {
    this.input = '';
  }
  //

  // added try and finally because (variables have to be cleared) after return...
  addNewMessage(messageId: number) {
    try {
      return this.us.getCleanMessageJson(
        new Message(
          this.us.userLoggedIn().customId,
          messageId,
          this.ws.separateLongWords(this.input),
          this.cs.getCleanMessageTimeJson(
            new MessageTime(
              new Date().getDate(),
              this.cs.todaysDate(),
              this.cs.getTime()
            )
          ),
          [{ path: '', amount: 0, setByUser: [''] }],
          [
            {
              userCustomId: '',
              messageId: 0,
              answer: '',
              emojis: [{ path: '', amount: 0, setByUser: [''] }],
              createdTime: 0,
            },
          ],
          this.storService.getUrlFromStorage()
        )
      );
    } catch (err) {
      return;
    }
  }

  // Für emojis und @
  addEmoji($event: any) {
    this.input += $event.emoji.native;
    this.showEmojis = !this.showEmojis;
  }

  toggleBtn(target: string) {
    this.showEmojis = target === 'emojis' ? !this.showEmojis : false;
    this.showUserList = target === 'userList' ? !this.showUserList : false;
  }

  openFileExplorer() {
    // console.log('openFileExplorer');
  }

  closeAllDivs() {
    this.showEmojis = false;
    this.showUserList = false;
  }

  onClick(event: { target: any }) {
    if (!this._eref.nativeElement.contains(event.target)) this.closeAllDivs();
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
  btnVisible(): void {
    this.service.isWritingMessage = true;
  }
  btnNotVisible(): void {
    this.service.isWritingMessage = false;
  }
}
