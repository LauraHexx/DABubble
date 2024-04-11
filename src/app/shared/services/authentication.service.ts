import { getLocaleTimeFormat } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  sendPasswordResetEmail,
  updateEmail,
  getRedirectResult,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';

import {
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  where,
} from '@angular/fire/firestore';

import { confirmPasswordReset } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'src/app/models/user';
import { inject, Injectable } from '@angular/core';
import { ChannelService } from './channel.service';
import { MessageTime } from 'src/app/models/message-time';
import { Message } from 'src/app/models/message';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  firestore: Firestore = inject(Firestore);
  allUserCol = collection(this.firestore, 'allUsers');
  passwordLoginIsWrong: boolean = false;
  loggedUser: User = new User();
  loggedUserMail: string | null = '';
  loggedUserName: string | null = '';
  loggedUserOnline: boolean = false;
  googleLoginInProgress: boolean = false;
  loggedGoggleUser: User = new User();

  constructor(
    private userService: UserService,
    private cs: ChannelService,
    private router: Router
  ) {}

  /**
   * Signs up a new user with the provided user information and password.
   * Sends user information to the database after successful sign-up.
   * Logs in the user after sign-up.
   * @param {User} newUser - The user information for the new user.
   * @param {string} password - The password for the new user.
   */
  async signUp(newUser: User, password: string) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, newUser.email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        newUser.customId = user.uid;
        newUser.status = 'offline';
        newUser.chats = this.setDefaultMessage();
        // Create own Chat
        newUser.chats.push(
          this.createDefaultMessage(
            Date.now(),
            user.uid,
            'Eigener Chat. Ich bin einziger Empfänger.'
          )
        );
        this.userService.sendDocToDB(newUser);
      })
      .then(() => {
        this.login(newUser.email, password);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  /**
   * Sends a default message and updates the chat for the new user.
   * @returns {Message[]} - An array containing the sent default message.
   */
  setDefaultMessage() {
    let messageId = Date.now();
    let defaultUserId = 'dIff3pJzF8THciXEMLnjfJA9Zto2';
    let messageText = 'Hi, deine Präsentation war echt super!';

    // Nachricht bei eingeloggtem User speichern
    let defaultMessage = this.createDefaultMessage(
      messageId,
      defaultUserId,
      messageText
    );

    // Nachricht bei Default-User Sophia speichern
    this.userService.updateDefaultUser(
      { chats: [this.userService.getCleanMessageJson(defaultMessage)] },
      defaultUserId
    );

    return [defaultMessage];
  }

  createDefaultMessage(
    messageId: number,
    defaultUserId: string,
    messageText: string
  ) {
    return new Message(
      defaultUserId,
      messageId,
      messageText,
      this.cs.getCleanMessageTimeJson(
        new MessageTime(
          new Date().getDate(),
          this.cs.todaysDate(),
          this.cs.getTime()
        )
      )
    );
  }

  /**
   * Signs up a user using Google authentication.
   */
  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    this.googleLoginInProgress = true;
    signInWithRedirect(auth, provider);
  }

  /**
   * Retrieves user data from Google authentication.
   * Uses GoogleAuthProvider and Auth to get the user's information.
   * Checks if the user is new and updates the logged Google user details accordingly.
   * @returns {Promise<void>} - A promise that resolves when the user data retrieval is complete.
   */
  async getGoogleUserData() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    getRedirectResult(auth)
      .then((result) => {
        const user = result?.user;
        if (user) {
          this.loggedGoggleUser = new User();
          this.loggedGoggleUser.customId = user.uid || '';
          this.loggedGoggleUser.name = user.displayName || '';
          this.loggedGoggleUser.email = user.email || '';
          this.loggedGoggleUser.img =
            user.photoURL || 'assets/imgs/userMale3.png';
          this.checkIfNewGoogleUser(user.email);
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
      });
  }

  /**
   * Checks if the Google-authenticated user is new based on their email.
   * Queries the user collection with the provided email and adds the user if not found.
   * @param {string | null} emailToBeChecked - The email to be checked for new user status.
   */
  async checkIfNewGoogleUser(emailToBeChecked: string | null) {
    const qu = query(this.allUserCol, where('email', '==', emailToBeChecked));
    onSnapshot(qu, (querySnapshot) => {
      let existingUser: boolean = false;
      if (!existingUser) {
        querySnapshot.forEach((element) => {
          let foundUser: any = element.data();
          existingUser = true;
        });
      }
      if (!existingUser) this.addNewGoogleUser();
    });
  }

  /**
   * Adds a new Google-authenticated user to the database.
   * Initializes user chats with a default message and sends user data to the database.
   */
  addNewGoogleUser() {
    this.loggedGoggleUser.chats = this.setDefaultMessage();
    this.userService.sendDocToDB(this.loggedGoggleUser);
  }

  /**
   * Logs in a user with the provided email and password.
   * Navigates to the '/dashboard' route after successful login.
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @param {string | null} name - The name of the new signed user (can be a string or null).
   */
  login(email: string, password: string) {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.passwordLoginIsWrong = true;
      });
  }

  /**
   * Checks if a user is logged in and navigates to path.
   */
  async checkIfUserIslogged() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.loggedUserMail = user.email;
        this.loggedUserName = user.displayName;
        this.loggedUser.customId = user.uid;
        this.loggedUserOnline = true;
        this.userService.loggedInUser = this.loggedUser;
        this.setPathWhenLogged();
      } else {
        this.setPathWhenNotLogged();
      }
    });
  }

  /**
   * Sets the path when the user is logged in.
   * Navigates to '/dashboard/channel' if the current path does not contain 'dashboard'.
   */
  setPathWhenLogged() {
    if (!this.router.url.includes('dashboard')) {
      this.router.navigate(['/dashboard/channel']);
    }
    this.setOnlineStatus();
  }

  /**
   * Sets the online status for the logged-in user with a 2.5-second delay.
   * Updates the user's status to 'online' after the delay.
   */
  setOnlineStatus() {
    setTimeout(() => {
      this.userService.updateUser({ status: 'online' }, this.loggedUser);
    }, 2500);
  }

  /**
   * Sets the path when the user is not logged in.
   * Navigates to '/login' if the current path does not contain 'login'.
   */
  setPathWhenNotLogged() {
    if (!this.googleLoginInProgress && !this.router.url.includes('login')) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Logs out the currently authenticated user.
   */
  async logout() {
    await this.userService.updateUser({ status: 'offline' }, this.loggedUser);
    const auth = getAuth();
    signOut(auth)
      .then(() => {})
      .catch((error) => {});
  }

  /**
   * Sends a password reset email to the specified email address.
   * @param {string} email - The email address to send the password reset email to.
   */
  sendEmailToResetPw(email: string) {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {})
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  /**
   * Changes the password when the user is not logged in using the provided oobCode and newPassword.
   * @param {string} oobCode - The out-of-band code sent to the user's email for password reset.
   * @param {string} newPassword - The new password to set for the user.
   */
  async changePwWhenUserIsNotLogged(oobCode: string, newPassword: string) {
    const auth = getAuth();
    await confirmPasswordReset(auth, oobCode, newPassword);
    this.router.navigate(['/login']);
  }
}
