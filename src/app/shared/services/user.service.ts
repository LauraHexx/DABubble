/**
 * UserService stellt Methoden für die Verwaltung von Benutzerdaten bereit.
 */
import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  updateDoc,
  setDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user';
import { Message } from 'src/app/models/message';
import { reload } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore: Firestore = inject(Firestore);
  allUserCol = collection(this.firestore, 'allUsers');
  myUsers: User[] = [];
  clickedContactId = new BehaviorSubject<string>('');
  clickedContact = new BehaviorSubject<User>(new User());
  loggedInUser!: User;

  allUsersForUserName: User[] = [];
  docIdCustomIdMatching: any = [];

  unsubUsers;

  /**
   * Initialisiert den Dienst, abonniert die Benutzerliste und die Liste aller Benutzer nach Benutzername.
   */
  constructor() {
    this.unsubUsers = this.subUserList();
    this.subAllUsersListFindUserName();
  }

  /**
   * Gibt den eingeloggten Benutzer zurück.
   * @returns Der eingeloggte Benutzer.
   */
  userLoggedIn(): User {
    return this.getUserFromCollection(this.loggedInUser);
  }

  /**
   * Abonniert die Liste der Benutzer.
   * Aktualisiert myUsers und docIdCustomIdMatching bei Änderungen.
   * @returns Die Funktion zum Beenden des Abonnements.
   */
  async subUserList() {
    const qu = query(collection(this.firestore, 'allUsers'));
    onSnapshot(qu, (querySnapshot) => {
      this.myUsers = [];
      querySnapshot.forEach((element) => {
        this.myUsers.push(this.setUserObject(element.data()));
        this.docIdCustomIdMatching.push({
          customId: element.data()['customId'],
          docId: element.id,
        });
        this.setCurrentContact(this.clickedContactId.value);
      });
    });
  }

  /**
   * Aktualisiert einen Benutzer in der Datenbank.
   * @param newValue - Die neuen Werte für den Benutzer.
   * @param user - Der zu aktualisierende Benutzer.
   */
  async updateUser(newValue: any, user: User) {
    let docRef = await this.getSingleDocRef('allUsers', user.customId);
    await updateDoc(docRef, newValue)
      .catch((err) => {
        console.error(err);
      })
      .then(() => {
        return;
      });
  }

  /**
   * Aktualisiert den Standardbenutzer in der Datenbank.
   * @param newValue - Die neuen Werte für den Benutzer.
   * @param customId - Die benutzerdefinierte ID des zu aktualisierenden Benutzers Sophia.
   */
  async updateDefaultUser(newValue: any, customId: string) {
    let docRef = this.getSingleDocRef('allUsers', customId);
    await updateDoc(docRef, newValue)
      .catch((err) => {
        console.error(err);
      })
      .then(() => {
        return;
      });
  }

  /**
   * Gibt die Firestore-Referenz für ein bestimmtes Dokument zurück.
   * @param colId - Die Sammlungs-ID.
   * @param docId - Die Dokument-ID.
   * @returns Die Firestore-Referenz für das Dokument.
   */
  getSingleDocRef(colId: string, docId: string) {
    let realDocId = this.getRealDocId(docId);
    return doc(collection(this.firestore, colId), realDocId);
  }

  /**
   * Sucht den Benutzer in der myUsers-Liste basierend auf seiner customId.
   * @param loggedInUser - Der eingeloggte Benutzer.
   * @returns Der gefundene Benutzer.
   */
  getUserFromCollection(loggedInUser: User): User {
    for (let index = 0; index < this.myUsers.length; index++) {
      const user = this.myUsers[index];
      if (user.customId == loggedInUser.customId) {
        return user;
      }
    }
    return new User();
  }

  /**
   * Anhand der customId (Parameter docId) des Users, welche ihm aus Authentification übergeben wurde
   * Ermittelt die tatsächliche Dokument-ID aus der Matching-Tabelle.
   * @param docId - Die Dokument-ID aus der Matching-Tabelle.
   * @returns Die tatsächliche Dokument-ID.
   */
  getRealDocId(docId: string) {
    const realDocId = this.docIdCustomIdMatching.find(
      (val: any) => val['customId'] === docId
    );
    return realDocId ? realDocId['docId'] : '';
  }

  /**
   * Setzt den aktuell ausgewählten Kontakt.
   * Aktualisiert das clickedContact-Verhalten basierend auf der geklickten Kontakt-ID.
   * @param elementId - Die benutzerdefinierte ID des ausgewählten Kontakts.
   */
  setCurrentContact(elementId: string) {
    const userList = this.myUsers;
    if (this.myUsers) {
      for (let index = 0; index < userList.length; index++) {
        // wenn es sich um den aktuell angezeigten Contact handelt...
        if (elementId == userList[index]['customId']) {
          this.clickedContact.next(userList[index]);
        }
      }
    }
  }

  /**
   * Aktualisiert die Ansicht für den ausgewählten Kontakt.
   * @param id - Die benutzerdefinierte ID des ausgewählten Kontakts.
   */
  setContactView(id: string) {
    this.clickedContactId.next(id);
    this.setCurrentContact(this.clickedContactId.value);
  }

  setUserObject(obj: any): User {
    return new User(
      obj.customId,
      obj.name,
      obj.email,
      obj.img,
      obj.chats,
      obj.status
    );
  }

  getCleanUserJson(user: User): {} {
    return {
      customId: user.customId,
      name: user.name,
      email: user.email,
      img: user.img || '',
      chats: this.getCleanMessageArrayJson(user.chats || [new Message()]) || [
        {},
      ],
      status: user.status,
    };
  }

  getCleanMessageArrayJson(messages: Message[]): {} {
    return messages.map((message) => this.getCleanMessageJson(message));
  }

  getCleanMessageJson(message: Message): {} {
    return {
      userCustomId: message.userCustomId || '',
      messageId: message.messageId || 0,
      message: message.message || '',
      createdTime: message.createdTime || '',
      emojis: message.emojis || {},
      threads: message.threads || [],
      file: message.file || '',
    };
  }

  async sendDocToDB(item: User) {
    await addDoc(this.allUserCol, this.getCleanUserJson(item));
  }

  subAllUsersListFindUserName() {
    const q = collection(this.firestore, 'allUsers');
    return onSnapshot(q, (list) => {
      this.allUsersForUserName = [];
      list.forEach((element) => {
        this.allUsersForUserName.push(this.setUserObject(element.data()));
      });
    });
  }

  /**
   * Es werden nur Nachrichten angezeigt die (a) ich clickedContact verschickt habe oder (b) die clickedContact an mich verschickt hat und
   * deren messageId bei mir existiert (damit nicht Nachrichten bei mir von clickedContact angezeigt werden, die er an andere User verschickt hat)
   * @returns Ein Array von Chats mit dem ausgewählten Benutzer.
   */
  chatsWithClickedUser() {
    let chats;
    let userLoggedInCustomId = this.userLoggedIn().customId;
    // Bei eigenen Chat nur ausgehende Nachrichten
    if (this.clickedContact.value.customId === userLoggedInCustomId) {
      chats = this.clickedContact.value.chats?.filter((chat) =>
        this.onlyOwnChat(chat.messageId)
      );
      // Bei allen anderen Chats
    } else {
      chats = this.clickedContact.value.chats?.filter(
        (chat) =>
          // Nachricht von eingeloggtem User
          chat.userCustomId == userLoggedInCustomId ||
          // Nachricht von angeklicktem Contact
          (chat.userCustomId == this.clickedContact.value.customId &&
            this.messageExitsInOwnChats(chat.messageId)!)
      );
    }

    return chats;
  }

  /**
   * Überprüft, ob eine Nachricht in den eigenen Chats existiert.
   * @param messageIdToCheck - Die Nachrichten-ID zum Überprüfen.
   * @returns True, wenn die Nachricht in den eigenen Chats existiert, sonst False.
   */
  messageExitsInOwnChats(messageIdToCheck: number) {
    return this.userLoggedIn().chats?.find(
      (chat) => chat.messageId == messageIdToCheck
    );
  }

  /**
   * Überprüft, ob es sich bei einer Nachricht um einen eigenen Chat handelt.
   * @param ownMessageId - Die Nachrichten-ID für den eigenen Chat.
   * @returns True, wenn es sich um einen eigenen Chat handelt, sonst False.
   */
  onlyOwnChat(ownMessageId: number): boolean {
    return this.myUsers.every((user) => {
      return !user.chats?.some((chat) => {
        return (
          chat.messageId === ownMessageId &&
          user.customId !== this.userLoggedIn().customId
        );
      });
    });
  }

  /**
   * Gibt den Benutzernamen für eine bestimmte Benutzer-ID zurück.
   * @param userCustomId - Die benutzerdefinierte ID des Benutzers.
   * @returns Der Benutzername oder 'loading', wenn der Benutzer nicht gefunden wird.
   */
  getUserName(userCustomId: string) {
    let user = this.allUsersForUserName.find(
      (user) => user.customId === userCustomId
    );
    return user ? user.name : 'loading';
  }

  /**
   * Gibt den Bildpfad für das Benutzerbild basierend auf der Benutzer-ID zurück.
   * @param userCustomId - Die benutzerdefinierte ID des Benutzers.
   * @returns Der Default-Bildpfad oder 'assets/imgs/person.png', wenn der Benutzer nicht gefunden wird.
   */
  getUserImage(userCustomId: string) {
    let user = this.myUsers.find((user) => user.customId === userCustomId);
    return user ? user.img : 'assets/imgs/person.png';
  }

  /**
   * Gibt den Online-Status für einen Benutzer basierend auf seiner Benutzer-ID zurück.
   * @param userCustomId - Die benutzerdefinierte ID des Benutzers.
   * @returns Der Online-Status oder 'offline', wenn der Benutzer nicht gefunden wird.
   */
  getUserOnlineStats(userCustomId: string) {
    let user = this.myUsers.find((user) => user.customId === userCustomId);
    return user ? user.status : 'offline';
  }
}
